import { Server } from "socket.io";
import { AuctionItem } from "../models/AuctionItem";
import {
  finalizeAuction,
  setAuctionLive,
  announceAuctionUpdate,
} from "./auctionService";

type TimerMap = Map<string, NodeJS.Timeout>;

export class AuctionScheduler {
  private endTimers: TimerMap = new Map();
  private startTimers: TimerMap = new Map();
  private io?: Server;

  setIo(io: Server) {
    this.io = io;
  }

  async bootstrap() {
    const now = new Date();
    const auctions = await AuctionItem.find({
      status: { $in: ["pending", "live"] },
      endTime: { $gt: now },
    }).lean();

    auctions.forEach((auction) => {
      if (auction.status === "pending" && auction.startTime <= now) {
        void setAuctionLive(auction._id.toString());
        this.scheduleAuctionEnd(
          auction._id.toString(),
          new Date(auction.endTime)
        );
      } else if (auction.status === "pending") {
        this.scheduleAuctionStart(
          auction._id.toString(),
          new Date(auction.startTime),
          new Date(auction.endTime)
        );
      } else {
        this.scheduleAuctionEnd(
          auction._id.toString(),
          new Date(auction.endTime)
        );
      }
    });
  }

  scheduleAuctionStart(
    auctionId: string,
    startTime: Date,
    endTime: Date
  ): void {
    this.clearStartTimer(auctionId);
    const start = new Date(startTime);
    const end = new Date(endTime);
    const delay = start.getTime() - Date.now();
    if (delay <= 0) {
      void setAuctionLive(auctionId);
      this.scheduleAuctionEnd(auctionId, end);
      return;
    }
    const timeout = setTimeout(async () => {
      this.startTimers.delete(auctionId);
      await setAuctionLive(auctionId);
      this.scheduleAuctionEnd(auctionId, end);
    }, delay);
    this.startTimers.set(auctionId, timeout);
  }

  scheduleAuctionEnd(auctionId: string, endTime: Date) {
    this.clearEndTimer(auctionId);
    const end = new Date(endTime);
    const delay = end.getTime() - Date.now();
    if (delay <= 0) {
      void finalizeAuction(auctionId);
      return;
    }

    const timeout = setTimeout(async () => {
      this.endTimers.delete(auctionId);
      await finalizeAuction(auctionId);
    }, delay);
    this.endTimers.set(auctionId, timeout);
  }

  clearStartTimer(auctionId: string) {
    const timer = this.startTimers.get(auctionId);
    if (timer) {
      clearTimeout(timer);
      this.startTimers.delete(auctionId);
    }
  }

  clearEndTimer(auctionId: string) {
    const timer = this.endTimers.get(auctionId);
    if (timer) {
      clearTimeout(timer);
      this.endTimers.delete(auctionId);
    }
  }

  broadcastTimeSync(auctionId: string) {
    if (!this.io) return;
    this.io.to(`auction:${auctionId}`).emit("auction:time-sync", {
      auctionId,
      serverTime: Date.now(),
    });
  }

  notifyAuctionUpdate(auctionId: string) {
    void announceAuctionUpdate(auctionId);
  }
}

