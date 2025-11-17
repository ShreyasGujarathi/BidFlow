import { Request, Response } from "express";
import {
  getBuyerDashboard,
  getSellerDashboard,
} from "../services/auctionService";
import { asyncHandler } from "../utils/asyncHandler";
import { ok } from "../utils/apiResponse";

export const sellerDashboardController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("Unauthorized");
    }
    const data = await getSellerDashboard(req.user._id);
    res.json(ok(data));
  }
);

export const buyerDashboardController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("Unauthorized");
    }
    const data = await getBuyerDashboard(req.user._id);
    res.json(ok(data));
  }
);

