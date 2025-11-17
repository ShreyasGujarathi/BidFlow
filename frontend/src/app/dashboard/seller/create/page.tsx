'use client';

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "../../../../context/AuthContext";

// Dynamic import for heavy CreateAuctionForm component
const CreateAuctionForm = dynamic(
  () => import("../../../../components/forms/CreateAuctionForm").then(mod => ({ default: mod.CreateAuctionForm })),
  {
    loading: () => (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="rounded-xl border p-6 animate-pulse" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
          <div className="h-8 w-48 rounded mb-6" style={{ backgroundColor: 'var(--surface)' }} />
          <div className="space-y-4">
            <div className="h-10 w-full rounded" style={{ backgroundColor: 'var(--surface)' }} />
            <div className="h-24 w-full rounded" style={{ backgroundColor: 'var(--surface)' }} />
            <div className="h-64 w-full rounded" style={{ backgroundColor: 'var(--surface)' }} />
          </div>
        </div>
      </div>
    ),
    ssr: false,
  }
);

export default function SellerCreateAuctionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
        {loading ? "Loading…" : "Redirecting to login…"}
      </p>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <Suspense fallback={
        <div className="rounded-xl border p-6 animate-pulse" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
          <div className="h-8 w-48 rounded mb-6" style={{ backgroundColor: 'var(--surface)' }} />
          <div className="space-y-4">
            <div className="h-10 w-full rounded" style={{ backgroundColor: 'var(--surface)' }} />
            <div className="h-24 w-full rounded" style={{ backgroundColor: 'var(--surface)' }} />
            <div className="h-64 w-full rounded" style={{ backgroundColor: 'var(--surface)' }} />
          </div>
        </div>
      }>
        <CreateAuctionForm />
      </Suspense>
    </div>
  );
}

