"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getCourse, updateCourse, ApiError } from "@/lib/api";

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const { token, isInstructor } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!token || !isInstructor) return;

    (async () => {
      try {
        const course = await getCourse(token, id);
        setTitle(course.title);
        setDescription(course.description);
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
      await updateCourse(token!, id, { title, description });
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
          <li className="text-[var(--color-text-secondary)]" aria-hidden="true">/</li>
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

      <form onSubmit={handleSubmit} noValidate>
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
          <p className="mt-[var(--space-2)] text-[12px] text-[var(--color-text-secondary)]">
            {title.length}/120 characters
          </p>
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
