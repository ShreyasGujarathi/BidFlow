import { Schema, model, Document, Types } from "mongoose";

export interface IBid {
  amount: number;
  bidder: Types.ObjectId;
  auction: Types.ObjectId;
  blockedAmount: number; // Amount blocked for this specific bid
  createdAt?: Date;
}

export interface IBidDocument extends IBid, Document<Types.ObjectId> {}

const bidSchema = new Schema<IBidDocument>(
  {
    amount: { type: Number, required: true },
    bidder: { type: Schema.Types.ObjectId, ref: "User", required: true },
    auction: { type: Schema.Types.ObjectId, ref: "AuctionItem", required: true },
    blockedAmount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

bidSchema.index({ auction: 1, amount: -1 });
bidSchema.index({ bidder: 1, auction: 1, blockedAmount: 1 }); // For wallet balance queries

export const Bid = model<IBidDocument>("Bid", bidSchema);

