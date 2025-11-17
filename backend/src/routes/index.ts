import { Express } from "express";
import authRoutes from "./authRoutes";
import auctionRoutes from "./auctionRoutes";
import bidRoutes from "./bidRoutes";
import dashboardRoutes from "./dashboardRoutes";
import notificationRoutes from "./notificationRoutes";
import adminRoutes from "./adminRoutes";
import autoBidRoutes from "./autoBidRoutes";
import uploadRoutes from "./uploadRoutes";
import watchlistRoutes from "./watchlistRoutes";
import userProfileRoutes from "./userProfileRoutes";
import walletRoutes from "./walletRoutes";

export const registerRoutes = (app: Express) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/auctions", auctionRoutes);
  app.use("/api/auctions/:id/bids", bidRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/auto-bids", autoBidRoutes);
  app.use("/api/upload", uploadRoutes);
  app.use("/api/watchlist", watchlistRoutes);
  app.use("/api/users", userProfileRoutes);
  app.use("/api/wallet", walletRoutes);
};

