'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RawatInapRoot() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/rawat-inap/sensus');
  }, [router]);
  return null;
}
