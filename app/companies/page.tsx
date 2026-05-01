'use client';

import React from 'react';
import DashboardLayoutWrapper from '@/components/dashboard/DashboardLayoutWrapper';
import CompanyContent from '@/components/dashboard/CompanyContent';

export default function CompaniesPage() {
  return (
    <DashboardLayoutWrapper>
      <CompanyContent />
    </DashboardLayoutWrapper>
  );
}
