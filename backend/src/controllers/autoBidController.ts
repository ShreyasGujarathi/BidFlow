import { Request, Response } from "express";
import {
  setAutoBid,
  removeAutoBid,
  getAutoBid,
  getUserAutoBids,
} from "../services/autoBidService";
import { asyncHandler } from "../utils/asyncHandler";
import { ok } from "../utils/apiResponse";
import { NotFoundError } from "../utils/errors";

export const createAutoBidController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("Unauthorized");
    }

    const { id } = req.params as { id?: string };
    if (!id) {
      throw new Error("Auction id is required");
    }

    const { maximumBid } = req.body;
    if (!maximumBid || typeof maximumBid !== "number" || maximumBid <= 0) {
      throw new Error("Valid maximum bid amount is required");
    }

    const autoBid = await setAutoBid(id, req.user._id, maximumBid);
    res.status(201).json(ok(autoBid));
  }
);

export const deleteAutoBidController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("Unauthorized");
    }

    const { id } = req.params as { id?: string };
    if (!id) {
      throw new Error("Auction id is required");
    }

    await removeAutoBid(id, req.user._id);
    res.json(ok({ message: "Auto-bid removed successfully" }));
  }
);

export const getAutoBidController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("Unauthorized");
    }

    const { id } = req.params as { id?: string };
    if (!id) {
      throw new Error("Auction id is required");
    }

    const autoBid = await getAutoBid(id, req.user._id);
    if (!autoBid) {
      throw new NotFoundError("Auto-bid not found");
    }

    res.json(ok(autoBid));
  }
);

export const getUserAutoBidsController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("Unauthorized");
    }

    const autoBids = await getUserAutoBids(req.user._id);
    res.json(ok(autoBids));
  }
);

