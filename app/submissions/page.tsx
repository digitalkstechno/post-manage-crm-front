'use client';

import DashboardContent from '@/components/dashboard/DashboardContent';
import DashboardLayoutWrapper from '@/components/dashboard/DashboardLayoutWrapper';
import { useApp } from '@/lib/context';

export default function SubmissionsPage() {
  const { role, submissions, addSubmission, updateStatus, searchQuery, companies, postToSocial } = useApp();

  return (
    <DashboardLayoutWrapper>
      <DashboardContent 
        role={role}
        activeTab="submissions"
        submissions={submissions}
        searchQuery={searchQuery}
        companies={companies}
        addSubmission={addSubmission}
        updateStatus={updateStatus}
        postToSocial={postToSocial}
      />
    </DashboardLayoutWrapper>
  );
}