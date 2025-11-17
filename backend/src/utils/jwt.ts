import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { IUserDocument } from "../models/User";

export interface JwtPayload {
  userId: string;
  role: string;
}

export const signJwt = (user: IUserDocument): string => {
  const payload: JwtPayload = {
    userId: user._id.toString(),
    role: user.role,
  };

  const options: SignOptions = {};
  if (env.jwtExpiresIn) {
    options.expiresIn = env.jwtExpiresIn as NonNullable<SignOptions["expiresIn"]>;
  }

  return jwt.sign(payload, env.jwtSecret, options);
};

export const verifyJwt = (token: string): JwtPayload => {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
};

