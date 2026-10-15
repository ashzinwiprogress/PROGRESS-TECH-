'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function VisitLogger() {
  const path = usePathname();
  useEffect(() => {
    fetch('/api/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: path })
    }).catch(() => {});
  }, [path]);
  return null;
}
