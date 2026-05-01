export type Role = 'admin' | 'hr' | 'staff' | null;

export type PostStatus = 'pending' | 'approved' | 'rejected' | 'rework';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  assignedCompanies?: string[];
}

export interface Post {
  id: string;
  title: string;
  description: string;
  link: string;
  companyId: string;
  companyName: string;
  uploadAt?: string;
  status: PostStatus;
  createdAt: string;
  staffName: string;
  staffEmail: string;
  adminComment?: string;
  postedToSocial?: boolean;
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Company {
  id: string;
  name: string;
  facebook?: string;
  instagram?: string;
  googleMyBusiness?: string;
  category?: 'Customer' | 'Own';
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'hr' | 'staff';
  joinedAt: string;
  assignedCompanies?: { id: string, name: string }[];
}
