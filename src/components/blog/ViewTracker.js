'use client';

import { useEffect } from 'react';

export default function ViewTracker({ slug }) {
  useEffect(() => {
    if (!slug) return;

    fetch(`/api/blogs/${slug}`, {
      method: 'GET',
    }).catch(() => {
      // Intentionally ignore tracking errors to avoid affecting UX.
    });
  }, [slug]);

  return null;
}

