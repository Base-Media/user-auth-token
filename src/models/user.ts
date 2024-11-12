/** @format */

import mongoose, { Document, Schema, model } from 'mongoose';

// Interface for User schema
export interface IUser extends Document {
  firstname: string;
  lastname: string;
  username: string;
  fullName?: string;
  email: string;
  role: 'Admin' | 'Agent' | 'Custo';
  officeId?: mongoose.Types.ObjectId;
  officeName?: string;
  division?: Array<'U65' | 'ACA'>;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the User schema
const userSchema = new Schema<IUser>(
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
    fullName: {
      type: String,
      required: false,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['Admin', 'Agent', 'Custo'],
    },
    officeId: {
      type: Schema.Types.ObjectId,
      ref: 'Office', // Adjust based on your office collection name
      required: false,
    },
    officeName: {
      type: String,
      required: false,
    },
    division: {
      type: [String],
      required: false,
      enum: ['U65', 'ACA'],
    },
  },
  { timestamps: true }
);

// Pre-save hook to modify fields before saving
userSchema.pre('save', async function (next) {
  try {
    // Convert firstname and lastname to lowercase
    this.firstname = this.firstname.toLowerCase();
    this.lastname = this.lastname.toLowerCase();
    this.fullName = `${this.firstname} ${this.lastname}`;

    // Only validate officeId if role is not 'Custo'
    next(); // Proceed if no errors
  } catch (error: any) {
    console.error('Error during user save:', error);
    next(error);
  }
});

// Create and export the User model
const User = model<IUser>('User', userSchema);
export default User;
