"use client";

import Link from "next/link";
import Image from "next/image";
import type { CourseResponse } from "@/lib/api";

interface CourseCardProps {
  course: CourseResponse;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Link
      href={`/courses/${course.id}`}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] no-underline shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-primary)]"
    >
      {/* Thumbnail */}
      <div className="relative h-[160px] overflow-hidden bg-[var(--color-surface-muted)]">
        {/* <Image
          src={course.thumbnailUrl || "/default-course-thumbnail.webp"}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        /> */}
        <div className="absolute inset-0 bg-black/5 transition-opacity duration-300 group-hover:opacity-0" />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 rounded bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-primary)] backdrop-blur-sm">
          {/* {course.category} */}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-[var(--space-6)]">
        <h3 className="mb-[var(--space-2)] line-clamp-2 text-[var(--font-size-sm)] font-bold leading-snug text-[var(--color-text-primary)] transition-colors duration-300 group-hover:text-[var(--color-brand-primary)]">
          {course.title}
        </h3>

        <p className="mb-[var(--space-5)] line-clamp-2 flex-1 text-[var(--font-size-xs)] leading-relaxed text-[var(--color-text-secondary)]">
          {course.description}
        </p>

        <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-[var(--space-4)]">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-gray-200" />
            <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">
              {/* {course.instructor} */}
            </span>
          </div>

          {course.published ? (
            <span className="rounded-full bg-[var(--color-brand-tertiary)] px-[var(--space-3)] py-[var(--space-1)] text-[10px] font-bold text-[var(--color-brand-primary)]">
              {/* {course.publishedDate ? new Date(course.publishedDate).toLocaleDateString() : "PUBLISHED"} */}
            </span>
          ) : (
            <span className="rounded-full bg-amber-50 px-[var(--space-3)] py-[var(--space-1)] text-[10px] font-bold text-amber-700">
              DRAFT
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
