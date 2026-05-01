'use client';

import React from 'react';
import DashboardLayoutWrapper from '@/components/dashboard/DashboardLayoutWrapper';
import CompanyContent from '@/components/dashboard/CompanyContent';
import { useApp } from '@/lib/context';

export default function CompaniesPage() {
  const { searchQuery, fetchCompanies } = useApp();

  React.useEffect(() => {
    fetchCompanies(1, 10);
  }, [fetchCompanies]);

  return (
    <DashboardLayoutWrapper>
      <CompanyContent searchQuery={searchQuery} />
    </DashboardLayoutWrapper>
  );
}
