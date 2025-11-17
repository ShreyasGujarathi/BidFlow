import { Request, Response } from "express";
import {
  addFunds,
  getWalletBalance,
  getTransactionHistory,
  ensureAuctionFundsReleased,
} from "../services/walletService";
import { AuctionItem } from "../models/AuctionItem";
import { asyncHandler } from "../utils/asyncHandler";
import { ok } from "../utils/apiResponse";

export const addFundsController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("Unauthorized");
    }

    const { amount } = req.body;
    if (!amount || typeof amount !== "number" || amount <= 0) {
      throw new Error("Valid amount is required");
    }

    const result = await addFunds(req.user._id, amount);
    res.status(200).json(
      ok({
        walletBalance: result.walletBalance,
        transaction: result.transaction,
        message: `Successfully added $${amount.toFixed(2)} to wallet`,
      })
    );
  }
);

export const getBalanceController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("Unauthorized");
    }

    const balance = await getWalletBalance(req.user._id);
    res.json(ok(balance));
  }
);

export const getTransactionHistoryController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("Unauthorized");
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const history = await getTransactionHistory(req.user._id, limit);
    res.json(ok(history));
  }
);

/**
 * Cleanup endpoint to release funds for all completed auctions
 * This fixes any stuck balances from auctions that ended before wallet system was fully integrated
 */
export const cleanupCompletedAuctionsController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("Unauthorized");
    }

    // Only allow admins or the system to call this
    if (req.user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Find all completed auctions
    const completedAuctions = await AuctionItem.find({
      status: "completed",
    }).select("_id");

    let processed = 0;
    let errors = 0;

    for (const auction of completedAuctions) {
      try {
        await ensureAuctionFundsReleased(auction._id);
        processed++;
      } catch (error) {
        console.error(`Error processing auction ${auction._id}:`, error);
        errors++;
      }
    }

    res.json(
      ok({
        message: "Cleanup completed",
        processed,
        errors,
        total: completedAuctions.length,
      })
    );
  }
);

