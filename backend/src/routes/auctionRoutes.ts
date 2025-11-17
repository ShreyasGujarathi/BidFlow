import { Router } from "express";
import {
  createAuctionController,
  getAuctionController,
  listLiveAuctionsController,
  updateAuctionController,
  resolveAuctionController,
} from "../controllers/auctionController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", listLiveAuctionsController);
router.get("/:slug", getAuctionController);
router.post(
  "/",
  authenticate,
  createAuctionController
);
router.patch(
  "/:id",
  authenticate,
  updateAuctionController
);
router.post(
  "/:id/resolve",
  authenticate,
  resolveAuctionController
);

export default router;

