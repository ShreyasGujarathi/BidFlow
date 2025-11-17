import { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../utils/jwt";
import { User } from "../models/User";
import { ForbiddenError, UnauthorizedError } from "../utils/errors";

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      authHeader?.startsWith("Bearer ")
        ? authHeader.substring(7)
        : req.cookies?.token;

    if (!token) {
      throw new UnauthorizedError();
    }

    const payload = verifyJwt(token);
    const user = await User.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedError();
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRoles =
  (...roles: Array<"buyer" | "seller" | "admin">) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError());
    }
    next();
  };

