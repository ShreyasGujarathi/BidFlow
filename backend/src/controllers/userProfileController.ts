import { Request, Response } from "express";
import { getUserProfile, createOrUpdateRating } from "../services/userProfileService";
import { asyncHandler } from "../utils/asyncHandler";
import { ok } from "../utils/apiResponse";

export const getUserProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as { id?: string };
    if (!id) {
      throw new Error("User ID is required");
    }

    const profile = await getUserProfile(id);
    res.json(ok(profile));
  }
);

export const createRatingController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new Error("Unauthorized");
    }

    const { id } = req.params as { id?: string };
    const { rating, comment, auctionId } = req.body;

    if (!id || !rating) {
      throw new Error("User ID and rating are required");
    }

    const ratingDoc = await createOrUpdateRating(
      id,
      req.user._id,
      rating,
      comment,
      auctionId
    );

    res.status(201).json(ok(ratingDoc));
  }
);

