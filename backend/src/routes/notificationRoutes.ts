import { Router } from "express";
import {
  listNotificationsController,
  markNotificationsController,
} from "../controllers/notificationController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, listNotificationsController);
router.post("/read", authenticate, markNotificationsController);

export default router;

