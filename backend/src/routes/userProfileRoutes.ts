import { Router } from "express";
import {
  getUserProfileController,
  createRatingController,
} from "../controllers/userProfileController";
import { authenticate } from "../middleware/auth";

const router = Router();

// Get user profile (public, no auth required)
router.get("/:id", getUserProfileController);

// Create/update rating (requires auth)
router.post("/:id/rating", authenticate, createRatingController);

export default router;

