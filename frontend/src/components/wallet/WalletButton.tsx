'use client';

import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useWalletBalance } from "../../lib/swr";
import { mutate } from "swr";

export const WalletButton = () => {
  const { token, user } = useAuth();
  const { data: balance, error } = useWalletBalance(token || undefined);

  if (!user) return null;

  const availableBalance = balance?.availableBalance ?? 0;
  const blockedBalance = balance?.blockedBalance ?? 0;
  const walletBalance = balance?.walletBalance ?? 0;

  return (
    <Link
      href="/wallet"
      prefetch={true}
      className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition-all hover:-translate-y-0.5 hover:bg-[var(--surface)]/90"
      onClick={() => {
        // Revalidate wallet balance when clicked
        if (token) {
          mutate(['/api/wallet/balance', token]);
        }
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span className="hidden sm:inline">
        ${availableBalance.toFixed(2)}
      </span>
      {blockedBalance > 0 && (
        <span className="hidden sm:inline text-xs text-[var(--muted-foreground)]">
          (${blockedBalance.toFixed(2)} blocked)
        </span>
      )}
    </Link>
  );
};

