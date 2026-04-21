"use client";

import { useState, type FormEvent } from "react";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { createCourse, ApiError } from "@/lib/api";

export default function NewCoursePage() {
  const { token, isInstructor, isLoading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isLoading) {
    return null;
  }

  if (!isInstructor) {
    redirect("/");
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
      await createCourse(token!, { title, description });
      router.push("/dashboard/instructor");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.errors ? err.errors.join(", ") : err.message);
      } else {
        setError("Failed to create course. Please try again.");
      }
    } finally {
      setLoading(false);
    }
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
            New Course
          </li>
        </ol>
      </nav>

      <h1 className="mb-[var(--space-8)] text-[var(--font-size-lg)] font-bold text-[var(--color-text-primary)]">
        Create a new course
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
            placeholder="e.g., Introduction to Machine Learning"
            className="w-full rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-[var(--space-5)] py-[var(--space-4)] text-[var(--font-size-xs)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-border-focus)] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-primary)]"
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
            placeholder="Describe what students will learn in this course..."
            className="w-full resize-y rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-[var(--space-5)] py-[var(--space-4)] text-[var(--font-size-xs)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-border-focus)] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-primary)]"
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
            {loading ? "Creating..." : "Create Course"}
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
