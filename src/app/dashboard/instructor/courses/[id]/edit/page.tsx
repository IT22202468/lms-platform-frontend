"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
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
  const { token, isInstructor, isLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lectureContents, setLectureContents] = useState<LectureContentItem[]>([]);
  const [courseMeta, setCourseMeta] = useState<CourseResponse | null>(null);

  const [originalTitle, setOriginalTitle] = useState("");
  const [originalDescription, setOriginalDescription] = useState("");
  const [thumbnailRemoved, setThumbnailRemoved] = useState(false);
  const [newMaterialIds, setNewMaterialIds] = useState<Set<string>>(new Set());
  const [removedAny, setRemovedAny] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [thumbBusy, setThumbBusy] = useState(false);

  const [matTitle, setMatTitle] = useState("");
  const [matDesc, setMatDesc] = useState("");
  const [matFile, setMatFile] = useState<File | null>(null);
  const [matBusy, setMatBusy] = useState(false);
  const [matPanelOpen, setMatPanelOpen] = useState(false);
  const matFileInputRef = useRef<HTMLInputElement>(null);
  const materialsRef = useRef<HTMLDivElement>(null);

  const isDirty =
    title !== originalTitle ||
    description !== originalDescription ||
    thumbnailRemoved ||
    newMaterialIds.size > 0 ||
    removedAny;

  useEffect(() => {
    if (isLoading || !token || !isInstructor) return;
    (async () => {
      try {
        const course = await getCourse(token, id);
        setCourseMeta(course);
        setTitle(course.title);
        setDescription(course.description);
        setLectureContents(course.lectureContents ?? []);
        setOriginalTitle(course.title);
        setOriginalDescription(course.description);
      } catch {
        setError("Failed to load course.");
      } finally {
        setFetching(false);
      }
    })();
  }, [token, isInstructor, isLoading, id]);

  useEffect(() => {
    if (!isLoading && !isInstructor) router.replace("/");
  }, [isLoading, isInstructor, router]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  if (isLoading) return null;
  if (!isInstructor) return null;

  async function refreshCourse() {
    if (!token) return;
    const course = await getCourse(token, id);
    setCourseMeta(course);
    setLectureContents(course.lectureContents ?? []);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (title.length < 3) { setError("Title must be at least 3 characters."); return; }
    if (description.length < 3) { setError("Description must be at least 3 characters."); return; }
    setLoading(true);
    try {
      await updateCourse(token!, id, {
        title,
        description,
        thumbnailImageUrl: thumbnailRemoved ? null : (courseMeta?.thumbnailImageUrl ?? undefined),
        lectureContents: toPayloadItems(lectureContents),
      });
      setOriginalTitle(title);
      setOriginalDescription(description);
      setThumbnailRemoved(false);
      setNewMaterialIds(new Set());
      setRemovedAny(false);
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
      setThumbnailRemoved(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Thumbnail upload failed.");
    } finally {
      setThumbBusy(false);
    }
  }

  function handleRemoveThumbnail() {
    setThumbnailRemoved(true);
    setCourseMeta((prev) => (prev ? { ...prev, thumbnailImageUrl: null } : prev));
  }

  async function handleMaterialUpload() {
    if (!token || !matFile) { setError("Choose a file to upload."); return; }
    if (matTitle.trim().length < 2) { setError("Material title is required (min 2 chars)."); return; }
    if (matDesc.trim().length < 1) { setError("Material description is required."); return; }
    setMatBusy(true);
    setError("");
    try {
      const prevIds = new Set(lectureContents.map((m) => m.materialId));
      const updated = await uploadCourseMaterial(token, id, matFile, matTitle.trim(), matDesc.trim());
      const newContents = updated.lectureContents ?? [];
      const addedId = newContents.find((m) => m.materialId && !prevIds.has(m.materialId))?.materialId;
      if (addedId) setNewMaterialIds((prev) => new Set([...prev, addedId]));
      setCourseMeta(updated);
      setLectureContents(newContents);
      setMatTitle("");
      setMatDesc("");
      setMatFile(null);
      if (matFileInputRef.current) matFileInputRef.current.value = "";
      setMatPanelOpen(false);
      setTimeout(() => {
        materialsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Material upload failed.");
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
    setRemovedAny(true);
    setLectureContents((prev) => prev.filter((_, i) => i !== index));
  }

  function handleCancel() {
    if (isDirty) {
      const ok = window.confirm("You have unsaved changes. Are you sure you want to leave?");
      if (!ok) return;
    }
    router.push("/dashboard/instructor");
  }

  const hasThumbnail = !!courseMeta?.thumbnailImageUrl && !thumbnailRemoved;

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
    <>
      <div className="mx-auto max-w-[640px] px-[var(--space-6)] py-[32px]">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-[var(--space-8)]">
          <ol className="flex list-none gap-[var(--space-3)] p-0 text-[var(--font-size-xs)]">
            <li>
              <button
                type="button"
                onClick={handleCancel}
                className="cursor-pointer border-none bg-transparent p-0 text-[var(--color-brand-primary)] hover:underline"
              >
                Dashboard
              </button>
            </li>
            <li className="text-[var(--color-text-secondary)]" aria-hidden="true">/</li>
            <li className="text-[var(--color-text-secondary)]" aria-current="page">Edit Course</li>
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

        {/* Cover image */}
        <div className="mb-[var(--space-8)] rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-[var(--space-6)]">
          <h2 className="mb-[var(--space-4)] text-[var(--font-size-sm)] font-bold text-[var(--color-text-primary)]">
            Cover image
          </h2>
          <div className="flex items-start gap-[var(--space-5)]">
            <div className="relative h-[96px] w-[152px] shrink-0 overflow-hidden rounded-[var(--radius-xs)] bg-[var(--color-surface-muted)]">
              {hasThumbnail ? (
                <AuthenticatedCourseThumbnail
                  token={token ?? undefined}
                  thumbnailRelativePath={courseMeta?.thumbnailImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-30 text-[var(--color-text-secondary)]">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-[var(--space-3)]">
              <div className="flex flex-wrap items-center gap-[var(--space-3)]">
                <input
                  id="thumb-input"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  disabled={thumbBusy}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleThumbnailChange(f);
                    e.target.value = "";
                  }}
                  className="sr-only"
                />
                <label
                  htmlFor="thumb-input"
                  className={`inline-flex cursor-pointer items-center gap-[var(--space-2)] rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-[var(--space-4)] py-[var(--space-2)] text-[var(--font-size-xs)] font-semibold text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-raised)] ${thumbBusy ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  {thumbBusy ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-brand-primary)] border-t-transparent" />
                      <span>Uploading…</span>
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span>{hasThumbnail ? "Replace" : "Upload image"}</span>
                    </>
                  )}
                </label>
                {hasThumbnail && (
                  <button
                    type="button"
                    onClick={handleRemoveThumbnail}
                    className="cursor-pointer border-none bg-transparent p-0 text-[var(--font-size-xs)] font-semibold text-[var(--color-error)] underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[var(--color-text-secondary)]">JPG, PNG, GIF or WebP</p>
            </div>
          </div>
        </div>

        {/* Main form */}
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

          {/* Materials list */}
          <div className="mb-[var(--space-8)]" ref={materialsRef}>
            <h2 className="mb-[var(--space-4)] text-[var(--font-size-sm)] font-bold text-[var(--color-text-primary)]">
              Materials ({lectureContents.length})
            </h2>
            {lectureContents.length === 0 ? (
              <p className="text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">No materials yet. Use the button below to add one.</p>
            ) : (
              <ul className="m-0 flex list-none flex-col gap-[var(--space-5)] p-0">
                {lectureContents.map((m, idx) => {
                  const isNew = m.materialId ? newMaterialIds.has(m.materialId) : false;
                  return (
                    <li
                      key={m.materialId || `${idx}-${m.contentUrl}`}
                      className={`rounded-[var(--radius-xs)] border bg-[var(--color-surface-raised)] p-[var(--space-5)] transition-colors ${isNew ? "border-[var(--color-brand-primary)]" : "border-[var(--color-border)]"}`}
                    >
                      <div className="mb-[var(--space-3)] flex items-start justify-between gap-[var(--space-4)]">
                        <div className="flex min-w-0 items-center gap-[var(--space-3)]">
                          <div>
                            <p className="font-semibold text-[var(--font-size-xs)] text-[var(--color-text-primary)]">{m.title}</p>
                            <p className="mt-[var(--space-1)] text-[11px] text-[var(--color-text-secondary)]">
                              {m.contentType}
                              {m.uploadedAt ? ` · ${new Date(m.uploadedAt).toLocaleDateString()}` : ""}
                            </p>
                          </div>
                          {isNew && (
                            <span className="inline-flex shrink-0 items-center rounded-full bg-[var(--color-brand-primary)] px-[var(--space-2)] py-[2px] text-[10px] font-bold text-white">
                              New
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLocalMaterial(idx)}
                          className="shrink-0 cursor-pointer border-none bg-transparent p-0 text-[11px] font-semibold text-[var(--color-error)] underline"
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
                  );
                })}
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
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex cursor-pointer items-center rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-transparent px-[var(--space-8)] py-[var(--space-4)] text-[var(--font-size-sm)] font-semibold text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-muted)]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Floating "Add material" FAB */}
      <div className="fixed bottom-[var(--space-8)] right-[var(--space-8)] z-40 flex flex-col items-end gap-[var(--space-3)]">
        {!matPanelOpen && (
          <button
            type="button"
            onClick={() => { setError(""); setMatPanelOpen(true); }}
            title="Add material"
            className="flex cursor-pointer items-center gap-[var(--space-3)] rounded-full border-none bg-[var(--color-brand-primary)] px-[var(--space-5)] py-[var(--space-3)] text-[var(--font-size-xs)] font-semibold text-white shadow-lg transition-all hover:bg-[var(--color-brand-hover)] hover:shadow-xl"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add material</span>
          </button>
        )}
      </div>

      {/* Material upload panel (slide-in from right) */}
      {matPanelOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setMatPanelOpen(false)}
            aria-hidden="true"
          />
          {/* Panel */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Add material"
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-[360px] flex-col bg-[var(--color-surface-raised)] shadow-2xl"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-[var(--space-6)] py-[var(--space-5)]">
              <h2 className="text-[var(--font-size-sm)] font-bold text-[var(--color-text-primary)]">Add material</h2>
              <button
                type="button"
                onClick={() => setMatPanelOpen(false)}
                aria-label="Close panel"
                className="flex cursor-pointer items-center justify-center rounded-[var(--radius-xs)] border-none bg-transparent p-[var(--space-2)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-muted)]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Panel body */}
            <div className="flex flex-1 flex-col gap-[var(--space-5)] overflow-y-auto px-[var(--space-6)] py-[var(--space-6)]">
              {error && (
                <div role="alert" className="rounded-[var(--radius-xs)] border border-red-200 bg-red-50 px-[var(--space-4)] py-[var(--space-3)] text-[var(--font-size-xs)] text-[var(--color-error)]">
                  {error}
                </div>
              )}
              <div>
                <label className="mb-[var(--space-2)] block text-[var(--font-size-xs)] font-semibold text-[var(--color-text-primary)]">
                  File
                </label>
                <input
                  ref={matFileInputRef}
                  type="file"
                  onChange={(e) => setMatFile(e.target.files?.[0] ?? null)}
                  className="w-full text-[var(--font-size-xs)] text-[var(--color-text-primary)]"
                />
                <p className="mt-[var(--space-2)] text-[11px] text-[var(--color-text-secondary)]">PDF, Word, images, or plain text</p>
              </div>
              <div>
                <label className="mb-[var(--space-2)] block text-[var(--font-size-xs)] font-semibold text-[var(--color-text-primary)]">
                  Title
                </label>
                <input
                  type="text"
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  maxLength={200}
                  placeholder="e.g. Week 1 Reading"
                  className="w-full rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-[var(--space-4)] py-[var(--space-3)] text-[var(--font-size-xs)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-[var(--space-2)] block text-[var(--font-size-xs)] font-semibold text-[var(--color-text-primary)]">
                  Description
                </label>
                <textarea
                  value={matDesc}
                  onChange={(e) => setMatDesc(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder="What will students find in this file?"
                  className="w-full resize-y rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-[var(--space-4)] py-[var(--space-3)] text-[var(--font-size-xs)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] focus:outline-none"
                />
              </div>
            </div>

            {/* Panel footer */}
            <div className="border-t border-[var(--color-border)] px-[var(--space-6)] py-[var(--space-5)]">
              <button
                type="button"
                onClick={() => void handleMaterialUpload()}
                disabled={matBusy}
                className="flex w-full cursor-pointer items-center justify-center gap-[var(--space-3)] rounded-[var(--radius-xs)] bg-[var(--color-brand-primary)] py-[var(--space-4)] text-[var(--font-size-xs)] font-semibold text-white transition-colors hover:bg-[var(--color-brand-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {matBusy ? (
                  <>
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Uploading…</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>Upload material</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
