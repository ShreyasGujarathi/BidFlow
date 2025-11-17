import { Request, Response } from "express";
import { captureWinningBid } from "../services/walletService";
import {
  createAuction,
  listAuctions,
  getAuctionBySlug,
  updateAuction,
} from "../services/auctionService";
import { asyncHandler } from "../utils/asyncHandler";
import { ok } from "../utils/apiResponse";
import { AuctionItem } from "../models/AuctionItem";
import { getIo } from "../config/socket";

export const listLiveAuctionsController = asyncHandler(
  async (req: Request, res: Response) => {
    const category = req.query.category as string | undefined;
    const filter: any = { status: "live" };
    if (category) {
      filter.category = category;
    }
    const auctions = await listAuctions(filter, 100);
    res.json(ok(auctions));
  }
);

export const getAuctionController = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;
    if (!slug) {
      throw new Error("Slug is required");
    }
    const auction = await getAuctionBySlug(slug);
    if (!auction) {
      throw new Error("Auction not found");
    }
    res.json(ok(auction));
  }
);

export const createAuctionController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("Unauthorized");
    }
    const auction = await createAuction(req.body, req.user._id);
    res.status(201).json(ok(auction));
  }
);

export const updateAuctionController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("Unauthorized");
    }
    const { id } = req.params;
    if (!id) {
      throw new Error("Auction id is required");
    }
    const auction = await updateAuction(id, req.body, req.user._id);
    res.json(ok(auction));
  }
);

export const resolveAuctionController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as { id?: string };
    if (!id) {
      throw new Error("Auction id is required");
    }

    const auction = await AuctionItem.findById(id);
    if (!auction) {
      throw new Error("Auction not found");
    }

    if (auction.status !== "live") {
      throw new Error("Auction is not live");
    }

    // Capture winning bid and release others
    const result = await captureWinningBid(auction._id);

    // Update auction status - use currentBidder to store winner
    auction.status = "completed";
    auction.currentBidder = result.winnerId;
    await auction.save();

    const io = getIo();

    // Emit auction finalized event
    io.to(`auction:${id}`).emit("auction:finalized", {
      auctionId: id,
      winnerId: result.winnerId.toString(),
      finalPrice: result.capturedAmount,
    });

    // Emit wallet update to winner
    io.to(`user:${result.winnerId}`).emit("wallet:updated", {
      message: `Auction won! $${result.capturedAmount.toFixed(2)} deducted from wallet`,
    });

    res.json(
      ok({
        winnerId: result.winnerId,
        capturedAmount: result.capturedAmount,
        message: "Auction resolved successfully",
      })
    );
  }
);
