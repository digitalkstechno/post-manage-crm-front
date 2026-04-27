'use client';

import React from 'react';
import DashboardContent from '@/components/dashboard/DashboardContent';
import DashboardLayoutWrapper from '@/components/dashboard/DashboardLayoutWrapper';
import { useApp } from '@/lib/context';

export default function Home() {
  const { role, submissions, addSubmission, updateStatus } = useApp();

  return (
    <DashboardLayoutWrapper>
      <DashboardContent 
        role={role}
        activeTab="overview"
        submissions={submissions}
        addSubmission={addSubmission}
        updateStatus={updateStatus}
      />
    </DashboardLayoutWrapper>
  );
}
