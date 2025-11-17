import { Request, Response } from "express";
import { AuctionItem } from "../models/AuctionItem";
import { Bid } from "../models/Bid";
import { User } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";
import { ok } from "../utils/apiResponse";

export const adminOverviewController = asyncHandler(
  async (_req: Request, res: Response) => {
    const [liveAuctions, totalUsers, bidsToday] = await Promise.all([
      AuctionItem.countDocuments({ status: "live" }),
      User.countDocuments({}),
      Bid.countDocuments({
        createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
    ]);

    const recentAuctions = await AuctionItem.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json(
      ok({
        metrics: {
          liveAuctions,
          totalUsers,
          bidsInLast24h: bidsToday,
        },
        recentAuctions,
      })
    );
  }
);

