/** @format */

import mongoose, { Document, model } from 'mongoose';

export interface ISuperUser extends Document {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}
const Schema = mongoose.Schema;

const superUserSchema = new Schema<ISuperUser>(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true, collection: 'superUsers' }
);

const SuperUser = model<ISuperUser>('SuperUser', superUserSchema);
export default SuperUser;
