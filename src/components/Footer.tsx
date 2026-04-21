import Link from "next/link";

export default function Footer() {
  return (
    <footer
      role="contentinfo"
      className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-surface-strong)] text-white"
    >
      <div className="mx-auto max-w-[1440px] px-[var(--space-6)] py-[40px] lg:px-[var(--space-8)]">
        <div className="grid grid-cols-1 gap-[32px] sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h2 className="mb-[var(--space-6)] text-xl font-bold">
              OtterSpace
            </h2>
            <p className="text-[var(--font-size-xs)] leading-relaxed text-gray-300">
              Learn without limits. Access world-class courses from expert
              instructors, anytime, anywhere.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-[var(--space-6)] text-[var(--font-size-xs)] font-bold uppercase tracking-wider text-gray-400">
              Quick Links
            </h3>
            <ul className="flex list-none flex-col gap-[var(--space-3)] p-0">
              <li>
                <Link
                  href="/courses"
                  className="text-[var(--font-size-xs)] text-gray-300 no-underline transition-colors hover:text-white"
                >
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-[var(--font-size-xs)] text-gray-300 no-underline transition-colors hover:text-white"
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-[var(--font-size-xs)] text-gray-300 no-underline transition-colors hover:text-white"
                >
                  Log In
                </Link>
              </li>
            </ul>
          </div>

          {/* For Instructors */}
          <div>
            <h3 className="mb-[var(--space-6)] text-[var(--font-size-xs)] font-bold uppercase tracking-wider text-gray-400">
              For Instructors
            </h3>
            <ul className="flex list-none flex-col gap-[var(--space-3)] p-0">
              <li>
                <Link
                  href="/register"
                  className="text-[var(--font-size-xs)] text-gray-300 no-underline transition-colors hover:text-white"
                >
                  Become an Instructor
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/instructor"
                  className="text-[var(--font-size-xs)] text-gray-300 no-underline transition-colors hover:text-white"
                >
                  Manage Courses
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-[var(--space-6)] text-[var(--font-size-xs)] font-bold uppercase tracking-wider text-gray-400">
              Community
            </h3>
            <ul className="flex list-none flex-col gap-[var(--space-3)] p-0">
              <li>
                <span className="text-[var(--font-size-xs)] text-gray-300">
                  About Us
                </span>
              </li>
              <li>
                <span className="text-[var(--font-size-xs)] text-gray-300">
                  Help Center
                </span>
              </li>
              <li>
                <span className="text-[var(--font-size-xs)] text-gray-300">
                  Privacy Policy
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-[32px] border-t border-gray-600 pt-[var(--space-8)] text-center">
          <p className="text-[var(--font-size-xs)] text-gray-400">
            &copy; {new Date().getFullYear()} OtterSpace. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
