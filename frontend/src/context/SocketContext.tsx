'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "../lib/api";
import { useAuth } from "./AuthContext";

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
  serverTimeOffset: number;
  joinAuction: (auctionId: string) => void;
  leaveAuction: (auctionId: string) => void;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [serverTimeOffset, setServerTimeOffset] = useState(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setupSocket = useCallback(
    (authToken?: string) => {
      // Clean up existing socket
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      // Clear any pending reconnection attempts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      const socket = io(API_BASE_URL, {
        transports: ["websocket", "polling"], // Allow fallback to polling
        autoConnect: false,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        timeout: 20000,
      });

      if (authToken) {
        socket.auth = { token: authToken };
      }

      socket.on("connect", () => {
        setConnected(true);
        // Clear any pending reconnection attempts on successful connection
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      });

      socket.on("disconnect", (reason) => {
        setConnected(false);
        // Only attempt manual reconnection if it wasn't intentional
        if (reason === "io server disconnect") {
          // Server disconnected, try to reconnect
          reconnectTimeoutRef.current = setTimeout(() => {
            if (socketRef.current && !socketRef.current.connected) {
              socketRef.current.connect();
            }
          }, 1000);
        }
      });

      socket.on("connect_error", (error) => {
        console.warn("Socket connection error:", error.message);
        setConnected(false);
      });

      socket.on("connection:ack", (payload: { serverTime: number }) => {
        setServerTimeOffset(payload.serverTime - Date.now());
      });

      socket.on("server:time", (payload: { serverTime: number }) => {
        setServerTimeOffset(payload.serverTime - Date.now());
      });

      // Connect the socket
      socket.connect();
      socketRef.current = socket;
    },
    []
  );

  useEffect(() => {
    setupSocket(token ?? undefined);
    return () => {
      // Clean up socket and timeouts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setConnected(false);
    };
  }, [token, setupSocket]);

  const joinAuction = useCallback((auctionId: string) => {
    socketRef.current?.emit("joinAuction", auctionId);
  }, []);

  const leaveAuction = useCallback((auctionId: string) => {
    socketRef.current?.emit("leaveAuction", auctionId);
  }, []);

  const value = useMemo(
    () => ({
      socket: socketRef.current,
      connected,
      serverTimeOffset,
      joinAuction,
      leaveAuction,
    }),
    [connected, serverTimeOffset, joinAuction, leaveAuction]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within SocketProvider");
  }
  return context;
};

