'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KasirRoot() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/kasir/tagihan');
  }, [router]);
  return null;
}
