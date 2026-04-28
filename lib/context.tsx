'use client';

import React, { createContext, useEffect ,useContext, useState, ReactNode } from 'react';
import { Role, User, Submission, SubmissionStatus } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface AppContextType {
  role: Role;
  user: User | null;
  submissions: Submission[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  login: (role: Role) => void;
  logout: () => void;
  addSubmission: (data: Omit<Submission, 'id' | 'status' | 'createdAt' | 'staffName' | 'staffEmail'>) => void;
  updateStatus: (id: string, status: SubmissionStatus, comment?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [user, setUser] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>(INITIAL_SUBMISSIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

 useEffect(() => {
  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Submissions fetch
    const res = await fetch('http://localhost:5001/api/submissions', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) {
      const mapped = data.data.map((s: any) => ({
        id: s._id,
        title: s.title,
        description: s.description,
        category: s.category,
        link: s.fileLink,
        status: s.status.toLowerCase(), 
        createdAt: s.createdAt,
        staffName: s.submittedBy?.fullName || 'Unknown',
        staffEmail: s.submittedBy?.email || '',
      }));
      setSubmissions(mapped);
    }
  };
  fetchData();
}, []);


  const login = (selectedRole: Role) => {
    setRole(selectedRole);
    if (selectedRole === 'admin') {
      setUser({
        id: 'admin-1',
        name: 'Alexander Thompson',
        email: 'alex.t@staffcore.pro',
        role: 'admin'
      });
    } else {
      setUser({
        id: 'staff-1',
        name: 'John Staff',
        email: 'john.s@staffcore.pro',
        role: 'staff'
      });
    }
    router.push('/submissions');
  };

  const logout = () => {
    setRole(null);
    setUser(null);
    router.push('/');
  };

 const addSubmission = async (data: any) => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5001/api/submissions/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      const s = result.data;
      const mapped = {
        id: s._id,
        title: s.title,
        description: s.description,
        category: s.category,
        link: s.fileLink,
        status: s.status.toLowerCase(), 
        createdAt: s.createdAt,
        staffName: s.submittedBy?.fullName || 'Unknown',
        staffEmail: s.submittedBy?.email || '',
      };
      setSubmissions([mapped, ...submissions]);
    }
  } catch (err) {
    console.error(err);
  }
  router.push('/submissions');
};
  const updateStatus = (id: string, status: SubmissionStatus, comment?: string) => {
    setSubmissions(submissions.map(s => 
      s.id === id ? { ...s, status, adminComment: comment } : s
    ));
  };

  return (
    <AppContext.Provider value={{ 
      role, user, submissions, login, logout, 
      addSubmission, updateStatus,
      searchQuery, setSearchQuery
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}