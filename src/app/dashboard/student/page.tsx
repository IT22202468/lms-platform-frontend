"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  listStudentEnrollments,
  getCourse,
  type EnrollmentResponse,
  type CourseResponse,
} from "@/lib/api";
import CourseCard from "@/components/CourseCard";
import Pagination from "@/components/Pagination";

interface EnrolledCourse {
  enrollment: EnrollmentResponse;
  course: CourseResponse;
}

export default function StudentDashboard() {
  const { token, user, isLoading: authLoading, isStudent } = useAuth();
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchEnrollments = useCallback(async () => {
    if (!token) return;
    Promise.resolve().then(() => setLoading(true));
    try {
      const enrollmentPage = await listStudentEnrollments(token, page, 8);
      setTotalPages(enrollmentPage.totalPages);
      setTotalElements(enrollmentPage.totalElements);

      const courses = await Promise.all(
        enrollmentPage.items.map(async (enrollment) => {
          try {
            const course = await getCourse(token, enrollment.courseId);
            return { enrollment, course };
          } catch {
            return null;
          }
        })
      );

      setEnrolledCourses(courses.filter(Boolean) as EnrolledCourse[]);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [token, page, router]);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.push("/login");
      return;
    }
    if (!isStudent) {
      router.push("/");
      return;
    }
    Promise.resolve().then(() => fetchEnrollments());
  }, [authLoading, token, isStudent, fetchEnrollments, router]);

  return (
    <div className="mx-auto max-w-[1440px] animate-fade-in px-[var(--space-6)] py-[32px] lg:px-[var(--space-8)]">
      {/* Header */}
      <div className="mb-[32px]">
        <h1 className="mb-[var(--space-3)] text-[var(--font-size-xl)] font-bold text-[var(--color-text-primary)]">
          My Learning
        </h1>
        <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
          Welcome back{user?.email ? `, ${user.email}` : ""}. Continue where you left off.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-[32px] grid grid-cols-1 gap-[var(--space-6)] sm:grid-cols-3">
        <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-[var(--space-6)]">
          <p className="text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">
            Enrolled Courses
          </p>
          <p className="text-[var(--font-size-xl)] font-bold text-[var(--color-text-primary)]">
            {loading ? "–" : totalElements}
          </p>
        </div>
        <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-[var(--space-6)]">
          <p className="text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">
            In Progress
          </p>
          <p className="text-[var(--font-size-xl)] font-bold text-[var(--color-text-primary)]">
            {loading ? "–" : totalElements}
          </p>
        </div>
        <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-[var(--space-6)]">
          <p className="text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">
            Completed
          </p>
          <p className="text-[var(--font-size-xl)] font-bold text-[var(--color-text-primary)]">
            0
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 gap-[var(--space-8)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-[var(--radius-sm)] border border-[var(--color-border)]"
            >
              <div className="h-[140px] bg-gray-200" />
              <div className="p-[var(--space-6)]">
                <div className="mb-[var(--space-3)] h-[20px] w-3/4 rounded bg-gray-200" />
                <div className="h-[14px] w-full rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && enrolledCourses.length === 0 && (
        <div className="flex flex-col items-center rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-[64px] text-center">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="mb-[var(--space-6)] text-gray-300" aria-hidden="true">
            <path d="M12 14l9-5-9-5-9 5 9 5z" fill="currentColor" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" fill="currentColor" opacity="0.5" />
          </svg>
          <h2 className="mb-[var(--space-3)] text-[var(--font-size-md)] font-semibold text-[var(--color-text-primary)]">
            No enrollments yet
          </h2>
          <p className="mb-[var(--space-6)] text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">
            Explore our course catalog and start learning today.
          </p>
          <Link
            href="/courses"
            className="rounded-[var(--radius-xs)] bg-[var(--color-brand-primary)] px-[var(--space-8)] py-[var(--space-4)] text-[var(--font-size-sm)] font-semibold text-white no-underline transition-colors hover:bg-[var(--color-brand-hover)]"
          >
            Browse Courses
          </Link>
        </div>
      )}

      {/* Course Grid */}
      {!loading && enrolledCourses.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-[var(--space-8)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {enrolledCourses.map(({ course, enrollment }) => (
              <div key={enrollment.id} className="relative">
                <CourseCard course={course} />
                <div className="mt-[var(--space-2)] text-[12px] text-[var(--color-text-secondary)]">
                  Enrolled{" "}
                  {new Date(enrollment.enrolledAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-[40px]">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
