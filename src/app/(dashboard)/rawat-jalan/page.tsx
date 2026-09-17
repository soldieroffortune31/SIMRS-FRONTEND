'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RawatJalanRoot() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/rawat-jalan/antrean');
  }, [router]);
  return null;
}
