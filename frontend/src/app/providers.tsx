'use client';

import { ThemeProvider } from 'next-themes';
import { AuthProvider } from "../context/AuthContext";
import { SocketProvider } from "../context/SocketContext";

export const Providers = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <AuthProvider>
      <SocketProvider>{children}</SocketProvider>
    </AuthProvider>
  </ThemeProvider>
);

