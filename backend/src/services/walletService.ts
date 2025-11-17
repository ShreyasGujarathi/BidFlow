import { Types } from "mongoose";
import { User } from "../models/User";
import { Transaction, TransactionType } from "../models/Transaction";
import { Bid } from "../models/Bid";
import { AuctionItem } from "../models/AuctionItem";
import { HttpError } from "../utils/errors";

export const addFunds = async (
  userId: Types.ObjectId,
  amount: number
): Promise<{ walletBalance: number; transaction: any }> => {
  if (amount <= 0) {
    throw new HttpError("Amount must be greater than 0", 400);
  }

  const session = await User.startSession();
  session.startTransaction();

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { walletBalance: amount } },
      { new: true, session }
    );

    if (!user) {
      throw new HttpError("User not found", 404);
    }

    const transaction = await Transaction.create(
      [
        {
          user: userId,
          type: "deposit",
          amount,
          description: `Deposit of $${amount.toFixed(2)}`,
          status: "completed",
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return {
      walletBalance: user.walletBalance,
      transaction: transaction[0],
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getWalletBalance = async (userId: Types.ObjectId) => {
  const user = await User.findById(userId).select("walletBalance blockedBalance");
  if (!user) {
    throw new HttpError("User not found", 404);
  }

  // First, cleanup any blocked funds from completed auctions for this user
  // This ensures funds are released even if finalizeAuction didn't process them
  const completedAuctionsWithBlockedFunds = await Bid.aggregate([
    {
      $match: {
        bidder: userId,
        blockedAmount: { $gt: 0 },
      },
    },
    {
      $lookup: {
        from: "auctionitems",
        localField: "auction",
        foreignField: "_id",
        as: "auction",
      },
    },
    {
      $unwind: {
        path: "$auction",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $match: {
        "auction.status": "completed",
      },
    },
    {
      $project: {
        auctionId: "$auction._id",
        bidId: "$_id",
        blockedAmount: 1,
      },
    },
  ]);

  // Release funds for completed auctions
  if (completedAuctionsWithBlockedFunds.length > 0) {
    const session = await User.startSession();
    session.startTransaction();

    try {
      let totalReleased = 0;
      for (const item of completedAuctionsWithBlockedFunds) {
        const blockedAmount = item.blockedAmount || 0;
        if (blockedAmount > 0) {
          await User.findByIdAndUpdate(
            userId,
            { $inc: { blockedBalance: -blockedAmount } },
            { session }
          );

          // Create transaction if it doesn't exist
          const existingTransaction = await Transaction.findOne({
            user: userId,
            auction: item.auctionId,
            bid: item.bidId,
            type: "bid_release",
          }).session(session);

          if (!existingTransaction) {
            await Transaction.create(
              [
                {
                  user: userId,
                  type: "bid_release",
                  amount: blockedAmount,
                  description: `Released $${blockedAmount.toFixed(2)} - auction ended (cleanup)`,
                  auction: item.auctionId,
                  bid: item.bidId,
                  status: "completed",
                },
              ],
              { session }
            );
          }

          totalReleased += blockedAmount;
        }
      }

      await session.commitTransaction();
      
      if (totalReleased > 0) {
        // Refresh user data after cleanup
        const updatedUser = await User.findById(userId).select("walletBalance blockedBalance");
        if (updatedUser) {
          user.blockedBalance = updatedUser.blockedBalance;
        }
      }
    } catch (error) {
      await session.abortTransaction();
      console.error("Error cleaning up completed auction funds:", error);
      // Continue with balance calculation even if cleanup fails
    } finally {
      session.endSession();
    }
  }

  // Now calculate blocked balance for live auctions only
  const result = await Bid.aggregate([
    // Match bids for this user with blocked amounts
    {
      $match: {
        bidder: userId,
        blockedAmount: { $gt: 0 },
      },
    },
    // Lookup the auction to check if it's live and user is currentBidder
    {
      $lookup: {
        from: "auctionitems",
        localField: "auction",
        foreignField: "_id",
        as: "auction",
      },
    },
    // Unwind auction array (should be single item)
    {
      $unwind: {
        path: "$auction",
        preserveNullAndEmptyArrays: false,
      },
    },
    // Filter: only live auctions where user is currentBidder
    {
      $match: {
        "auction.status": "live",
        "auction.currentBidder": userId,
      },
    },
    // Group by auction and get the maximum blockedAmount (highest bid per auction)
    {
      $group: {
        _id: "$auction",
        maxBlockedAmount: { $max: "$blockedAmount" },
      },
    },
    // Sum all blocked amounts
    {
      $group: {
        _id: null,
        totalBlocked: { $sum: "$maxBlockedAmount" },
      },
    },
  ]);

  const recalculatedBlocked = result.length > 0 ? result[0].totalBlocked : 0;

  // Only update if there's a significant difference (avoid unnecessary saves)
  if (Math.abs(user.blockedBalance - recalculatedBlocked) > 0.01) {
    user.blockedBalance = recalculatedBlocked;
    // Use updateOne for better performance (doesn't load full document)
    await User.updateOne(
      { _id: userId },
      { $set: { blockedBalance: recalculatedBlocked } }
    );
  }

  return {
    walletBalance: user.walletBalance,
    blockedBalance: recalculatedBlocked,
    availableBalance: user.walletBalance - recalculatedBlocked,
  };
};

export const blockFundsForBid = async (
  userId: Types.ObjectId,
  auctionId: Types.ObjectId,
  bidAmount: number
): Promise<{ success: boolean; blockedAmount: number; previousBlocked?: number }> => {
  const session = await User.startSession();
  session.startTransaction();

  try {
    // Get user's previous highest bid for this auction
    const previousBid = await Bid.findOne(
      { auction: auctionId, bidder: userId },
      null,
      { session }
    )
      .sort({ amount: -1 })
      .lean();

    const previousBlocked = previousBid?.blockedAmount || 0;
    const incrementalAmount = bidAmount - previousBlocked;

    if (incrementalAmount <= 0) {
      throw new HttpError("New bid must be higher than previous bid", 400);
    }

    // Get current user state
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new HttpError("User not found", 404);
    }

    const availableBalance = user.walletBalance - user.blockedBalance;
    if (availableBalance < incrementalAmount) {
      throw new HttpError(
        `Insufficient wallet balance. Required: $${incrementalAmount.toFixed(2)}, Available: $${availableBalance.toFixed(2)}`,
        400
      );
    }

    // Block the incremental amount
    await User.findByIdAndUpdate(
      userId,
      { $inc: { blockedBalance: incrementalAmount } },
      { session }
    );

    // Create transaction record
    await Transaction.create(
      [
        {
          user: userId,
          type: "bid_block",
          amount: incrementalAmount,
          description: `Blocked $${incrementalAmount.toFixed(2)} for bid of $${bidAmount.toFixed(2)}`,
          auction: auctionId,
          status: "completed",
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return {
      success: true,
      blockedAmount: incrementalAmount,
      previousBlocked,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const releaseFundsForBid = async (
  userId: Types.ObjectId,
  auctionId: Types.ObjectId,
  bidId: Types.ObjectId
): Promise<void> => {
  const session = await User.startSession();
  session.startTransaction();

  try {
    const bid = await Bid.findById(bidId).session(session);
    if (!bid || bid.bidder.toString() !== userId.toString()) {
      throw new Error("Bid not found or unauthorized");
    }

    const blockedAmount = bid.blockedAmount || 0;
    if (blockedAmount <= 0) {
      await session.commitTransaction();
      return;
    }

    // Release blocked funds back to wallet
    await User.findByIdAndUpdate(
      userId,
      { $inc: { blockedBalance: -blockedAmount } },
      { session }
    );

    // Create transaction record
    await Transaction.create(
      [
        {
          user: userId,
          type: "bid_release",
          amount: blockedAmount,
          description: `Released $${blockedAmount.toFixed(2)} - outbid on auction`,
          auction: auctionId,
          bid: bidId,
          status: "completed",
        },
      ],
      { session }
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const captureWinningBid = async (
  auctionId: Types.ObjectId
): Promise<{ winnerId: Types.ObjectId; capturedAmount: number }> => {
  const session = await User.startSession();
  session.startTransaction();

  try {
    const auction = await AuctionItem.findById(auctionId).session(session);
    if (!auction) {
      throw new Error("Auction not found");
    }

    // Get highest bid
    const winningBid = await Bid.findOne({ auction: auctionId }, null, { session })
      .sort({ amount: -1 })
      .lean();

    if (!winningBid) {
      throw new Error("No bids found for this auction");
    }

    const winnerId = winningBid.bidder as Types.ObjectId;
    const capturedAmount = winningBid.amount;

    // Move blocked balance to wallet deduction (capture)
    const user = await User.findById(winnerId).session(session);
    if (!user) {
      throw new Error("Winner not found");
    }

    const blockedAmount = winningBid.blockedAmount || capturedAmount;

    // Deduct from wallet and unblock
    await User.findByIdAndUpdate(
      winnerId,
      {
        $inc: {
          walletBalance: -capturedAmount,
          blockedBalance: -blockedAmount,
        },
      },
      { session }
    );

    // Create transaction record
    await Transaction.create(
      [
        {
          user: winnerId,
          type: "bid_capture",
          amount: capturedAmount,
          description: `Won auction - $${capturedAmount.toFixed(2)} captured`,
          auction: auctionId,
          bid: winningBid._id,
          status: "completed",
        },
      ],
      { session }
    );

    // Release funds for all other bidders
    const losingBids = await Bid.find(
      {
        auction: auctionId,
        _id: { $ne: winningBid._id },
        blockedAmount: { $gt: 0 },
      },
      null,
      { session }
    ).lean();

    for (const losingBid of losingBids) {
      const losingUserId = losingBid.bidder as Types.ObjectId;
      const losingBlockedAmount = losingBid.blockedAmount || 0;

      if (losingBlockedAmount > 0) {
        await User.findByIdAndUpdate(
          losingUserId,
          { $inc: { blockedBalance: -losingBlockedAmount } },
          { session }
        );

        await Transaction.create(
          [
            {
              user: losingUserId,
              type: "bid_release",
              amount: losingBlockedAmount,
              description: `Released $${losingBlockedAmount.toFixed(2)} - auction ended`,
              auction: auctionId,
              bid: losingBid._id,
              status: "completed",
            },
          ],
          { session }
        );
      }
    }

    await session.commitTransaction();

    return {
      winnerId,
      capturedAmount,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getTransactionHistory = async (
  userId: Types.ObjectId,
  limit: number = 50
) => {
  return Transaction.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("auction", "title")
    .lean();
};

/**
 * Release all blocked funds for bids on a completed auction
 * Used when auction ends with no winner or as cleanup for completed auctions
 */
export const releaseAllFundsForAuction = async (
  auctionId: Types.ObjectId
): Promise<void> => {
  const session = await User.startSession();
  session.startTransaction();

  try {
    // Find all bids with blocked amounts for this auction
    const bidsWithBlockedFunds = await Bid.find({
      auction: auctionId,
      blockedAmount: { $gt: 0 },
    })
      .select("bidder blockedAmount _id")
      .lean();

    for (const bid of bidsWithBlockedFunds) {
      const userId = bid.bidder as Types.ObjectId;
      const blockedAmount = bid.blockedAmount || 0;

      if (blockedAmount > 0) {
        // Release blocked funds
        await User.findByIdAndUpdate(
          userId,
          { $inc: { blockedBalance: -blockedAmount } },
          { session }
        );

        // Create transaction record if it doesn't exist
        const existingTransaction = await Transaction.findOne({
          user: userId,
          auction: auctionId,
          bid: bid._id,
          type: "bid_release",
        }).session(session);

        if (!existingTransaction) {
          await Transaction.create(
            [
              {
                user: userId,
                type: "bid_release",
                amount: blockedAmount,
                description: `Released $${blockedAmount.toFixed(2)} - auction ended`,
                auction: auctionId,
                bid: bid._id,
                status: "completed",
              },
            ],
            { session }
          );
        }
      }
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Ensure all funds are properly released/captured for a completed auction
 * This is a cleanup function to fix any stuck balances
 */
export const ensureAuctionFundsReleased = async (
  auctionId: Types.ObjectId | string
): Promise<void> => {
  const id = typeof auctionId === "string" ? auctionId : auctionId.toString();
  const auction = await AuctionItem.findById(id);

  if (!auction || auction.status !== "completed") {
    return; // Only process completed auctions
  }

  // Check if there's a winner (currentBidder)
  if (auction.currentBidder) {
    // Auction has a winner, ensure winner's funds are captured and others released
    try {
      // Try to capture winning bid (will handle releases too)
      await captureWinningBid(auction._id);
    } catch (error) {
      // If capture fails (maybe already processed), just release all funds
      console.error(`Error ensuring funds released for auction ${id}:`, error);
      await releaseAllFundsForAuction(auction._id);
    }
  } else {
    // No winner, release all blocked funds
    await releaseAllFundsForAuction(auction._id);
  }
};

