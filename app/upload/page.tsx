'use client';

import DashboardContent from '@/components/dashboard/DashboardContent';
import DashboardLayoutWrapper from '@/components/dashboard/DashboardLayoutWrapper';
import { useApp } from '@/lib/context';

export default function UploadPage() {
  const { role, submissions, addSubmission, updateStatus, companies } = useApp();

  return (
    <DashboardLayoutWrapper>
      <DashboardContent 
        role={role}
        activeTab="upload"
        submissions={submissions}
        companies={companies}
        addSubmission={addSubmission}
        updateStatus={updateStatus}
      />
    </DashboardLayoutWrapper>
  );
}
