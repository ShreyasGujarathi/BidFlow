import { Types } from "mongoose";
import { AuctionItem } from "../models/AuctionItem";
import { Bid } from "../models/Bid";
import { sendNotification } from "./notificationService";
import { announceAuctionUpdate } from "./auctionService";
import { getIo } from "../config/socket";
import { NotFoundError } from "../utils/errors";
import {
  blockFundsForBid,
  releaseFundsForBid,
} from "./walletService";

export const placeBid = async (
  auctionId: string,
  bidderId: Types.ObjectId,
  amount: number
) => {
  const auction = await AuctionItem.findById(auctionId);
  if (!auction) {
    throw new NotFoundError("Auction not found");
  }
  if (auction.status !== "live") {
    throw new Error("Auction is not live");
  }
  if (auction.endTime <= new Date()) {
    throw new Error("Auction has ended");
  }
  if (auction.seller.toString() === bidderId.toString()) {
    throw new Error("Sellers cannot bid on their own auctions");
  }

  const minAllowed =
    auction.currentPrice + Math.max(auction.minimumIncrement, 1);

  if (amount < minAllowed) {
    throw new Error(`Bid must be at least ${minAllowed}`);
  }

  // Block funds for the new bid
  const { blockedAmount, previousBlocked } = await blockFundsForBid(
    bidderId,
    auction._id,
    amount
  );

  // Get previous highest bidder for this auction
  const previousHighestBid = await Bid.findOne({
    auction: auction._id,
  })
    .sort({ amount: -1 })
    .lean();

  const previousBidder = auction.currentBidder;
  const wasOutbid = previousHighestBid && 
    previousHighestBid.bidder.toString() !== bidderId.toString();

  // Release funds for previous bidder if they were outbid
  if (wasOutbid && previousHighestBid) {
    await releaseFundsForBid(
      previousHighestBid.bidder as Types.ObjectId,
      auction._id,
      previousHighestBid._id as Types.ObjectId
    );
  }

  // Create the new bid with blocked amount
  const sessionBid = await Bid.create({
    auction: auction._id,
    bidder: bidderId,
    amount,
    blockedAmount,
  });

  auction.currentBidder = bidderId;
  auction.currentPrice = amount;
  await auction.save();

  const io = getIo();

  // Emit bid:new with highest bid information
  io.to(`auction:${auction._id}`).emit("bid:new", {
    auctionId: auction._id,
    bid: {
      id: sessionBid._id,
      amount,
      bidder: bidderId,
      createdAt: sessionBid.createdAt,
    },
    highestBid: {
      amount: auction.currentPrice,
      userId: auction.currentBidder?.toString(),
    },
  });

  await announceAuctionUpdate(auction._id);

  // Process auto-bids after manual bid is placed
  const { processAutoBids } = await import("./autoBidService");
  await processAutoBids(auctionId).catch((err) => {
    // Log error but don't fail the bid if auto-bid processing fails
    console.error("Failed to process auto-bids:", err);
  });

  await sendNotification(
    auction.seller,
    "bid_received",
    `New bid of ${amount} on ${auction.title}`,
    { auctionId: auction._id, amount }
  );

  if (previousBidder && previousBidder.toString() !== bidderId.toString()) {
    await sendNotification(
      previousBidder,
      "bid_outbid",
      `You were outbid on ${auction.title}. Funds released to wallet.`,
      { auctionId: auction._id, amount }
    );
    io.to(`user:${previousBidder}`).emit("notification:new", {
      type: "bid_outbid",
      auctionId: auction._id,
      amount,
      message: "You've been outbid — funds released to wallet",
    });
    // Emit wallet update for outbid user
    io.to(`user:${previousBidder}`).emit("wallet:updated", {
      message: "Funds released - you were outbid",
    });
  }

  io.to(`user:${auction.seller}`).emit("notification:new", {
    type: "bid_received",
    auctionId: auction._id,
    amount,
  });

  return sessionBid;
};

export const getBidHistory = async (auctionId: string) => {
  return Bid.find({ auction: auctionId })
    .sort({ createdAt: -1 })
    .populate("bidder", "username avatarUrl")
    .lean();
};

