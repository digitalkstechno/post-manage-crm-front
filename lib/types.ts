export type Role = 'admin' | 'staff' | null;

export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'rework';

export interface Company {
  id: string;
  name: string;
}

export interface Submission {
  id: string;
  staffName: string;
  staffEmail: string;
  title: string;
  description: string;
  link: string;
  company?: string;
  companyName?: string;
  uploadAt?: string;
  status: SubmissionStatus;
  createdAt: string;
  adminComment?: string;
  postedToSocial?: boolean;
  socialPostedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  joinedAt: string;
}
