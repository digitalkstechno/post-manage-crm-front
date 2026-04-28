'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import DashboardLayoutWrapper from '@/components/dashboard/DashboardLayoutWrapper';

export default function Home() {
  const { role, authReady } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!authReady) return;
    if (role === "admin") router.replace('/submissions');
    else if (role === "staff") router.replace('/submissions');
  }, [role, authReady]);

  if (!authReady || role) return <div className="min-h-screen bg-[#F8FAFC]" />;

  return (
    <DashboardLayoutWrapper>
      <div />
    </DashboardLayoutWrapper>
  );
}