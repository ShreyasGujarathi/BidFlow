import { Request, Response } from "express";
import { placeBid, getBidHistory } from "../services/bidService";
import { asyncHandler } from "../utils/asyncHandler";
import { ok } from "../utils/apiResponse";

export const placeBidController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("Unauthorized");
    }
    const { amount } = req.body;
    const { id } = req.params as { id?: string };
    if (!id) {
      throw new Error("Auction id is required");
    }
    const bid = await placeBid(id, req.user._id, amount);
    res.status(201).json(ok(bid));
  }
);

export const bidHistoryController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as { id?: string };
    if (!id) {
      throw new Error("Auction id is required");
    }
    const history = await getBidHistory(id);
    res.json(ok(history));
  }
);

