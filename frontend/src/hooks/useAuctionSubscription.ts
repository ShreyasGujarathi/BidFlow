'use client';

import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import { Auction, Bid } from "../lib/types";

interface AuctionSubscriptionOptions {
  onAuctionUpdate?: (auction: Auction) => void;
  onBid?: (payload: {
    bid: Bid;
    highestBid?: { amount: number; userId?: string };
  }) => void;
  onFinalized?: (payload: {
    auctionId: string;
    winner: { id: string; username: string; amount: number } | null;
  }) => void;
}

export const useAuctionSubscription = (
  auctionId: string | undefined,
  options: AuctionSubscriptionOptions
) => {
  const { socket, joinAuction, leaveAuction } = useSocketContext();
  const { onAuctionUpdate, onBid, onFinalized } = options;

  useEffect(() => {
    if (!auctionId || !socket) return;

    joinAuction(auctionId);

    const handleUpdate = (auction: Auction) => {
      onAuctionUpdate?.(auction);
    };

    const handleBid = (payload: {
      auctionId: string;
      bid: Bid;
      highestBid?: { amount: number; userId?: string };
    }) => {
      if (payload.auctionId !== auctionId) return;
      onBid?.({
        bid: payload.bid,
        highestBid: payload.highestBid,
      });
    };

    const handleFinalized = (payload: {
      auctionId: string;
      winner: { id: string; username: string; amount: number } | null;
    }) => {
      if (payload.auctionId !== auctionId) return;
      onFinalized?.(payload);
    };

    socket.on("auction:update", handleUpdate);
    socket.on("bid:new", handleBid);
    socket.on("auction:finalized", handleFinalized);

    return () => {
      leaveAuction(auctionId);
      socket.off("auction:update", handleUpdate);
      socket.off("bid:new", handleBid);
      socket.off("auction:finalized", handleFinalized);
    };
  }, [
    auctionId,
    socket,
    joinAuction,
    leaveAuction,
    onAuctionUpdate,
    onBid,
    onFinalized,
  ]);
};

