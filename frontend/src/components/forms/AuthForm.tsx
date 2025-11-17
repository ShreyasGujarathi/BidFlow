'use client';

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { AuthPayload } from "../../lib/api";

type AuthMode = "login" | "register";

interface AuthFormProps {
  mode: AuthMode;
}

export const AuthForm = ({ mode }: AuthFormProps) => {
  const router = useRouter();
  const { login, register } = useAuth();
  const [formState, setFormState] = useState<AuthPayload>({
    username: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (mode === "login") {
        await login({
          email: formState.email,
          password: formState.password,
        });
      } else {
        await register(formState);
      }
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-md space-y-6 rounded-2xl border p-8 backdrop-blur-sm"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--surface)',
        boxShadow: 'var(--shadow-soft)'
      }}
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {mode === "login"
            ? "Sign in to continue to Auction Hub"
            : "Join Auction Hub to start bidding"}
        </p>
      </div>

      <div className="space-y-5">
        {mode === "register" && (
          <div className="space-y-2">
            <label className="block text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              Username
            </label>
            <input
              type="text"
              required
              value={formState.username}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  username: event.target.value,
                }))
              }
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)'
              }}
              placeholder="Enter your username"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            Email
          </label>
          <input
            type="email"
            required
            value={formState.email}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                email: event.target.value,
              }))
            }
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)'
            }}
            placeholder="Enter your email"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            Password
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={formState.password}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                password: event.target.value,
              }))
            }
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)'
            }}
            placeholder="Enter your password"
          />
          {mode === "register" && (
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Must be at least 6 characters</p>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-sm font-medium text-red-300" role="alert">
            {error}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl px-6 py-3 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        style={{
          backgroundColor: 'var(--primary)',
          color: 'var(--primary-foreground)',
          boxShadow: 'var(--accent-glow)'
        }}
      >
        {submitting
          ? "Please wait..."
          : mode === "login"
          ? "Sign in"
          : "Create account"}
      </button>

      <div className="pt-4 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
        {mode === "login" ? (
          <>
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Register
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Sign in
            </Link>
          </>
        )}
      </div>
    </form>
  );
};

