'use client';

import { useEffect, useState } from "react";
import { Notification } from "../../lib/types";
import { markNotificationsAsRead } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { formatDistanceToNow } from "date-fns";

interface NotificationListProps {
  notifications: Notification[];
}

export const NotificationList = ({ notifications }: NotificationListProps) => {
  const { token } = useAuth();
  const [pending, setPending] = useState(false);
  const unreadIds = notifications
    .filter((notification) => !notification.read)
    .map((notification) => notification._id);

  useEffect(() => {
    if (!token || unreadIds.length === 0) return;

    const timeout = setTimeout(async () => {
      try {
        setPending(true);
        await markNotificationsAsRead(token, unreadIds);
      } catch (error) {
        console.error("Failed to mark notifications", error);
      } finally {
        setPending(false);
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [token, unreadIds.join(",")]);

  return (
    <div
      className="space-y-3 rounded-2xl border p-5"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', boxShadow: 'var(--shadow-soft)' }}
    >
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Notifications</h2>
        {pending && (
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Updating status…</span>
        )}
      </header>
      {notifications.length === 0 && (
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>You are all caught up!</p>
      )}
      <ul className="space-y-2">
        {notifications.map((notification) => (
          <li
            key={notification._id}
            className="rounded-lg border px-4 py-3 text-sm"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--surface)',
              color: 'var(--foreground)',
            }}
          >
            <div className="flex items-start justify-between">
              <p className="font-medium" style={{ color: 'var(--foreground)' }}>{notification.message}</p>
              {!notification.read && (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                >
                  New
                </span>
              )}
            </div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
              })}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

