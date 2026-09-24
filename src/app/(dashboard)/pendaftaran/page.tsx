'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PendaftaranRoot() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/pendaftaran/rawat-jalan');
  }, [router]);
  return null;
}
