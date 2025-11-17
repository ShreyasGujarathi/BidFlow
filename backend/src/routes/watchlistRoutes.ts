import { Router } from "express";
import {
  addToWatchlistController,
  removeFromWatchlistController,
  getUserWatchlistController,
  checkWatchlistController,
} from "../controllers/watchlistController";
import { authenticate } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get("/", getUserWatchlistController);
router.get("/:id/check", checkWatchlistController);
router.post("/:id", addToWatchlistController);
router.delete("/:id", removeFromWatchlistController);

export default router;

