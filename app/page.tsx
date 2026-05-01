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
    if (role === "admin" || role === "hr") router.replace('/admin');
    else if (role === "staff") router.replace('/posts');
  }, [role, authReady, router]);

  if (!authReady || role) return <div className="min-h-screen bg-[#F8FAFC]" />;

  return (
    <DashboardLayoutWrapper>
      <div />
    </DashboardLayoutWrapper>
  );
}