import { Router } from "express";
import { adminOverviewController } from "../controllers/adminController";
import { authenticate, requireRoles } from "../middleware/auth";

const router = Router();

router.get(
  "/overview",
  authenticate,
  requireRoles("admin"),
  adminOverviewController
);

export default router;

