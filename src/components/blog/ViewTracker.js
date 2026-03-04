'use client';

import { useEffect } from 'react';

export default function ViewTracker({ slug }) {
  useEffect(() => {
    if (!slug) return;

    fetch(`/api/blogs/${slug}`, {
      method: 'GET',
      cache: 'no-store',
    }).catch(() => {
      // Intentionally ignore tracking errors to avoid affecting UX.
    });
  }, [slug]);

  return null;
}

