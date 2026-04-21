"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white py-16 lg:py-24">
        {/* Decorative Background Element */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[var(--color-brand-tertiary)]/50 blur-3xl" aria-hidden="true" />

        <div className="mx-auto max-w-[1440px] px-[var(--space-6)] lg:px-[var(--space-8)]">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Text Content */}
            <div className="animate-slide-in-right text-left">
              <span className="mb-4 inline-block rounded-full bg-[var(--color-brand-tertiary)] px-4 py-1.5 text-[var(--font-size-xs)] font-bold tracking-wide text-[var(--color-brand-primary)]">
                LEARN FROM THE BEST
              </span>
              <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-[var(--color-text-primary)] sm:text-5xl md:text-6xl">
                Master New Skills <br />
                <span className="text-[var(--color-brand-primary)]">Without Limits</span>
              </h1>
              <p className="mb-8 max-w-[540px] text-[var(--font-size-sm)] leading-relaxed text-[var(--color-text-secondary)] md:text-[var(--font-size-md)]">
                Access over 5,000+ world-class courses from top instructors. Join 10M+ learners building their future today.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/courses"
                  className="rounded-[var(--radius-xs)] bg-[var(--color-brand-primary)] px-8 py-4 text-[var(--font-size-sm)] font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--color-brand-hover)] hover:shadow-xl active:scale-95"
                >
                  Explore All Courses
                </Link>
                {!user && (
                  <Link
                    href="/register"
                    className="rounded-[var(--radius-xs)] border-2 border-[var(--color-brand-primary)] bg-transparent px-8 py-4 text-[var(--font-size-sm)] font-bold text-[var(--color-brand-primary)] transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--color-brand-tertiary)] active:scale-95"
                  >
                    Join for Free
                  </Link>
                )}
              </div>

              {/* Trust Indicators */}
              {/* <div className="mt-12 flex items-center gap-6 opacity-70">
                <p className="text-[12px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">Trusted by:</p>
                <div className="flex gap-4 grayscale transition-all duration-300 hover:grayscale-0">
                  <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
              </div> */}
            </div>

            {/* Visual Grid / Carousel Placeholder */}
            <div className="relative lg:block">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <div className="relative h-[250px] overflow-hidden rounded-2xl shadow-2xl transition-transform duration-500 hover:scale-[1.02] animate-slide-up">
                    <Image
                      src="/students-collaborating.webp"
                      alt="Students collaborating"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative h-[150px] overflow-hidden rounded-2xl shadow-2xl transition-transform duration-500 hover:scale-[1.02] animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <Image
                      src="/self-learning.webp"
                      alt="Self Learning"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="relative h-[150px] overflow-hidden rounded-2xl shadow-2xl transition-transform duration-500 hover:scale-[1.02] animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <Image
                      // src="https://images.unsplash.com/photo-1501504905953-f831fe9677c3?auto=format&fit=crop&w=400&h=300&q=80"
                      src="/online-learning-platform.webp"
                      alt="Online learning workspace"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative h-[250px] overflow-hidden rounded-2xl shadow-2xl transition-transform duration-500 hover:scale-[1.02] animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    <Image
                      src="/lecturer-and-student.webp"
                      alt="Lecturer and Student"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              {/* <div className="absolute -bottom-6 -left-6 animate-pulse-slow rounded-xl bg-white p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gray-200" />
                    ))}
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-[var(--color-text-primary)]">10k+ Students</p>
                    <p className="text-[10px] text-[var(--color-text-secondary)]">Recently Enrolled</p>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[var(--color-surface-raised)]">
        <div className="mx-auto max-w-[1440px] px-[var(--space-6)] py-[64px] lg:px-[var(--space-8)]">
          <h2 className="mb-[40px] text-center text-[var(--font-size-xl)] font-bold text-[var(--color-text-primary)]">
            Why choose OtterSpace?
          </h2>
          <div className="grid grid-cols-1 gap-[var(--space-8)] sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path d="M12 14l9-5-9-5-9 5 9 5z" fill="var(--color-brand-primary)" />
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" fill="var(--color-brand-primary)" opacity="0.5" />
                  </svg>
                ),
                title: "Expert Instructors",
                desc: "Learn from industry-leading professionals who bring real-world experience to every course.",
              },
              {
                icon: (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="3" stroke="var(--color-brand-primary)" strokeWidth="2" />
                    <path d="M9 12l2 2 4-4" stroke="var(--color-brand-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                title: "Hands-on Learning",
                desc: "Apply what you learn with practical exercises and real-world projects that build your portfolio.",
              },
              {
                icon: (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="var(--color-brand-primary)" strokeWidth="2" />
                    <path d="M12 7v5l3 3" stroke="var(--color-brand-primary)" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ),
                title: "Learn at Your Pace",
                desc: "Access courses anytime, anywhere. Study on your schedule with lifetime access to enrolled content.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-center rounded-[var(--radius-sm)] border border-[var(--color-border)] p-[var(--space-8)] text-center"
              >
                <div className="mb-[var(--space-6)]" aria-hidden="true">
                  {feature.icon}
                </div>
                <h3 className="mb-[var(--space-3)] text-[var(--font-size-md)] font-semibold text-[var(--color-text-primary)]">
                  {feature.title}
                </h3>
                <p className="text-[var(--font-size-xs)] leading-relaxed text-[var(--color-text-secondary)]">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {/* <section className="bg-[var(--color-surface-base)]">
        <div className="mx-auto max-w-[1440px] px-[var(--space-6)] py-[64px] text-center lg:px-[var(--space-8)]">
          <h2 className="mb-[var(--space-6)] text-[var(--font-size-xl)] font-bold text-white">
            Ready to start learning?
          </h2>
          <p className="mb-[var(--space-8)] text-[var(--font-size-sm)] text-gray-300">
            Join thousands of learners already building their future on OtterSpace.
          </p>
          <Link
            href={user ? "/courses" : "/register"}
            className="inline-block rounded-[var(--radius-xs)] bg-[var(--color-brand-primary)] px-[var(--space-8)] py-[var(--space-5)] text-[var(--font-size-sm)] font-semibold text-white no-underline transition-colors hover:bg-[var(--color-brand-hover)]"
          >
            {user ? "Browse Courses" : "Get Started – It's Free"}
          </Link>
        </div>
      </section> */}
    </>
  );
}
