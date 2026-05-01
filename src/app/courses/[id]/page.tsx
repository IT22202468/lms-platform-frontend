"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import AuthenticatedCourseThumbnail from "@/components/authenticated-course-thumbnail";
import {
  getCourse,
  enrollInCourse,
  downloadCourseMaterial,
  ApiError,
  type CourseResponse,
  type LectureContentItem,
} from "@/lib/api";

type MaterialSort = "newest" | "oldest";

function materialTimeMs(m: LectureContentItem): number {
  if (!m.uploadedAt) return 0;
  const t = new Date(m.uploadedAt).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token, user, isLoading: authLoading, isStudent } = useAuth();
  const router = useRouter();

  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [materialSort, setMaterialSort] = useState<MaterialSort>("oldest");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

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

  const isOwner = !!(course && user?.id === course.instructorId);
  const canDownloadMaterials = !!(token && course && (isOwner || (course.published && enrolled)));

  const sortedMaterials = useMemo(() => {
    const list = [...(course?.lectureContents ?? [])];
    list.sort((a, b) => {
      const ta = materialTimeMs(a);
      const tb = materialTimeMs(b);
      return materialSort === "newest" ? tb - ta : ta - tb;
    });
    return list;
  }, [course?.lectureContents, materialSort]);

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

  async function handleDownload(m: LectureContentItem) {
    if (!token || !course || !m.materialId || !canDownloadMaterials) return;
    setDownloadingId(m.materialId);
    setError("");
    try {
      await downloadCourseMaterial(token, course.id, m.materialId, m.title.replace(/[^\w.-]+/g, "_"));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Download failed.");
      }
    } finally {
      setDownloadingId(null);
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

  const instructorLabel = course.instructorName?.trim() || course.instructorId;

  return (
    <div className="bg-[var(--color-surface-muted)]">
      <div className="bg-[var(--color-surface-strong)]">
        <div className="mx-auto flex max-w-[900px] flex-col gap-[var(--space-8)] px-[var(--space-6)] py-[40px] lg:flex-row lg:px-[var(--space-8)]">
          <div className="relative mx-auto w-full max-w-[280px] shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)] shadow-lg aspect-[4/3]">
            <AuthenticatedCourseThumbnail
              token={token ?? undefined}
              thumbnailRelativePath={course.thumbnailImageUrl}
              alt={course.title}
              className="h-full w-full object-cover"
              fallbackClassName="flex h-full w-full items-center justify-center bg-neutral-800 text-gray-400"
            />
          </div>

          <div className="min-w-0 flex-1">
            <nav aria-label="Breadcrumb" className="mb-[var(--space-6)]">
              <ol className="flex list-none gap-[var(--space-3)] p-0 text-[var(--font-size-xs)]">
                <li>
                  <Link href="/courses" className="text-gray-300 no-underline hover:text-white">
                    Courses
                  </Link>
                </li>
                <li className="text-gray-500" aria-hidden="true">
                  /
                </li>
                <li className="text-gray-400" aria-current="page">
                  {course.title}
                </li>
              </ol>
            </nav>

            <h1 className="mb-[var(--space-5)] text-[var(--font-size-xs)] text-gray-400">
              {course.title}
            </h1>

            <p className="mb-[var(--space-5)] text-[var(--font-size-xs)] text-gray-400">
              Instructor: <span className="text-gray-200">{instructorLabel}</span>
            </p>

            <p className="mb-[var(--space-6)] max-w-[640px] text-[var(--font-size-sm)] leading-relaxed text-gray-300">
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
              {course.modifiedAt ? (
                <span>
                  Last updated{" "}
                  {new Date(course.modifiedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              ) : null}
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
      </div>

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
                <path
                  d="M8 12l3 3 5-5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[var(--font-size-sm)] font-semibold text-[var(--color-success)]">Enrolled</span>
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

          <div className="mt-[var(--space-8)] border-t border-[var(--color-border)] pt-[var(--space-8)]">
            <h2 className="mb-[var(--space-6)] text-[var(--font-size-md)] font-bold text-[var(--color-text-primary)]">
              About this course
            </h2>
            <p className="whitespace-pre-wrap text-[var(--font-size-sm)] leading-relaxed text-[var(--color-text-secondary)]">
              {course.description}
            </p>
          </div>

          <div className="mt-[var(--space-8)] border-t border-[var(--color-border)] pt-[var(--space-8)]">
            <div className="mb-[var(--space-6)] flex flex-col gap-[var(--space-4)] sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-[var(--font-size-md)] font-bold text-[var(--color-text-primary)]">Course materials</h2>
              <label className="flex items-center gap-[var(--space-3)] text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">
                <span className="sr-only">Sort materials by date</span>
                <span aria-hidden="true">Order</span>
                <select
                  value={materialSort}
                  onChange={(e) => setMaterialSort(e.target.value as MaterialSort)}
                  className="rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-[var(--space-3)] py-[var(--space-2)] text-[var(--font-size-xs)] text-[var(--color-text-primary)]"
                >
                  <option value="oldest">Oldest first</option>
                  <option value="newest">Newest first</option>
                </select>
              </label>
            </div>

            {!canDownloadMaterials && course.published && isStudent && (
              <p className="mb-[var(--space-5)] text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">
                Enroll in this course to download files.
              </p>
            )}

            {sortedMaterials.length === 0 ? (
              <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">No materials yet.</p>
            ) : (
              <ul className="m-0 flex list-none flex-col gap-[var(--space-5)] p-0">
                {sortedMaterials.map((m) => (
                  <li
                    key={m.materialId || m.contentUrl}
                    className="rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-[var(--space-5)]"
                  >
                    <div className="mb-[var(--space-2)] flex flex-wrap items-baseline justify-between gap-[var(--space-3)]">
                      <h3 className="text-[var(--font-size-sm)] font-semibold text-[var(--color-text-primary)]">
                        {m.title}
                      </h3>
                      <span className="text-[11px] text-[var(--color-text-secondary)]">
                        {m.uploadedAt
                          ? new Date(m.uploadedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}{" "}
                        · <span className="uppercase">{m.contentType}</span>
                      </span>
                    </div>
                    <p className="mb-[var(--space-4)] text-[var(--font-size-xs)] leading-relaxed text-[var(--color-text-secondary)]">
                      {m.description}
                    </p>
                    <button
                      type="button"
                      disabled={!canDownloadMaterials || !m.materialId || downloadingId === m.materialId}
                      onClick={() => handleDownload(m)}
                      className="cursor-pointer rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-[var(--space-5)] py-[var(--space-3)] text-[var(--font-size-xs)] font-semibold text-[var(--color-brand-primary)] transition-colors hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {downloadingId === m.materialId ? "Downloading…" : "Download"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
