import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "./env";
import { verifyJwt } from "../utils/jwt";
import { User } from "../models/User";
import { AuctionScheduler } from "../services/auctionScheduler";

let io: Server | null = null;

export const initSocket = (server: HttpServer, scheduler: AuctionScheduler) => {
  io = new Server(server, {
    cors: {
      origin: env.clientOrigins,
      credentials: true,
    },
  });

  scheduler.setIo(io);

  io.use(async (socket, next) => {
    try {
      const token =
        (socket.handshake.auth?.token as string | undefined) ??
        (socket.handshake.headers.authorization
          ?.toString()
          .replace("Bearer ", "") ??
          undefined);

      if (token) {
        const payload = verifyJwt(token);
        const user = await User.findById(payload.userId);
        if (user) {
          socket.data.user = {
            id: user._id,
            username: user.username,
            role: user.role,
          };
          socket.join(`user:${user._id}`);
        }
      }
      next();
    } catch (error) {
      next(error as Error);
    }
  });

  io.on("connection", (socket) => {
    socket.emit("connection:ack", { serverTime: Date.now() });

    socket.on("joinAuction", (auctionId: string) => {
      socket.join(`auction:${auctionId}`);
      socket.emit("auction:time-sync", {
        auctionId,
        serverTime: Date.now(),
      });
    });

    socket.on("leaveAuction", (auctionId: string) => {
      socket.leave(`auction:${auctionId}`);
    });

    socket.on("disconnect", () => {
      // cleanup handled by socket.io
    });
  });

  setInterval(() => {
    io?.emit("server:time", { serverTime: Date.now() });
  }, 15000);

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

