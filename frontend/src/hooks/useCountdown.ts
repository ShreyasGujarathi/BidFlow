'use client';

import { useEffect, useMemo, useState } from "react";

const pad = (value: number) => value.toString().padStart(2, "0");

export const useCountdown = (
  endTime: string | Date,
  serverTimeOffset = 0
) => {
  const [remaining, setRemaining] = useState(() => {
    const end = new Date(endTime).getTime();
    return end - (Date.now() + serverTimeOffset);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const end = new Date(endTime).getTime();
      setRemaining(end - (Date.now() + serverTimeOffset));
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, serverTimeOffset]);

  const formatted = useMemo(() => {
    if (remaining <= 0) {
      return "00:00:00";
    }
    const totalSeconds = Math.floor(remaining / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }, [remaining]);

  return {
    remaining,
    formatted,
    isExpired: remaining <= 0,
    totalSeconds: Math.floor(Math.max(0, remaining) / 1000),
  };
};

