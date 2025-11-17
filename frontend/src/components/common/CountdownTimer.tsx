'use client';

import clsx from "clsx";
import { useCountdown } from "../../hooks/useCountdown";
import { useSocketContext } from "../../context/SocketContext";

interface CountdownTimerProps {
  endTime: string;
  className?: string;
}

export const CountdownTimer = ({
  endTime,
  className,
}: CountdownTimerProps) => {
  const { serverTimeOffset } = useSocketContext();
  const countdown = useCountdown(endTime, serverTimeOffset);

  return (
    <div
      className={clsx("rounded-2xl border px-4 py-3 text-center", className)}
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--card)',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
        Time Remaining
      </p>
      <p
        className="mt-1 text-3xl font-semibold"
        style={{ color: countdown.isExpired ? 'var(--error)' : 'var(--success)' }}
      >
        {countdown.formatted}
      </p>
    </div>
  );
};

