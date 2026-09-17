'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PengaturanRoot() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/pengaturan/users');
  }, [router]);
  return null;
}
