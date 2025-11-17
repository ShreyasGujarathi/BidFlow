import { Schema, model, Document, Types } from "mongoose";

export type NotificationType =
  | "bid_outbid"
  | "bid_won"
  | "bid_received"
  | "auction_live"
  | "auction_completed"
  | "system";

export interface INotification {
  user: Types.ObjectId;
  type: NotificationType;
  message: string;
  read: boolean;
  metadata?: Record<string, unknown>;
}

export interface INotificationDocument
  extends INotification,
    Document<Types.ObjectId> {}

const notificationSchema = new Schema<INotificationDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "bid_outbid",
        "bid_won",
        "bid_received",
        "auction_live",
        "auction_completed",
        "system",
      ],
      default: "system",
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, read: 1 });

export const Notification = model<INotificationDocument>(
  "Notification",
  notificationSchema
);

