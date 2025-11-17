import http from "http";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import { registerRoutes } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { AuctionScheduler } from "./services/auctionScheduler";
import { initSocket } from "./config/socket";

const app = express();

app.use(
  cors({
    origin: env.clientOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: Date.now() });
});

// Register API routes first (before static file serving)
registerRoutes(app);

// Serve uploaded files statically (after API routes to avoid conflicts)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(errorHandler);

const server = http.createServer(app);
const scheduler = new AuctionScheduler();

initSocket(server, scheduler);

connectDB()
  .then(() => scheduler.bootstrap())
  .then(() => {
    server.listen(env.port, () => {
      console.log(`API running on port ${env.port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
  });

