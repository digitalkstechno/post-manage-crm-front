'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import DashboardLayoutWrapper from '@/components/dashboard/DashboardLayoutWrapper';

export default function AdminPage() {
  const { role } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (role === null) router.replace('/');      
    if (role === "staff") router.replace('/submissions'); 
  }, [role]);

  if (!role || role === "staff") return <div className="min-h-screen bg-[#F8FAFC]" />;

  return (
    <DashboardLayoutWrapper>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 mt-2">Welcome, Admin! Manage your staff and submissions here.</p>
      </div>
    </DashboardLayoutWrapper>
  );
}