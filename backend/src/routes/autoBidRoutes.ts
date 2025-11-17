import { Router } from "express";
import {
  createAutoBidController,
  deleteAutoBidController,
  getAutoBidController,
  getUserAutoBidsController,
} from "../controllers/autoBidController";
import { authenticate } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get("/", getUserAutoBidsController);
router.get("/:id", getAutoBidController);
router.post("/:id", createAutoBidController);
router.delete("/:id", deleteAutoBidController);

export default router;

