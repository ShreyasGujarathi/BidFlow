import bcrypt from "bcryptjs";
import { Schema, model, Document, Types } from "mongoose";

export type UserRole = "buyer" | "seller" | "admin";

export interface IUser {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  avatarUrl?: string;
  walletBalance: number;
  blockedBalance: number;
}

export interface IUserDocument extends IUser, Document<Types.ObjectId> {
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer",
    },
    avatarUrl: String,
    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    blockedBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUserDocument>("User", userSchema);

