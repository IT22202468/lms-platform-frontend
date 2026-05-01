"use client";

import { startTransition, useEffect, useRef, useState } from "react";

import { fetchCourseThumbnailBlobUrl } from "@/lib/api";

export default function AuthenticatedCourseThumbnail({
  token,
  thumbnailRelativePath,
  alt,
  className,
  fallbackClassName,
}: {
  token: string | undefined;
  thumbnailRelativePath: string | null | undefined;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    urlRef.current = url;
  }, [url]);

  useEffect(() => {
    return () => {
      const u = urlRef.current;
      if (u) URL.revokeObjectURL(u);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!token || !thumbnailRelativePath) {
      startTransition(() => {
        setUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
      });
      return undefined;
    }

    fetchCourseThumbnailBlobUrl(token, thumbnailRelativePath).then((blobUrl) => {
      if (!blobUrl) {
        return;
      }
      if (cancelled) {
        URL.revokeObjectURL(blobUrl);
        return;
      }
      startTransition(() => {
        setUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return blobUrl;
        });
      });
    });

    return () => {
      cancelled = true;
    };
  }, [token, thumbnailRelativePath]);

  if (!url)
    return (
      <div
        className={
          fallbackClassName ||
          "flex h-full w-full items-center justify-center bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]"
        }
      >
        <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">Cover</span>
      </div>
    );

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} className={className} />;
}
