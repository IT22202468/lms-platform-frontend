"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { listCourses, type CourseResponse, type PageResponse } from "@/lib/api";
import CourseCard from "@/components/CourseCard";
import Pagination from "@/components/Pagination";

export default function CoursesPage() {
  const { token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<PageResponse<CourseResponse> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCourses = useCallback(async () => {
    if (!token) return;
    Promise.resolve().then(() => setLoading(true));
    try {
      const res = await listCourses(token, page, 12);
      setData(res);
    } catch {
      // If unauthorized, redirect to login
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
    Promise.resolve().then(() => fetchCourses());
  }, [authLoading, token, fetchCourses, router]);

  const filteredCourses =
    data?.items.filter(
      (c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
    ) || [];

  return (
    <div className="mx-auto max-w-[1440px] animate-fade-in px-[var(--space-6)] py-[32px] lg:px-[var(--space-8)]">
      {/* Page Header */}
      <div className="mb-[32px]">
        <h1 className="mb-[var(--space-3)] text-[var(--font-size-xl)] font-bold text-[var(--color-text-primary)]">
          Browse Courses
        </h1>
        <p className="mb-[var(--space-8)] text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
          Explore our catalog of courses taught by expert instructors.
        </p>

        {/* Search */}
        <div className="relative max-w-[480px]">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="absolute left-[var(--space-5)] top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder="Search courses..."
            aria-label="Search courses"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-[var(--space-4)] pl-[40px] pr-[var(--space-5)] text-[var(--font-size-xs)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-border-focus)] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-primary)]"
          />
        </div>
      </div>

      {/* Loading State */}
      {(loading || authLoading) && (
        <div className="grid grid-cols-1 gap-[var(--space-8)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-[var(--radius-sm)] border border-[var(--color-border)]"
            >
              <div className="h-[140px] bg-gray-200" />
              <div className="p-[var(--space-6)]">
                <div className="mb-[var(--space-3)] h-[20px] w-3/4 rounded bg-gray-200" />
                <div className="mb-[var(--space-5)] h-[14px] w-full rounded bg-gray-100" />
                <div className="h-[14px] w-1/2 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCourses.length === 0 && (
        <div className="flex flex-col items-center py-[64px] text-center">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="mb-[var(--space-6)] text-gray-300" aria-hidden="true">
            <path d="M12 14l9-5-9-5-9 5 9 5z" fill="currentColor" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" fill="currentColor" opacity="0.5" />
          </svg>
          <h2 className="mb-[var(--space-3)] text-[var(--font-size-md)] font-semibold text-[var(--color-text-primary)]">
            {search ? "No courses match your search" : "No courses available yet"}
          </h2>
          <p className="text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">
            {search
              ? "Try adjusting your search terms."
              : "Check back soon — new courses are being added regularly."}
          </p>
        </div>
      )}

      {/* Course Grid */}
      {!loading && filteredCourses.length > 0 && (
        <>
          <div className="mb-[var(--space-6)] text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">
            Showing {filteredCourses.length} of {data?.totalElements || 0} courses
          </div>
          <div className="grid grid-cols-1 gap-[var(--space-8)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} token={token ?? undefined} />
            ))}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="mt-[40px]">
              <Pagination
                page={page}
                totalPages={data.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
