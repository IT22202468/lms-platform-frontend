"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import AuthenticatedCourseThumbnail from "@/components/authenticated-course-thumbnail";
import {
  getCourse,
  updateCourse,
  uploadCourseThumbnail,
  uploadCourseMaterial,
  ApiError,
  type CourseResponse,
  type LectureContentItem,
} from "@/lib/api";

function toPayloadItems(items: LectureContentItem[]) {
  return items.map((lc) => ({
    materialId: lc.materialId ?? undefined,
    title: lc.title,
    description: lc.description?.trim() || "Material",
    contentType: lc.contentType,
    contentUrl: lc.contentUrl,
    durationSeconds: lc.durationSeconds ?? undefined,
  }));
}

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const { token, isInstructor } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lectureContents, setLectureContents] = useState<LectureContentItem[]>([]);
  const [courseMeta, setCourseMeta] = useState<CourseResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [thumbBusy, setThumbBusy] = useState(false);
  const [matTitle, setMatTitle] = useState("");
  const [matDesc, setMatDesc] = useState("");
  const [matFile, setMatFile] = useState<File | null>(null);
  const [matBusy, setMatBusy] = useState(false);

  useEffect(() => {
    if (!token || !isInstructor) return;

    (async () => {
      try {
        const course = await getCourse(token, id);
        setCourseMeta(course);
        setTitle(course.title);
        setDescription(course.description);
        setLectureContents(course.lectureContents ?? []);
      } catch {
        setError("Failed to load course.");
      } finally {
        setFetching(false);
      }
    })();
  }, [token, isInstructor, id]);

  if (!isInstructor) {
    router.push("/");
    return null;
  }

  async function refreshCourse() {
    if (!token) return;
    const course = await getCourse(token, id);
    setCourseMeta(course);
    setLectureContents(course.lectureContents ?? []);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (title.length < 3) {
      setError("Title must be at least 3 characters.");
      return;
    }
    if (description.length < 3) {
      setError("Description must be at least 3 characters.");
      return;
    }

    setLoading(true);
    try {
      await updateCourse(token!, id, {
        title,
        description,
        thumbnailImageUrl: courseMeta?.thumbnailImageUrl ?? undefined,
        lectureContents: toPayloadItems(lectureContents),
      });
      router.push("/dashboard/instructor");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.errors ? err.errors.join(", ") : err.message);
      } else {
        setError("Failed to update course. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleThumbnailChange(file: File | null) {
    if (!file || !token) return;
    setThumbBusy(true);
    setError("");
    try {
      const updated = await uploadCourseThumbnail(token, id, file);
      setCourseMeta(updated);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Thumbnail upload failed.");
      }
    } finally {
      setThumbBusy(false);
    }
  }

  async function handleMaterialUpload() {
    if (!token || !matFile) {
      setError("Choose a file to upload.");
      return;
    }
    if (matTitle.trim().length < 2) {
      setError("Material title is required.");
      return;
    }
    if (matDesc.trim().length < 1) {
      setError("Material description is required.");
      return;
    }
    setMatBusy(true);
    setError("");
    try {
      await uploadCourseMaterial(token, id, matFile, matTitle.trim(), matDesc.trim());
      setMatTitle("");
      setMatDesc("");
      setMatFile(null);
      await refreshCourse();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Material upload failed.");
      }
    } finally {
      setMatBusy(false);
    }
  }

  function updateLocalDescription(index: number, text: string) {
    setLectureContents((prev) => {
      const next = [...prev];
      if (next[index]) next[index] = { ...next[index], description: text };
      return next;
    });
  }

  function removeLocalMaterial(index: number) {
    setLectureContents((prev) => prev.filter((_, i) => i !== index));
  }

  if (fetching) {
    return (
      <div className="mx-auto max-w-[640px] px-[var(--space-6)] py-[32px]">
        <div className="animate-pulse">
          <div className="mb-[var(--space-8)] h-[20px] w-1/3 rounded bg-gray-200" />
          <div className="mb-[var(--space-8)] h-[32px] w-2/3 rounded bg-gray-200" />
          <div className="mb-[var(--space-6)] h-[40px] rounded bg-gray-100" />
          <div className="mb-[var(--space-8)] h-[120px] rounded bg-gray-100" />
          <div className="h-[44px] w-[160px] rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[640px] px-[var(--space-6)] py-[32px]">
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
          <li className="text-[var(--color-text-secondary)]" aria-hidden="true">
            /
          </li>
          <li className="text-[var(--color-text-secondary)]" aria-current="page">
            Edit Course
          </li>
        </ol>
      </nav>

      <h1 className="mb-[var(--space-8)] text-[var(--font-size-lg)] font-bold text-[var(--color-text-primary)]">
        Edit course
      </h1>

      {error && (
        <div
          role="alert"
          className="mb-[var(--space-6)] rounded-[var(--radius-xs)] border border-red-200 bg-red-50 px-[var(--space-6)] py-[var(--space-3)] text-[var(--font-size-xs)] text-[var(--color-error)]"
        >
          {error}
        </div>
      )}

      <div className="mb-[var(--space-8)] rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-[var(--space-6)]">
        <h2 className="mb-[var(--space-4)] text-[var(--font-size-sm)] font-bold text-[var(--color-text-primary)]">
          Cover image
        </h2>
        <div className="relative mb-[var(--space-4)] h-[160px] w-full max-w-[280px] overflow-hidden rounded-[var(--radius-xs)] bg-[var(--color-surface-muted)]">
          <AuthenticatedCourseThumbnail
            token={token ?? undefined}
            thumbnailRelativePath={courseMeta?.thumbnailImageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <label className="block text-[var(--font-size-xs)] font-semibold text-[var(--color-text-primary)]">
          <span className="mb-[var(--space-2)] block">Upload thumbnail</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            disabled={thumbBusy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleThumbnailChange(f);
              e.target.value = "";
            }}
            className="text-[var(--font-size-xs)]"
          />
        </label>
        {thumbBusy ? <p className="mt-[var(--space-2)] text-[12px] text-[var(--color-text-secondary)]">Uploading…</p> : null}
      </div>

      <div className="mb-[var(--space-8)] rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-[var(--space-6)]">
        <h2 className="mb-[var(--space-5)] text-[var(--font-size-sm)] font-bold text-[var(--color-text-primary)]">
          Add material (file)
        </h2>
        <div className="flex flex-col gap-[var(--space-4)]">
          <div>
            <label className="mb-[var(--space-2)] block text-[var(--font-size-xs)] font-semibold">File</label>
            <input
              type="file"
              onChange={(e) => setMatFile(e.target.files?.[0] ?? null)}
              className="text-[var(--font-size-xs)]"
            />
          </div>
          <div>
            <label className="mb-[var(--space-2)] block text-[var(--font-size-xs)] font-semibold">Title</label>
            <input
              type="text"
              value={matTitle}
              onChange={(e) => setMatTitle(e.target.value)}
              className="w-full rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-[var(--space-5)] py-[var(--space-4)] text-[var(--font-size-xs)]"
              maxLength={200}
            />
          </div>
          <div>
            <label className="mb-[var(--space-2)] block text-[var(--font-size-xs)] font-semibold">Description</label>
            <textarea
              value={matDesc}
              onChange={(e) => setMatDesc(e.target.value)}
              rows={3}
              maxLength={1000}
              className="w-full resize-y rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-[var(--space-5)] py-[var(--space-4)] text-[var(--font-size-xs)]"
            />
          </div>
          <button
            type="button"
            onClick={() => void handleMaterialUpload()}
            disabled={matBusy}
            className="w-fit cursor-pointer rounded-[var(--radius-xs)] bg-[var(--color-text-primary)] px-[var(--space-6)] py-[var(--space-3)] text-[var(--font-size-xs)] font-semibold text-white disabled:opacity-60"
          >
            {matBusy ? "Uploading…" : "Upload material"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mb-[var(--space-10)]">
        <div className="mb-[var(--space-6)]">
          <label
            htmlFor="title"
            className="mb-[var(--space-2)] block text-[var(--font-size-xs)] font-semibold text-[var(--color-text-primary)]"
          >
            Course Title
          </label>
          <input
            id="title"
            type="text"
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-[var(--space-5)] py-[var(--space-4)] text-[var(--font-size-xs)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-primary)]"
          />
          <p className="mt-[var(--space-2)] text-[12px] text-[var(--color-text-secondary)]">{title.length}/120 characters</p>
        </div>

        <div className="mb-[var(--space-8)]">
          <label
            htmlFor="description"
            className="mb-[var(--space-2)] block text-[var(--font-size-xs)] font-semibold text-[var(--color-text-primary)]"
          >
            Description
          </label>
          <textarea
            id="description"
            required
            maxLength={2000}
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-y rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-[var(--space-5)] py-[var(--space-4)] text-[var(--font-size-xs)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-primary)]"
          />
          <p className="mt-[var(--space-2)] text-[12px] text-[var(--color-text-secondary)]">
            {description.length}/2000 characters
          </p>
        </div>

        <div className="mb-[var(--space-8)]">
          <h2 className="mb-[var(--space-4)] text-[var(--font-size-sm)] font-bold text-[var(--color-text-primary)]">
            Materials ({lectureContents.length})
          </h2>
          {lectureContents.length === 0 ? (
            <p className="text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">No materials yet.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-[var(--space-5)] p-0">
              {lectureContents.map((m, idx) => (
                <li
                  key={m.materialId || `${idx}-${m.contentUrl}`}
                  className="rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-[var(--space-5)]"
                >
                  <div className="mb-[var(--space-3)] flex items-start justify-between gap-[var(--space-4)]">
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--font-size-xs)] text-[var(--color-text-primary)]">{m.title}</p>
                      <p className="mt-[var(--space-1)] text-[11px] text-[var(--color-text-secondary)]">
                        {m.contentType}{" "}
                        {m.uploadedAt
                          ? ` · ${new Date(m.uploadedAt).toLocaleDateString()}`
                          : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLocalMaterial(idx)}
                      className="cursor-pointer shrink-0 text-[11px] font-semibold text-[var(--color-error)] underline"
                    >
                      Remove
                    </button>
                  </div>
                  <label className="mb-[var(--space-2)] block text-[11px] font-semibold text-[var(--color-text-secondary)]">
                    Student-facing description
                  </label>
                  <textarea
                    value={m.description}
                    onChange={(e) => updateLocalDescription(idx, e.target.value)}
                    rows={3}
                    maxLength={1000}
                    className="w-full resize-y rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-[var(--space-4)] py-[var(--space-3)] text-[var(--font-size-xs)]"
                  />
                </li>
              ))}
            </ul>
          )}
          <p className="mt-[var(--space-4)] text-[12px] text-[var(--color-text-secondary)]">
            Removing or editing descriptions updates the catalog when you save the course below.
          </p>
        </div>

        <div className="flex gap-[var(--space-5)]">
          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer rounded-[var(--radius-xs)] bg-[var(--color-brand-primary)] px-[var(--space-8)] py-[var(--space-4)] text-[var(--font-size-sm)] font-semibold text-white transition-colors hover:bg-[var(--color-brand-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <Link
            href="/dashboard/instructor"
            className="inline-flex items-center rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-transparent px-[var(--space-8)] py-[var(--space-4)] text-[var(--font-size-sm)] font-semibold text-[var(--color-text-primary)] no-underline transition-colors hover:bg-[var(--color-surface-muted)]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
