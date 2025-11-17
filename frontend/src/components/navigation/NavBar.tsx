'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ThemeToggle } from "../common/ThemeToggle";
import { WalletButton } from "../wallet/WalletButton";
import clsx from "clsx";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/admin", label: "Admin" },
];

const getNavItems = (userId?: string) => {
  const items = [...navItems];
  // Add Profile link for logged-in users
  if (userId) {
    items.push({ href: `/users/${userId}`, label: "Profile" });
  }
  return items;
};

export const NavBar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const visibleItems = useMemo(() => {
    const items = getNavItems(user?.id);
    return items.filter((item: { href: string; label: string }) => {
      if (item.href === "/admin" && user?.role !== "admin") return false;
      return true;
    });
  }, [user]);

  const NavLinks = ({ isMobile = false }: { isMobile?: boolean }) => (
    <ul
      className={clsx(
        "flex gap-1",
        isMobile
          ? "flex-col gap-2"
          : "items-center text-sm font-medium"
      )}
    >
      {visibleItems.map((item: { href: string; label: string }) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              prefetch={true}
              className={clsx(
                "rounded-full px-4 py-2 transition-all duration-200",
                isActive
                  ? "bg-[var(--primary)] text-white shadow-[0_12px_30px_rgba(59,167,255,0.45)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]"
              )}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const AuthActions = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div
      className={clsx(
        "items-center gap-3",
        isMobile ? "flex flex-col" : "hidden sm:flex"
      )}
    >
      {user ? (
        <>
          <WalletButton />
          <div className="flex flex-col text-left leading-tight text-[var(--muted-foreground)] sm:flex-row sm:items-center sm:gap-2">
            <span className="text-xs uppercase tracking-[0.2em]">
              Logged in
            </span>
            <Link
              href={`/users/${user.id}`}
              prefetch={true}
              className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--primary)]"
              onClick={() => setMenuOpen(false)}
            >
              {user.username}
            </Link>
          </div>
          <button
            onClick={() => {
              logout();
              setMenuOpen(false);
            }}
            className="w-full rounded-full border border-[var(--error-border)] bg-[var(--error-bg)] px-5 py-2 text-sm font-semibold text-[var(--error)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(248,113,113,0.35)] sm:w-auto"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link
            href="/auth/login"
            prefetch={true}
            className="inline-flex w-full items-center justify-center rounded-full border border-[var(--border)] px-5 py-2 text-sm font-semibold text-[var(--foreground)] transition-all hover:-translate-y-0.5 hover:bg-[var(--surface)] sm:w-auto"
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            prefetch={true}
            className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[var(--primary)] via-[#5b73ff] to-[#7c3bff] px-5 py-2 text-sm font-semibold text-white shadow-[0_20px_45px_rgba(59,167,255,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_28px_55px_rgba(59,167,255,0.45)] sm:w-auto"
            onClick={() => setMenuOpen(false)}
          >
            Get started
          </Link>
        </>
      )}
      <ThemeToggle />
    </div>
  );

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:pt-6">
      <div className="mx-auto max-w-6xl">
        <nav className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--card-border)] bg-[var(--glass)] px-4 py-3 shadow-[var(--shadow-soft)] backdrop-blur-2xl sm:px-6 sm:py-4">
          <Link
            href="/"
            className="flex items-center gap-3"
            prefetch={true}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--surface)] text-[var(--primary)] shadow-[0_15px_30px_rgba(59,167,255,0.35)]">
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
                  d="M9 12l2 2 4-4M7 7h10a2 2 0 012 2v9a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z"
                />
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold text-[var(--foreground)]">
                Auction Hub
              </span>
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                Live bidding
              </span>
            </div>
          </Link>

          <div className="hidden flex-1 items-center justify-center sm:flex">
            <NavLinks />
          </div>

          <div className="hidden sm:flex">
            <AuthActions />
          </div>

          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--foreground)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] sm:hidden"
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </nav>

        {menuOpen && (
          <div className="mt-3 rounded-2xl border border-[var(--card-border)] bg-[var(--glass-strong)] p-4 shadow-[var(--shadow-soft)] backdrop-blur-2xl sm:hidden">
            <NavLinks isMobile />
            <div className="mt-4 border-t border-[var(--border)] pt-4">
              <AuthActions isMobile />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

