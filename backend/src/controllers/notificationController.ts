import { Request, Response } from "express";
import {
  getUserNotifications,
  markNotificationsRead,
} from "../services/notificationService";
import { asyncHandler } from "../utils/asyncHandler";
import { ok } from "../utils/apiResponse";

export const listNotificationsController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("Unauthorized");
    }
    const notifications = await getUserNotifications(req.user._id);
    res.json(ok(notifications));
  }
);

export const markNotificationsController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("Unauthorized");
    }
    const ids = req.body.ids;
    await markNotificationsRead(req.user._id, ids);
    res.json(ok(true));
  }
);

