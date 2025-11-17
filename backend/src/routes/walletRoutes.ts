import { Router } from "express";
import {
  addFundsController,
  getBalanceController,
  getTransactionHistoryController,
  cleanupCompletedAuctionsController,
} from "../controllers/walletController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/add-funds", authenticate, addFundsController);
router.get("/balance", authenticate, getBalanceController);
router.get("/transactions", authenticate, getTransactionHistoryController);
router.post("/cleanup-completed", authenticate, cleanupCompletedAuctionsController);

export default router;

