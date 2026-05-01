'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import DashboardLayoutWrapper from '@/components/dashboard/DashboardLayoutWrapper';
import AdminDashboard from '@/components/dashboard/AdminDashboard';

export default function AdminPage() {
  const { role } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (role === null) router.replace('/');
    if (role === "staff") router.replace('/posts');
  }, [role, router]);

  if (!role || role === "staff") return <div className="min-h-screen bg-[#F8FAFC]" />;

  return (
    <DashboardLayoutWrapper>
      <AdminDashboard />
    </DashboardLayoutWrapper>
  );
}