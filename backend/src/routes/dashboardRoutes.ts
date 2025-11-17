import { Router } from "express";
import {
  buyerDashboardController,
  sellerDashboardController,
} from "../controllers/dashboardController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get(
  "/seller",
  authenticate,
  sellerDashboardController
);
router.get(
  "/buyer",
  authenticate,
  buyerDashboardController
);

export default router;

