import { Schema, model, Document, Types } from "mongoose";

export type TransactionType = "deposit" | "bid_block" | "bid_release" | "bid_capture" | "refund";

export interface ITransaction {
  user: Types.ObjectId;
  type: TransactionType;
  amount: number;
  description?: string;
  auction?: Types.ObjectId;
  bid?: Types.ObjectId;
  status: "completed" | "pending" | "failed";
  metadata?: Record<string, any>;
}

export interface ITransactionDocument extends ITransaction, Document<Types.ObjectId> {}

const transactionSchema = new Schema<ITransactionDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["deposit", "bid_block", "bid_release", "bid_capture", "refund"],
      required: true,
    },
    amount: { type: Number, required: true },
    description: String,
    auction: { type: Schema.Types.ObjectId, ref: "AuctionItem" },
    bid: { type: Schema.Types.ObjectId, ref: "Bid" },
    status: {
      type: String,
      enum: ["completed", "pending", "failed"],
      default: "completed",
    },
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ auction: 1 });

export const Transaction = model<ITransactionDocument>("Transaction", transactionSchema);

