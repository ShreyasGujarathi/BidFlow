import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { NavBar } from "../components/navigation/NavBar";
import { RoutePrefetcher } from "../components/navigation/RoutePrefetcher";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BidFlow",
  description: "Real-time auction platform for buyers and sellers.",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml', sizes: '512x512' },
    ],
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased`}
        style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
      >
        <Providers>
          <div className="flex min-h-screen flex-col" style={{ backgroundColor: 'var(--background)' }}>
            <NavBar />
            <RoutePrefetcher />
            <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-10" style={{ backgroundColor: 'var(--background)' }}>
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

