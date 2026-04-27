import { Submission } from './types';

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: '1',
    staffName: 'Sarah Miller',
    staffEmail: 'sarah.m@company.com',
    title: 'Q4 Financial Report v2',
    description: 'Updated figures for the final quarter including tax adjustments.',
    link: 'https://drive.google.com/share/financial-q4',
    category: 'Finance',
    status: 'approved',
    createdAt: '2023-10-24T10:00:00Z',
  },
  {
    id: '2',
    staffName: 'David Chen',
    staffEmail: 'david.c@company.com',
    title: 'Employee Onboarding Form 771',
    description: 'New hire documentation for the engineering team.',
    link: 'https://drive.google.com/share/onboarding-771',
    category: 'HR',
    status: 'pending',
    createdAt: '2023-10-24T14:30:00Z',
  },
  {
    id: '3',
    staffName: 'Elena Rodriguez',
    staffEmail: 'elena.r@company.com',
    title: 'Vendor Agreement Draft',
    description: 'Preliminary agreement with cleaning services.',
    link: 'https://drive.google.com/share/vendor-draft',
    category: 'Legal',
    status: 'rejected',
    createdAt: '2023-10-23T09:15:00Z',
    adminComment: 'Missing signature on page 4.',
  },
  {
    id: '4',
    staffName: 'James Wilson',
    staffEmail: 'james.w@company.com',
    title: 'StaffCore Asset Manifest',
    description: 'Inventory list of all office hardware.',
    link: 'https://drive.google.com/share/asset-manifest',
    category: 'Operations',
    status: 'approved',
    createdAt: '2023-10-23T16:45:00Z',
  }
];
