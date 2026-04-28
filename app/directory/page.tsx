'use client';

import DashboardLayoutWrapper from '@/components/dashboard/DashboardLayoutWrapper';
import DirectoryContent from '@/components/dashboard/DirectoryContent';
import { useApp } from '@/lib/context';

export default function DirectoryPage() {

   const { role, submissions, addSubmission, updateStatus, searchQuery } = useApp();
  return (
    <DashboardLayoutWrapper>
      <DirectoryContent searchQuery={searchQuery} />
    </DashboardLayoutWrapper>
  );
}