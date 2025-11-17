'use client';

import { useEffect, useState } from "react";
import { Auction } from "../../lib/types";

interface WinnerModalProps {
  auction: Auction;
  currentUserId?: string;
  onClose: () => void;
}

export const WinnerModal = ({ auction, currentUserId, onClose }: WinnerModalProps) => {
  const [show, setShow] = useState(true);

  const handleClose = () => {
    setShow(false);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-md rounded-2xl border-2 border-green-500/50 bg-gradient-to-br from-green-500/20 via-surface to-background p-8 shadow-2xl shadow-green-500/30">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition hover:bg-gray-700/50 hover:text-white"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Winner icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Congratulations message */}
        <h2 className="mb-3 text-center text-3xl font-bold text-white">
          🎉 Congratulations! 🎉
        </h2>
        <p className="mb-6 text-center text-lg text-gray-300">
          You won this auction!
        </p>

        {/* Auction details */}
        <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
          <h3 className="mb-3 text-center text-xl font-semibold text-white">
            {auction.title}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Winning Price:</span>
              <span className="text-xl font-bold text-green-400">
                ${auction.currentPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Category:</span>
              <span className="text-sm font-medium text-gray-300">
                {auction.category}
              </span>
            </div>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={handleClose}
          className="w-full rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 text-lg font-semibold text-white transition hover:from-green-600 hover:to-green-700 hover:shadow-lg hover:shadow-green-500/50"
        >
          Awesome! 🚀
        </button>
      </div>
    </div>
  );
};

