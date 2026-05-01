'use client';

import React from 'react';
import DashboardLayoutWrapper from '@/components/dashboard/DashboardLayoutWrapper';
import DirectoryContent from '@/components/dashboard/DirectoryContent';
import { useApp } from '@/lib/context';

export default function DirectoryPage() {
  const { fetchStaff } = useApp();

  React.useEffect(() => {
    fetchStaff(1, 10);
  }, [fetchStaff]);

  return (
    <DashboardLayoutWrapper>
      <DirectoryContent />
    </DashboardLayoutWrapper>
  );
}