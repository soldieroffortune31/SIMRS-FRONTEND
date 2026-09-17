'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FarmasiResepRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/farmasi/antrean-resep');
  }, [router]);

  return null;
}
