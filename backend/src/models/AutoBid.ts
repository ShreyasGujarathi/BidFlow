import { Schema, model, Document, Types } from "mongoose";

export interface IAutoBid {
  auction: Types.ObjectId;
  user: Types.ObjectId;
  maximumBid: number;
  currentBidAmount: number; // Track the last bid placed by this auto-bid
  isActive: boolean;
}

export interface IAutoBidDocument extends IAutoBid, Document<Types.ObjectId> {}

const autoBidSchema = new Schema<IAutoBidDocument>(
  {
    auction: {
      type: Schema.Types.ObjectId,
      ref: "AuctionItem",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    maximumBid: {
      type: Number,
      required: true,
      min: 0,
    },
    currentBidAmount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Ensure one auto-bid per user per auction
autoBidSchema.index({ auction: 1, user: 1 }, { unique: true });

export const AutoBid = model<IAutoBidDocument>("AutoBid", autoBidSchema);

