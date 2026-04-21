"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  getCourse,
  listCourseStudents,
  type CourseResponse,
  type CourseStudentResponse,
  type PageResponse,
} from "@/lib/api";
import Pagination from "@/components/Pagination";

export default function CourseStudentsPage() {
  const { id } = useParams<{ id: string }>();
  const { token, isInstructor } = useAuth();
  const router = useRouter();
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [data, setData] = useState<PageResponse<CourseStudentResponse> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!token) return;
    Promise.resolve().then(() => setLoading(true));
    try {
      const [courseData, studentsData] = await Promise.all([
        getCourse(token, id),
        listCourseStudents(token, id, page, 10),
      ]);
      setCourse(courseData);
      setData(studentsData);
    } catch {
      router.push("/dashboard/instructor");
    } finally {
      setLoading(false);
    }
  }, [token, id, page, router]);

  useEffect(() => {
    if (!token || !isInstructor) {
      router.push("/");
      return;
    }
    Promise.resolve().then(() => fetchData());
  }, [token, isInstructor, fetchData, router]);

  return (
    <div className="mx-auto max-w-[900px] animate-fade-in px-[var(--space-6)] py-[32px]">
      <nav aria-label="Breadcrumb" className="mb-[var(--space-8)]">
        <ol className="flex list-none gap-[var(--space-3)] p-0 text-[var(--font-size-xs)]">
          <li>
            <Link
              href="/dashboard/instructor"
              className="text-[var(--color-brand-primary)] no-underline hover:underline"
            >
              Dashboard
            </Link>
          </li>
          <li className="text-[var(--color-text-secondary)]" aria-hidden="true">/</li>
          <li className="text-[var(--color-text-secondary)]" aria-current="page">
            Students
          </li>
        </ol>
      </nav>

      <h1 className="mb-[var(--space-3)] text-[var(--font-size-lg)] font-bold text-[var(--color-text-primary)]">
        Enrolled Students
      </h1>
      {course && (
        <p className="mb-[var(--space-8)] text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
          {course.title} — {data?.totalElements || 0} student{(data?.totalElements || 0) !== 1 ? "s" : ""}
        </p>
      )}

      {loading && (
        <div className="space-y-[var(--space-3)]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[52px] animate-pulse rounded-[var(--radius-xs)] bg-gray-100" />
          ))}
        </div>
      )}

      {!loading && (!data || data.items.length === 0) && (
        <div className="flex flex-col items-center rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-[48px] text-center">
          <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
            No students enrolled yet.
          </p>
        </div>
      )}

      {!loading && data && data.items.length > 0 && (
        <div className="overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-raised)]">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
                <th className="px-[var(--space-6)] py-[var(--space-5)] text-[var(--font-size-xs)] font-semibold text-[var(--color-text-secondary)]">
                  #
                </th>
                <th className="px-[var(--space-6)] py-[var(--space-5)] text-[var(--font-size-xs)] font-semibold text-[var(--color-text-secondary)]">
                  Student ID
                </th>
                <th className="px-[var(--space-6)] py-[var(--space-5)] text-[var(--font-size-xs)] font-semibold text-[var(--color-text-secondary)]">
                  Enrolled At
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((student, idx) => (
                <tr
                  key={student.studentId}
                  className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface-muted)]"
                >
                  <td className="px-[var(--space-6)] py-[var(--space-5)] text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">
                    {page * 10 + idx + 1}
                  </td>
                  <td className="px-[var(--space-6)] py-[var(--space-5)] text-[var(--font-size-xs)] font-medium text-[var(--color-text-primary)]">
                    {student.studentId}
                  </td>
                  <td className="px-[var(--space-6)] py-[var(--space-5)] text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">
                    {new Date(student.enrolledAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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
