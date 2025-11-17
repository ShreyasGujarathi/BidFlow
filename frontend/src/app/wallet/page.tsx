'use client';

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useWalletBalance, useTransactionHistory } from "../../lib/swr";
import { addFunds } from "../../lib/api";
import { mutate } from "swr";
import { useSocketContext } from "../../context/SocketContext";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

export default function WalletPage() {
  const { token, user } = useAuth();
  const { socket } = useSocketContext();
  const { data: balance, error: balanceError } = useWalletBalance(token || undefined);
  const { data: transactions } = useTransactionHistory(token || undefined, 50);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Listen for wallet updates via socket
  useEffect(() => {
    if (!socket || !user) return;

    const handleWalletUpdate = (data: { message?: string }) => {
      if (token) {
        mutate(['/api/wallet/balance', token]);
        mutate([`/api/wallet/transactions?limit=50`, token]);
      }
      if (data.message) {
        setMessage({ type: "success", text: data.message });
        setTimeout(() => setMessage(null), 5000);
      }
    };

    socket.on("wallet:updated", handleWalletUpdate);
    socket.on(`user:${user.id}`, handleWalletUpdate);

    return () => {
      socket.off("wallet:updated", handleWalletUpdate);
      socket.off(`user:${user.id}`, handleWalletUpdate);
    };
  }, [socket, user, token]);

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setMessage({ type: "error", text: "Please enter a valid amount" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await addFunds(numAmount, token);
      setMessage({ type: "success", text: `Successfully added $${numAmount.toFixed(2)} to wallet!` });
      setAmount("");
      
      // Revalidate wallet data
      mutate(['/api/wallet/balance', token]);
      mutate([`/api/wallet/transactions?limit=50`, token]);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to add funds",
      });
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [10, 25, 50, 100, 250, 500];

  if (!user) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Please log in to access your wallet.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Wallet</h1>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Manage your wallet balance and view transaction history.
        </p>
      </header>

      {/* Balance Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
              Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
              ${balance?.availableBalance.toFixed(2) ?? "0.00"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
              ${balance?.walletBalance.toFixed(2) ?? "0.00"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
              Blocked Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: 'var(--warning)' }}>
              ${balance?.blockedBalance.toFixed(2) ?? "0.00"}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
              Funds held for active bids
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Funds Section */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: 'var(--foreground)' }}>Add Funds</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddFunds} className="space-y-4">
            {message && (
              <div
                className={`rounded-lg p-3 text-sm ${
                  message.type === "success"
                    ? "bg-[var(--success-bg)] text-[var(--success)]"
                    : "bg-[var(--error-bg)] text-[var(--error)]"
                }`}
              >
                {message.text}
              </div>
            )}

            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--foreground)' }}
              >
                Amount ($)
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border px-4 py-2"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--foreground)',
                }}
                placeholder="0.00"
                required
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="rounded-full"
                >
                  ${quickAmount}
                </Button>
              ))}
            </div>

            <Button
              type="submit"
              disabled={loading || !amount}
              className="w-full rounded-full"
            >
              {loading ? "Adding Funds..." : "Add Funds"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: 'var(--foreground)' }}>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between rounded-lg border p-3"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--surface)',
                  }}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      {transaction.description || transaction.type}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {new Date(transaction.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        transaction.type === "deposit" || transaction.type === "bid_release"
                          ? "text-[var(--success)]"
                          : transaction.type === "bid_capture"
                          ? "text-[var(--error)]"
                          : "text-[var(--foreground)]"
                      }`}
                    >
                      {transaction.type === "deposit" || transaction.type === "bid_release"
                        ? "+"
                        : transaction.type === "bid_capture"
                        ? "-"
                        : ""}
                      ${transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-xs capitalize" style={{ color: 'var(--muted-foreground)' }}>
                      {transaction.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center py-8" style={{ color: 'var(--muted-foreground)' }}>
              No transactions yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

