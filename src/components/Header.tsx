"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const { user, isLoading, logout, isStudent, isInstructor } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header
      role="banner"
      className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]/90 backdrop-blur-md transition-all duration-300"
    >
      <div className="mx-auto flex h-[64px] max-w-[1440px] items-center justify-between px-[var(--space-6)] lg:px-[var(--space-8)]">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-[var(--space-3)] text-[var(--font-size-lg)] font-bold text-[var(--color-text-primary)] no-underline"
          aria-label="OtterSpace home"
        >
          <Image
            src="/logo.svg"
            alt="OtterSpace logo"
            width={32}
            height={32}
            className="transition-transform duration-300 group-hover:scale-110"
            priority
          />
          <span className="hidden text-3xl text-[var(--color-brand-primary)] sm:inline">OtterSpace</span>
        </Link>

        {/* Desktop Nav */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-[var(--space-7)] md:flex"
        >
          {[
            { label: "Browse Courses", href: "/courses" },
            ...(isStudent ? [{ label: "My Learning", href: "/dashboard/student" }] : []),
            ...(isInstructor ? [{ label: "Instructor Dashboard", href: "/dashboard/instructor" }] : []),
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative py-2 text-[var(--font-size-xs)] font-semibold text-[var(--color-text-secondary)] no-underline transition-colors hover:text-[var(--color-text-primary)] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-[var(--color-brand-primary)] after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth Actions */}
        <div className="hidden items-center gap-[var(--space-5)] md:flex">
          {isLoading ? (
            <div className="h-[36px] w-[80px] animate-pulse rounded-[var(--radius-xs)] bg-[var(--color-surface-muted)]" />
          ) : user ? (
            <>
              <span className="text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="cursor-pointer rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-transparent px-[var(--space-6)] py-[var(--space-3)] text-[var(--font-size-xs)] font-semibold text-[var(--color-text-primary)] transition-all duration-300 hover:bg-[var(--color-surface-muted)] hover:shadow-sm active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-primary)]"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-[var(--radius-xs)] border border-[var(--color-brand-primary)] bg-transparent px-[var(--space-6)] py-[var(--space-3)] text-[var(--font-size-xs)] font-semibold text-[var(--color-brand-primary)] no-underline transition-all duration-300 hover:bg-[var(--color-surface-muted)] hover:shadow-sm active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-primary)]"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="rounded-[var(--radius-xs)] bg-[var(--color-brand-primary)] px-[var(--space-6)] py-[var(--space-3)] text-[var(--font-size-xs)] font-semibold text-white no-underline transition-all duration-300 hover:bg-[var(--color-brand-hover)] hover:shadow-md active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-primary)]"
              >
                Join for Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-[var(--radius-xs)] border-none bg-transparent md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {mobileOpen ? (
              <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile navigation"
          className="border-t border-[var(--color-border)] bg-[var(--color-surface-raised)] px-[var(--space-6)] py-[var(--space-6)] md:hidden"
        >
          <ul className="flex list-none flex-col gap-[var(--space-6)] p-0">
            <li>
              <Link
                href="/courses"
                onClick={() => setMobileOpen(false)}
                className="text-[var(--font-size-sm)] font-semibold text-[var(--color-text-primary)] no-underline"
              >
                Browse Courses
              </Link>
            </li>
            {isStudent && (
              <li>
                <Link
                  href="/dashboard/student"
                  onClick={() => setMobileOpen(false)}
                  className="text-[var(--font-size-sm)] font-semibold text-[var(--color-text-primary)] no-underline"
                >
                  My Learning
                </Link>
              </li>
            )}
            {isInstructor && (
              <li>
                <Link
                  href="/dashboard/instructor"
                  onClick={() => setMobileOpen(false)}
                  className="text-[var(--font-size-sm)] font-semibold text-[var(--color-text-primary)] no-underline"
                >
                  Instructor Dashboard
                </Link>
              </li>
            )}
            <li className="border-t border-[var(--color-border)] pt-[var(--space-6)]">
              {user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="w-full cursor-pointer rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-transparent px-[var(--space-6)] py-[var(--space-3)] text-[var(--font-size-sm)] font-semibold text-[var(--color-text-primary)]"
                >
                  Log Out
                </button>
              ) : (
                <div className="flex flex-col gap-[var(--space-3)]">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-[var(--radius-xs)] border border-[var(--color-brand-primary)] bg-transparent px-[var(--space-6)] py-[var(--space-3)] text-center text-[var(--font-size-sm)] font-semibold text-[var(--color-brand-primary)] no-underline"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-[var(--radius-xs)] bg-[var(--color-brand-primary)] px-[var(--space-6)] py-[var(--space-3)] text-center text-[var(--font-size-sm)] font-semibold text-white no-underline"
                  >
                    Join for Free
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
