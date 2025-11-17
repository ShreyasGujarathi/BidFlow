import { Router } from "express";
import {
  bidHistoryController,
  placeBidController,
} from "../controllers/bidController";
import { authenticate, requireRoles } from "../middleware/auth";

const router = Router({ mergeParams: true });

router.get("/", bidHistoryController);
router.post(
  "/",
  authenticate,
  requireRoles("buyer", "seller", "admin"),
  placeBidController
);

export default router;

