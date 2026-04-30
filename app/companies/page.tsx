'use client';

import DashboardLayoutWrapper from '@/components/dashboard/DashboardLayoutWrapper';
import CompanyContent from '@/components/dashboard/CompanyContent';
import { useApp } from '@/lib/context';

export default function CompaniesPage() {
  const { searchQuery } = useApp();
  return (
    <DashboardLayoutWrapper>
      <CompanyContent searchQuery={searchQuery} />
    </DashboardLayoutWrapper>
  );
}
