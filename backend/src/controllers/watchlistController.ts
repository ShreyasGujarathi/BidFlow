import { Request, Response } from "express";
import {
  addToWatchlist,
  removeFromWatchlist,
  getUserWatchlist,
  isInWatchlist,
} from "../services/watchlistService";
import { asyncHandler } from "../utils/asyncHandler";
import { ok } from "../utils/apiResponse";

export const addToWatchlistController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("Unauthorized");
    }

    const { id } = req.params as { id?: string };
    if (!id) {
      throw new Error("Auction id is required");
    }

    const watchlistItem = await addToWatchlist(id, req.user._id);
    res.status(201).json(ok(watchlistItem));
  }
);

export const removeFromWatchlistController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("Unauthorized");
    }

    const { id } = req.params as { id?: string };
    if (!id) {
      throw new Error("Auction id is required");
    }

    await removeFromWatchlist(id, req.user._id);
    res.json(ok({ message: "Removed from watchlist" }));
  }
);

export const getUserWatchlistController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("Unauthorized");
    }

    const watchlist = await getUserWatchlist(req.user._id);
    res.json(ok(watchlist));
  }
);

export const checkWatchlistController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("Unauthorized");
    }

    const { id } = req.params as { id?: string };
    if (!id) {
      throw new Error("Auction id is required");
    }

    const inWatchlist = await isInWatchlist(id, req.user._id);
    res.json(ok({ inWatchlist }));
  }
);

