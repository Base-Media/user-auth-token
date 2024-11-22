/** @format */
import mongoose from 'mongoose';
import jwt, { JwtPayload } from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import axios from 'axios';
import SuperUser from './models/superUser';
import User from './models/user';

const jwksUrl =
  'https://cognito-idp.us-east-2.amazonaws.com/us-east-2_24kujMFaY/.well-known/jwks.json';
const tokenCache: Record<string, any> = {};
let jwksCache: any = null;

let synergyConnection: mongoose.Connection | null = null;

/**
 * Create and cache a connection to the synergyDashboard database.
 */
const getSynergyConnection = async () => {
  if (!synergyConnection) {
    try {
      synergyConnection = mongoose.createConnection(
        'mongodb+srv://claude_lamarre:Master7001@synergydash-prod-01.amkflq9.mongodb.net/synergyDashboard',
        {}
      );
      console.log('Connected to synergyDashboard database');
    } catch (error) {
      console.error('Failed to connect to synergyDashboard database:', error);
      throw new Error('Database connection error');
    }
  }
  return synergyConnection;
};

// Fetch and cache JWKS
const getJwks = async () => {
  if (!jwksCache) {
    const response = await axios.get(jwksUrl);
    jwksCache = response.data.keys;
  }
  return jwksCache;
};

// Convert JWK to PEM
const getPemFromJwk = async (header: jwt.JwtHeader): Promise<string> => {
  const jwks = await getJwks();
  const jwk = jwks.find((key: any) => key.kid === header.kid);
  if (!jwk) throw new Error('Unable to find matching JWK');
  return jwkToPem(jwk);
};

// Main authenticateToken function
export const authenticateToken = async (
  headers: { authorization?: string },
  onSuccess: (userDetails: any) => void,
  onError: (statusCode: number, message: string) => void
) => {
  const authorization = headers.authorization;
  if (!authorization) return onError(401, 'Authorization header required');

  const [scheme, accessToken] = authorization.split(' ');
  if (scheme !== 'Bearer' || !accessToken)
    return onError(401, 'Bearer token required');

  try {
    // Establish connection to the synergyDashboard database
    const synergyConnection = await getSynergyConnection();

    // Check token cache
    if (tokenCache[accessToken]) {
      return onSuccess(tokenCache[accessToken]);
    }

    const decodedToken = jwt.decode(accessToken, { complete: true });
    if (!decodedToken || !decodedToken.header)
      throw new Error('Invalid token format');

    const pem = await getPemFromJwk(decodedToken.header);
    jwt.verify(
      accessToken,
      pem,
      { algorithms: ['RS256'] },
      async (err, decoded) => {
        if (err) return onError(401, 'Invalid or expired token');

        const username = (decoded as JwtPayload).username;

        // Query using the connection
        const UserModel = synergyConnection.model('User', User.schema);
        const SuperUserModel = synergyConnection.model(
          'SuperUser',
          SuperUser.schema
        );

        let userDetails =
          (await UserModel.findOne({ username }).lean()) ||
          (await SuperUserModel.findOne({ username }).lean());

        if (!userDetails) return onError(404, 'User not found in database');

        // Cache user details and call success callback
        tokenCache[accessToken] = userDetails;

        onSuccess(userDetails);
      }
    );
  } catch (error) {
    console.error('Token validation error:', error);
    onError(500, 'Internal server error during token validation');
  }
};
