import { Schema, model, Document, Types } from "mongoose";

export type AuctionStatus = "pending" | "live" | "completed" | "cancelled";
export type AuctionCategory =
  | "Art"
  | "Collectibles"
  | "Electronics"
  | "Vehicles"
  | "Jewelry"
  | "Antiques"
  | "Sports"
  | "Books"
  | "Home & Garden"
  | "Fashion"
  | "Toys & Games";

export interface IAuctionItem {
  title: string;
  slug: string;
  description: string;
  category: AuctionCategory;
  startingPrice: number;
  minimumIncrement: number;
  currentPrice: number;
  currentBidder?: Types.ObjectId;
  seller: Types.ObjectId;
  status: AuctionStatus;
  startTime: Date;
  endTime: Date;
  imageUrls: string[];
}

export interface IAuctionItemDocument
  extends IAuctionItem,
    Document<Types.ObjectId> {}

const auctionItemSchema = new Schema<IAuctionItemDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        "Art",
        "Collectibles",
        "Electronics",
        "Vehicles",
        "Jewelry",
        "Antiques",
        "Sports",
        "Books",
        "Home & Garden",
        "Fashion",
        "Toys & Games",
      ],
      required: true,
    },
    startingPrice: { type: Number, required: true },
    minimumIncrement: { type: Number, default: 1 },
    currentPrice: { type: Number, required: true },
    currentBidder: { type: Schema.Types.ObjectId, ref: "User" },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "live", "completed", "cancelled"],
      default: "pending",
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    imageUrls: [{ type: String }],
  },
  { timestamps: true }
);

auctionItemSchema.index({ status: 1, endTime: 1 });
auctionItemSchema.index({ status: 1, currentBidder: 1 }); // For wallet balance queries
// Note: slug index is automatically created by the unique: true option

export const AuctionItem = model<IAuctionItemDocument>(
  "AuctionItem",
  auctionItemSchema
);

