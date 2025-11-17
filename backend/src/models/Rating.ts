import { Schema, model, Document, Types } from "mongoose";

export type RatingValue = 1 | 2 | 3 | 4 | 5;

export interface IRating {
  ratedUser: Types.ObjectId; // User being rated
  ratedBy: Types.ObjectId; // User giving the rating
  rating: RatingValue;
  comment?: string;
  auctionId?: Types.ObjectId; // Optional: reference to auction that triggered this rating
}

export interface IRatingDocument extends IRating, Document<Types.ObjectId> {}

const ratingSchema = new Schema<IRatingDocument>(
  {
    ratedUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    ratedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      enum: [1, 2, 3, 4, 5],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    auctionId: {
      type: Schema.Types.ObjectId,
      ref: "AuctionItem",
    },
  },
  { timestamps: true }
);

// Prevent duplicate ratings from same user (one rating per user per rated user)
ratingSchema.index({ ratedUser: 1, ratedBy: 1 }, { unique: true });
ratingSchema.index({ ratedUser: 1, rating: 1 });

export const Rating = model<IRatingDocument>("Rating", ratingSchema);

