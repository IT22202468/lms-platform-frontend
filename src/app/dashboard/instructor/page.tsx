"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  listInstructorCourses,
  deleteCourse,
  publishCourse,
  type CourseResponse,
  type PageResponse,
} from "@/lib/api";
import Pagination from "@/components/Pagination";

export default function InstructorDashboard() {
  const { token, user, isLoading: authLoading, isInstructor } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<PageResponse<CourseResponse> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    if (!token) return;
    Promise.resolve().then(() => setLoading(true));
    try {
      const res = await listInstructorCourses(token, page, 10);
      setData(res);
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
    if (!isInstructor) {
      router.push("/");
      return;
    }
    Promise.resolve().then(() => fetchCourses());
  }, [authLoading, token, isInstructor, fetchCourses, router]);

  async function handlePublish(courseId: string) {
    if (!token) return;
    setActionLoading(courseId);
    try {
      await publishCourse(token, courseId);
      await fetchCourses();
    } catch {
      alert("Failed to publish course.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(courseId: string) {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;
    setActionLoading(courseId);
    try {
      await deleteCourse(token, courseId);
      await fetchCourses();
    } catch {
      alert("Failed to delete course.");
    } finally {
      setActionLoading(null);
    }
  }

  const published = data?.items.filter((c) => c.published).length || 0;
  const drafts = data?.items.filter((c) => !c.published).length || 0;

  return (
    <div className="mx-auto max-w-[1440px] animate-fade-in px-[var(--space-6)] py-[32px] lg:px-[var(--space-8)]">
      {/* Header */}
      <div className="mb-[32px] flex flex-col gap-[var(--space-6)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-[var(--space-3)] text-[var(--font-size-xl)] font-bold text-[var(--color-text-primary)]">
            Instructor Dashboard
          </h1>
          <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
            Manage your courses{user?.email ? `, ${user.email}` : ""}.
          </p>
        </div>
        <Link
          href="/dashboard/instructor/courses/new"
          className="inline-flex items-center gap-[var(--space-3)] rounded-[var(--radius-xs)] bg-[var(--color-brand-primary)] px-[var(--space-6)] py-[var(--space-4)] text-[var(--font-size-xs)] font-semibold text-white no-underline transition-colors hover:bg-[var(--color-brand-hover)]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Create Course
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-[32px] grid grid-cols-1 gap-[var(--space-6)] sm:grid-cols-3">
        <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-[var(--space-6)]">
          <p className="text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">Total Courses</p>
          <p className="text-[var(--font-size-xl)] font-bold text-[var(--color-text-primary)]">
            {loading ? "–" : data?.totalElements || 0}
          </p>
        </div>
        <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-[var(--space-6)]">
          <p className="text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">Published</p>
          <p className="text-[var(--font-size-xl)] font-bold text-[var(--color-success)]">
            {loading ? "–" : published}
          </p>
        </div>
        <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-[var(--space-6)]">
          <p className="text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">Drafts</p>
          <p className="text-[var(--font-size-xl)] font-bold text-[var(--color-warning)]">
            {loading ? "–" : drafts}
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-[var(--space-3)]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[72px] animate-pulse rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-gray-100" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && (!data || data.items.length === 0) && (
        <div className="flex flex-col items-center rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-[64px] text-center">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="mb-[var(--space-6)] text-gray-300" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" />
            <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <h2 className="mb-[var(--space-3)] text-[var(--font-size-md)] font-semibold text-[var(--color-text-primary)]">
            No courses yet
          </h2>
          <p className="mb-[var(--space-6)] text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">
            Create your first course to get started.
          </p>
          <Link
            href="/dashboard/instructor/courses/new"
            className="rounded-[var(--radius-xs)] bg-[var(--color-brand-primary)] px-[var(--space-8)] py-[var(--space-4)] text-[var(--font-size-sm)] font-semibold text-white no-underline transition-colors hover:bg-[var(--color-brand-hover)]"
          >
            Create Course
          </Link>
        </div>
      )}

      {/* Course Table */}
      {!loading && data && data.items.length > 0 && (
        <div className="overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-raised)]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                  <th className="px-[var(--space-6)] py-[var(--space-5)] text-[var(--font-size-xs)] font-semibold text-[var(--color-text-secondary)]">
                    Course
                  </th>
                  <th className="hidden px-[var(--space-6)] py-[var(--space-5)] text-[var(--font-size-xs)] font-semibold text-[var(--color-text-secondary)] sm:table-cell">
                    Status
                  </th>
                  <th className="hidden px-[var(--space-6)] py-[var(--space-5)] text-[var(--font-size-xs)] font-semibold text-[var(--color-text-secondary)] md:table-cell">
                    Created
                  </th>
                  <th className="px-[var(--space-6)] py-[var(--space-5)] text-right text-[var(--font-size-xs)] font-semibold text-[var(--color-text-secondary)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((course) => (
                  <tr
                    key={course.id}
                    className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface-muted)]"
                  >
                    <td className="px-[var(--space-6)] py-[var(--space-5)]">
                      <Link
                        href={`/courses/${course.id}`}
                        className="text-[var(--font-size-xs)] font-semibold text-[var(--color-text-primary)] no-underline hover:text-[var(--color-brand-primary)]"
                      >
                        {course.title}
                      </Link>
                      <p className="mt-[var(--space-1)] line-clamp-1 text-[12px] text-[var(--color-text-secondary)]">
                        {course.description}
                      </p>
                    </td>
                    <td className="hidden px-[var(--space-6)] py-[var(--space-5)] sm:table-cell">
                      {course.published ? (
                        <span className="rounded-[var(--radius-xl)] bg-green-50 px-[var(--space-3)] py-[var(--space-1)] text-[12px] font-semibold text-[var(--color-success)]">
                          Published
                        </span>
                      ) : (
                        <span className="rounded-[var(--radius-xl)] bg-amber-50 px-[var(--space-3)] py-[var(--space-1)] text-[12px] font-semibold text-amber-700">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="hidden px-[var(--space-6)] py-[var(--space-5)] text-[var(--font-size-xs)] text-[var(--color-text-secondary)] md:table-cell">
                      {new Date(course.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-[var(--space-6)] py-[var(--space-5)]">
                      <div className="flex items-center justify-end gap-[var(--space-3)]">
                        <Link
                          href={`/dashboard/instructor/courses/${course.id}/students`}
                          className="rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-transparent px-[var(--space-3)] py-[var(--space-2)] text-[12px] font-semibold text-[var(--color-text-secondary)] no-underline transition-colors hover:bg-[var(--color-surface-muted)]"
                          title="View students"
                        >
                          Students
                        </Link>
                        <Link
                          href={`/dashboard/instructor/courses/${course.id}/edit`}
                          className="rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-transparent px-[var(--space-3)] py-[var(--space-2)] text-[12px] font-semibold text-[var(--color-brand-primary)] no-underline transition-colors hover:bg-[var(--color-surface-muted)]"
                        >
                          Edit
                        </Link>
                        {!course.published && (
                          <button
                            onClick={() => handlePublish(course.id)}
                            disabled={actionLoading === course.id}
                            className="cursor-pointer rounded-[var(--radius-xs)] border-none bg-[var(--color-success)] px-[var(--space-3)] py-[var(--space-2)] text-[12px] font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60"
                          >
                            {actionLoading === course.id ? "..." : "Publish"}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(course.id)}
                          disabled={actionLoading === course.id}
                          className="cursor-pointer rounded-[var(--radius-xs)] border-none bg-[var(--color-error)] px-[var(--space-3)] py-[var(--space-2)] text-[12px] font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                        >
                          {actionLoading === course.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <div className="border-t border-[var(--color-border)] px-[var(--space-6)] py-[var(--space-5)]">
              <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
