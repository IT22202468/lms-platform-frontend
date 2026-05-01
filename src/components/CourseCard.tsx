"use client";

import Link from "next/link";

import AuthenticatedCourseThumbnail from "@/components/authenticated-course-thumbnail";
import type { CourseResponse } from "@/lib/api";

interface CourseCardProps {
  course: CourseResponse;
  token: string | undefined;
}

export default function CourseCard({ course, token }: CourseCardProps) {
  const updated = course.modifiedAt
    ? new Date(course.modifiedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;
  const instructorLabel = course.instructorName?.trim() || course.instructorId;

  return (
    <Link
      href={`/courses/${course.id}`}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] no-underline shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-primary)]"
    >
      <div className="relative h-[160px] overflow-hidden bg-[var(--color-surface-muted)]">
        <AuthenticatedCourseThumbnail
          token={token}
          thumbnailRelativePath={course.thumbnailImageUrl}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/5 transition-opacity duration-300 group-hover:opacity-0 pointer-events-none" />
      </div>

      <div className="flex flex-1 flex-col p-[var(--space-6)]">
        <h3 className="mb-[var(--space-2)] line-clamp-2 text-[var(--font-size-sm)] font-bold leading-snug text-[var(--color-text-primary)] transition-colors duration-300 group-hover:text-[var(--color-brand-primary)]">
          {course.title}
        </h3>

        <p className="mb-[var(--space-5)] line-clamp-2 flex-1 text-[var(--font-size-xs)] leading-relaxed text-[var(--color-text-secondary)]">
          {course.description}
        </p>

        <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-[var(--space-4)]">
          <div className="flex min-w-0 flex-1 flex-col gap-[var(--space-1)]">
            <span className="truncate text-[11px] font-medium text-[var(--color-text-secondary)]">
              {instructorLabel}
            </span>
            {updated ? (
              <span className="text-[10px] text-[var(--color-text-secondary)] opacity-80">Updated {updated}</span>
            ) : null}
          </div>

          {course.published ? (
            <span className="shrink-0 rounded-full bg-[var(--color-brand-tertiary)] px-[var(--space-3)] py-[var(--space-1)] text-[10px] font-bold text-[var(--color-brand-primary)]">
              LIVE
            </span>
          ) : (
            <span className="shrink-0 rounded-full bg-amber-50 px-[var(--space-3)] py-[var(--space-1)] text-[10px] font-bold text-amber-700">
              DRAFT
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
