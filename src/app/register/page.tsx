"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { register as apiRegister, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await apiRegister(email, password, role);
      const payload = JSON.parse(atob(res.accessToken.split(".")[1]));
      login(res.accessToken, payload.email, payload.roles.split(","));

      if (role === "INSTRUCTOR") {
        router.push("/dashboard/instructor");
      } else {
        router.push("/courses");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.errors ? err.errors.join(", ") : err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[var(--color-surface-muted)] px-[var(--space-6)] py-[40px]">
      <div className="w-full max-w-[440px] rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-[32px] shadow-sm">
        <h1 className="mb-[var(--space-3)] text-[var(--font-size-lg)] font-bold text-[var(--color-text-primary)]">
          Join OtterSpace for free
        </h1>
        <p className="mb-[var(--space-8)] text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">
          Create an account to start learning or teaching.
        </p>

        {error && (
          <div
            role="alert"
            className="mb-[var(--space-6)] rounded-[var(--radius-xs)] border border-red-200 bg-red-50 px-[var(--space-6)] py-[var(--space-3)] text-[var(--font-size-xs)] text-[var(--color-error)]"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-[var(--space-6)]">
            <label
              htmlFor="email"
              className="mb-[var(--space-2)] block text-[var(--font-size-xs)] font-semibold text-[var(--color-text-primary)]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-[var(--space-5)] py-[var(--space-4)] text-[var(--font-size-xs)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-border-focus)] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-primary)]"
            />
          </div>

          <div className="mb-[var(--space-6)]">
            <label
              htmlFor="password"
              className="mb-[var(--space-2)] block text-[var(--font-size-xs)] font-semibold text-[var(--color-text-primary)]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-[var(--space-5)] py-[var(--space-4)] text-[var(--font-size-xs)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-border-focus)] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-primary)]"
            />
          </div>

          <fieldset className="mb-[var(--space-8)] border-none p-0">
            <legend className="mb-[var(--space-3)] text-[var(--font-size-xs)] font-semibold text-[var(--color-text-primary)]">
              I want to
            </legend>
            <div className="flex gap-[var(--space-5)]">
              <label
                className={`flex flex-1 cursor-pointer items-center justify-center rounded-[var(--radius-xs)] border-2 px-[var(--space-6)] py-[var(--space-4)] text-center text-[var(--font-size-xs)] font-semibold transition-colors ${
                  role === "STUDENT"
                    ? "border-[var(--color-brand-primary)] bg-[var(--color-surface-muted)] text-[var(--color-brand-primary)]"
                    : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-gray-400"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="STUDENT"
                  checked={role === "STUDENT"}
                  onChange={(e) => setRole(e.target.value)}
                  className="sr-only"
                />
                Learn
              </label>
              <label
                className={`flex flex-1 cursor-pointer items-center justify-center rounded-[var(--radius-xs)] border-2 px-[var(--space-6)] py-[var(--space-4)] text-center text-[var(--font-size-xs)] font-semibold transition-colors ${
                  role === "INSTRUCTOR"
                    ? "border-[var(--color-brand-primary)] bg-[var(--color-surface-muted)] text-[var(--color-brand-primary)]"
                    : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-gray-400"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="INSTRUCTOR"
                  checked={role === "INSTRUCTOR"}
                  onChange={(e) => setRole(e.target.value)}
                  className="sr-only"
                />
                Teach
              </label>
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-[var(--radius-xs)] bg-[var(--color-brand-primary)] px-[var(--space-6)] py-[var(--space-4)] text-[var(--font-size-sm)] font-semibold text-white transition-colors hover:bg-[var(--color-brand-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-primary)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Sign Up for Free"}
          </button>
        </form>

        <p className="mt-[var(--space-8)] text-center text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">
          Already on OtterSpace?{" "}
          <Link
            href="/login"
            className="font-semibold text-[var(--color-brand-primary)] no-underline hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
