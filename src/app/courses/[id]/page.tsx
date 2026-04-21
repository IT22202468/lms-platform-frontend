"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  getCourse,
  enrollInCourse,
  ApiError,
  type CourseResponse,
} from "@/lib/api";

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token, isLoading: authLoading, isStudent } = useAuth();
  const router = useRouter();

  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.push("/login");
      return;
    }

    (async () => {
      try {
        const data = await getCourse(token, id);
        setCourse(data);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setError("Course not found.");
        } else {
          setError("Failed to load course.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, token, id, router]);

  async function handleEnroll() {
    if (!token) return;
    setEnrolling(true);
    setError("");

    try {
      await enrollInCourse(token, id);
      setEnrolled(true);
      setSuccessMsg("You have been enrolled successfully!");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.message.includes("Already enrolled")) {
          setEnrolled(true);
          setSuccessMsg("You are already enrolled in this course.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to enroll. Please try again.");
      }
    } finally {
      setEnrolling(false);
    }
  }

  if (loading || authLoading) {
    return (
      <div className="mx-auto max-w-[900px] px-[var(--space-6)] py-[40px]">
        <div className="animate-pulse">
          <div className="mb-[var(--space-6)] h-[36px] w-2/3 rounded bg-gray-200" />
          <div className="mb-[var(--space-3)] h-[16px] w-1/3 rounded bg-gray-100" />
          <div className="mb-[var(--space-8)] h-[100px] rounded bg-gray-100" />
          <div className="h-[44px] w-[200px] rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="mx-auto max-w-[900px] px-[var(--space-6)] py-[40px] text-center">
        <h1 className="mb-[var(--space-3)] text-[var(--font-size-lg)] font-bold text-[var(--color-text-primary)]">
          {error}
        </h1>
        <Link
          href="/courses"
          className="text-[var(--font-size-xs)] font-semibold text-[var(--color-brand-primary)] no-underline hover:underline"
        >
          Back to courses
        </Link>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="bg-[var(--color-surface-muted)]">
      {/* Course Banner */}
      <div className="bg-[var(--color-surface-strong)]">
        <div className="mx-auto max-w-[900px] px-[var(--space-6)] py-[40px] lg:px-[var(--space-8)]">
          <nav aria-label="Breadcrumb" className="mb-[var(--space-6)]">
            <ol className="flex list-none gap-[var(--space-3)] p-0 text-[var(--font-size-xs)]">
              <li>
                <Link href="/courses" className="text-gray-300 no-underline hover:text-white">
                  Courses
                </Link>
              </li>
              <li className="text-gray-500" aria-hidden="true">/</li>
              <li className="text-gray-400" aria-current="page">
                {course.title}
              </li>
            </ol>
          </nav>

          <h1 className="mb-[var(--space-6)] text-[var(--font-size-xl)] font-bold leading-tight text-white md:text-[var(--font-size-2xl)]">
            {course.title}
          </h1>

          <p className="mb-[var(--space-8)] max-w-[640px] text-[var(--font-size-sm)] leading-relaxed text-gray-300">
            {course.description}
          </p>

          <div className="flex flex-wrap items-center gap-[var(--space-6)] text-[var(--font-size-xs)] text-gray-400">
            <span>
              Created{" "}
              {new Date(course.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {course.published ? (
              <span className="rounded-[var(--radius-xl)] bg-green-900/40 px-[var(--space-3)] py-[var(--space-1)] text-green-300">
                Published
              </span>
            ) : (
              <span className="rounded-[var(--radius-xl)] bg-amber-900/40 px-[var(--space-3)] py-[var(--space-1)] text-amber-300">
                Draft
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mx-auto max-w-[900px] px-[var(--space-6)] py-[32px] lg:px-[var(--space-8)]">
        <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-[var(--space-8)]">
          {error && (
            <div
              role="alert"
              className="mb-[var(--space-6)] rounded-[var(--radius-xs)] border border-red-200 bg-red-50 px-[var(--space-6)] py-[var(--space-3)] text-[var(--font-size-xs)] text-[var(--color-error)]"
            >
              {error}
            </div>
          )}

          {successMsg && (
            <div
              role="status"
              className="mb-[var(--space-6)] rounded-[var(--radius-xs)] border border-green-200 bg-green-50 px-[var(--space-6)] py-[var(--space-3)] text-[var(--font-size-xs)] text-[var(--color-success)]"
            >
              {successMsg}
            </div>
          )}

          {isStudent && course.published && !enrolled && (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="cursor-pointer rounded-[var(--radius-xs)] bg-[var(--color-brand-primary)] px-[var(--space-8)] py-[var(--space-4)] text-[var(--font-size-sm)] font-semibold text-white transition-colors hover:bg-[var(--color-brand-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-primary)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enrolling ? "Enrolling..." : "Enroll Now – Free"}
            </button>
          )}

          {enrolled && (
            <div className="flex items-center gap-[var(--space-3)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" fill="var(--color-success)" />
                <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[var(--font-size-sm)] font-semibold text-[var(--color-success)]">
                Enrolled
              </span>
            </div>
          )}

          {!isStudent && (
            <p className="text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">
              Only students can enroll in courses.{" "}
              <Link
                href="/register"
                className="font-semibold text-[var(--color-brand-primary)] no-underline hover:underline"
              >
                Create a student account
              </Link>
            </p>
          )}

          {isStudent && !course.published && (
            <p className="text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">
              This course is not yet published and cannot be enrolled in.
            </p>
          )}

          {/* Course Details */}
          <div className="mt-[var(--space-8)] border-t border-[var(--color-border)] pt-[var(--space-8)]">
            <h2 className="mb-[var(--space-6)] text-[var(--font-size-md)] font-bold text-[var(--color-text-primary)]">
              About this course
            </h2>
            <p className="whitespace-pre-wrap text-[var(--font-size-sm)] leading-relaxed text-[var(--color-text-secondary)]">
              {course.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
