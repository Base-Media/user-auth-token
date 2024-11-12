/** @format */

import { authenticateToken } from '../src/index';

// Your real Bearer token
const realToken = `Bearer eyJraWQiOiJic1FJUjFMSnY5SjJOd3RHZ0czVFZSXC9tTUtNYjhIUWxuYmZGdGlRTVN2TT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIyZjg1OTYzOC1hZDQwLTQ1NjAtOWZhYS0xN2E4Y2I2ZWVjNWQiLCJjb2duaXRvOmdyb3VwcyI6WyJBZG1pbiJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0yLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMl8yNGt1ak1GYVkiLCJjbGllbnRfaWQiOiI2MTBzZGViY2pxZ29uazA1bjEzMXJ2ZWZnMSIsIm9yaWdpbl9qdGkiOiIwMjA0ZjhkYi0xOTZkLTQwYmUtYmEyNC03MTk4Yzk3OGM1NjYiLCJldmVudF9pZCI6IjM0YzFlMzZiLWZlNzctNDEyMy1iZTJlLTU2ZTA2ZGU2NjE5NSIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE3MzE0NDcwMTIsImV4cCI6MTczMTUzMzQxMSwiaWF0IjoxNzMxNDQ3MDEyLCJqdGkiOiIwMjE3ZDQxMS1jNjgxLTQwNzUtYmQxNi1hYTFjZjc4NmI2ZGEiLCJ1c2VybmFtZSI6ImNsYW1hcnJlIn0.ojKUK06sT9xfz7r6VDKWM-9BEqh9E1cKtvgE0zSrsagu6K0JbVZtm4SQT-73sOuH3-RNgI2VLMnIhHx95-q1Psyoym36IXP3dGPvXcD5CcbSb3_g-c2czkqdQKLCFNcL3GDgEhl3BPBMJxc2lUfa-L0nBDifHprgBtD4br7A-y7wARaQumfHzdlAtdCj9zE5BqO-eqDq-5SzkoYPeRhc7M1Ijm3Br2dvnTq3wsbBhCspA5NcvfsL106GOHg5PMUaDSuh4_LZH0mgRbY_28R5-h9EqR3dPpWFoBNaKdnuOV00Qe4jwvk_sCXEHUDk2IQPab_k51qGzR5yi8Uni622Gw`;

describe('Token Authentication', () => {
  it('should authenticate successfully with a valid authorization header', async () => {
    const headers = {
      authorization: realToken, // Use the real Bearer token
    };

    await authenticateToken(
      headers,
      (userDetails) => {
        console.log('User Details:', userDetails);
        expect(userDetails).toBeDefined();
        expect(userDetails.username).toBe('clamarre');
        expect(userDetails.officeId.toString()).toBe(
          '66482399814023a5aa0e0280'
        );
      },
      (statusCode, message) => {
        throw new Error(`Unexpected error: ${statusCode} ${message}`);
      }
    );
  });

  it('should throw an error if no authorization header is provided', () => {
    const headers = {}; // Simulating no authorization header

    authenticateToken(
      headers,
      (userDetails) => {
        throw new Error('Expected function to throw');
      },
      (statusCode, message) => {
        expect(statusCode).toBe(401);
        expect(message).toBe('Authorization header required');
      }
    );
  });
});
