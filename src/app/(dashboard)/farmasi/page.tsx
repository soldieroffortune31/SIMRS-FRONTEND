'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FarmasiRoot() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/farmasi/antrean-resep');
  }, [router]);
  return null;
}
