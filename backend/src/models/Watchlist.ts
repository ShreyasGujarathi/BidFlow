import { Schema, model, Document, Types } from "mongoose";

export interface IWatchlist {
  user: Types.ObjectId;
  auction: Types.ObjectId;
}

export interface IWatchlistDocument extends IWatchlist, Document<Types.ObjectId> {}

const watchlistSchema = new Schema<IWatchlistDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    auction: {
      type: Schema.Types.ObjectId,
      ref: "AuctionItem",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Ensure one watchlist entry per user per auction
watchlistSchema.index({ user: 1, auction: 1 }, { unique: true });

export const Watchlist = model<IWatchlistDocument>("Watchlist", watchlistSchema);

