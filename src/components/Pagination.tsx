"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  for (let i = 0; i < totalPages; i++) {
    if (i === 0 || i === totalPages - 1 || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-[var(--space-2)]">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        aria-label="Previous page"
        className="flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-transparent text-[var(--font-size-xs)] text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {pages.map((p, idx) =>
        p === "..." ? (
          <span key={`ellipsis-${idx}`} className="px-[var(--space-2)] text-[var(--color-text-secondary)]">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-label={`Page ${p + 1}`}
            aria-current={p === page ? "page" : undefined}
            className={`flex h-[36px] min-w-[36px] cursor-pointer items-center justify-center rounded-[var(--radius-xs)] border text-[var(--font-size-xs)] font-semibold transition-colors ${
              p === page
                ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)] text-white"
                : "border-[var(--color-border)] bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)]"
            }`}
          >
            {p + 1}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        aria-label="Next page"
        className="flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-transparent text-[var(--font-size-xs)] text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </nav>
  );
}
