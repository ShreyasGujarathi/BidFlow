import { Notification, NotificationType } from "../models/Notification";
import { Types } from "mongoose";
import { getIo } from "../config/socket";

export const sendNotification = async (
  userId: Types.ObjectId,
  type: NotificationType,
  message: string,
  metadata: Record<string, unknown> = {}
) => {
  const notification = await Notification.create({
    user: userId,
    type,
    message,
    metadata,
  });

  const createdAt =
    notification.get("createdAt") ??
    (notification as unknown as { createdAt?: Date }).createdAt ??
    new Date();

  try {
    const io = getIo();
    io.to(`user:${userId}`).emit("notification:new", {
      id: notification._id,
      type,
      message,
      metadata,
      createdAt,
    });
  } catch {
    // socket server not initialized, ignore
  }

  return notification;
};

export const getUserNotifications = async (userId: Types.ObjectId) => {
  return Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(50);
};

export const markNotificationsRead = async (
  userId: Types.ObjectId,
  notificationIds?: Types.ObjectId[]
) => {
  const filter = {
    user: userId,
    ...(notificationIds ? { _id: { $in: notificationIds } } : {}),
  };
  await Notification.updateMany(filter, { $set: { read: true } });
};

