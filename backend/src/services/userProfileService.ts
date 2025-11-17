import { Types } from "mongoose";
import { User } from "../models/User";
import { AuctionItem } from "../models/AuctionItem";
import { Bid } from "../models/Bid";
import { Rating } from "../models/Rating";
import { NotFoundError } from "../utils/errors";

/**
 * Get user profile with statistics
 */
export const getUserProfile = async (userId: string) => {
  const user = await User.findById(userId)
    .select("-password")
    .lean();

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const userObjectId = new Types.ObjectId(userId);

  // Get statistics
  const auctionsCreated = await AuctionItem.countDocuments({
    seller: userObjectId,
  });

  const auctionsWon = await AuctionItem.countDocuments({
    currentBidder: userObjectId,
    status: "completed",
  });

  const totalBidsPlaced = await Bid.countDocuments({
    bidder: userObjectId,
  });

  // Get reputation/rating
  const ratings = await Rating.find({ ratedUser: userObjectId }).lean();
  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;
  const ratingCount = ratings.length;

  // Get recent auctions created (last 10)
  const recentAuctions = await AuctionItem.find({ seller: userObjectId })
    .sort({ createdAt: -1 })
    .limit(10)
    .select("title status currentPrice endTime slug imageUrls")
    .lean();

  // Get recent auctions won (last 10)
  const recentWins = await AuctionItem.find({
    currentBidder: userObjectId,
    status: "completed",
  })
    .sort({ updatedAt: -1 })
    .limit(10)
    .select("title currentPrice endTime slug imageUrls")
    .lean();

  // Get recent ratings (last 5)
  const recentRatings = await Rating.find({ ratedUser: userObjectId })
    .populate("ratedBy", "username avatarUrl")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return {
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      createdAt: (user as { createdAt?: Date }).createdAt || new Date(),
    },
    stats: {
      auctionsCreated,
      auctionsWon,
      totalBidsPlaced,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      ratingCount,
    },
    recentAuctions,
    recentWins,
    recentRatings,
  };
};

/**
 * Create or update a rating
 */
export const createOrUpdateRating = async (
  ratedUserId: string,
  ratedByUserId: Types.ObjectId,
  rating: number,
  comment?: string,
  auctionId?: string
) => {
  // Users cannot rate themselves
  if (ratedUserId === ratedByUserId.toString()) {
    throw new Error("Users cannot rate themselves");
  }

  const ratedUser = await User.findById(ratedUserId);
  if (!ratedUser) {
    throw new NotFoundError("User not found");
  }

  // Validate rating value
  if (![1, 2, 3, 4, 5].includes(rating)) {
    throw new Error("Rating must be between 1 and 5");
  }

  const ratingData: {
    ratedUser: Types.ObjectId;
    ratedBy: Types.ObjectId;
    rating: number;
    comment?: string;
    auctionId?: Types.ObjectId;
  } = {
    ratedUser: new Types.ObjectId(ratedUserId),
    ratedBy: ratedByUserId,
    rating,
  };

  if (comment) {
    ratingData.comment = comment;
  }

  if (auctionId) {
    ratingData.auctionId = new Types.ObjectId(auctionId);
  }

  // Upsert rating (update if exists, create if not)
  const ratingDoc = await Rating.findOneAndUpdate(
    {
      ratedUser: ratedUserId,
      ratedBy: ratedByUserId,
    },
    ratingData,
    {
      upsert: true,
      new: true,
    }
  );

  return ratingDoc;
};

