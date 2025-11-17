import { Request, Response } from "express";
import { User } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";
import { ok } from "../utils/apiResponse";
import { signJwt } from "../utils/jwt";
import { UnauthorizedError } from "../utils/errors";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error("Email already in use");
  }

  // Default all new users to "buyer" role (but they can both buy and sell)
  const user = await User.create({ username, email, password, role: "buyer" });
  const token = signJwt(user);

  res.json(
    ok({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    })
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const token = signJwt(user);
  res.json(
    ok({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    })
  );
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  res.json(
    ok({
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
    })
  );
});

