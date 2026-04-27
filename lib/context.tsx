'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Role, User, Submission, SubmissionStatus } from '@/lib/types';
import { INITIAL_SUBMISSIONS } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';

interface AppContextType {
  role: Role;
  user: User | null;
  submissions: Submission[];
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
  const router = useRouter();

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
  };

  const logout = () => {
    setRole(null);
    setUser(null);
    router.push('/');
  };

  const addSubmission = (data: Omit<Submission, 'id' | 'status' | 'createdAt' | 'staffName' | 'staffEmail'>) => {
    const newSubmission: Submission = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      createdAt: new Date().toISOString(),
      staffName: user?.name || 'Anonymous',
      staffEmail: user?.email || 'anon@staffcore.pro'
    };
    setSubmissions([newSubmission, ...submissions]);
    router.push('/submissions');
  };

  const updateStatus = (id: string, status: SubmissionStatus, comment?: string) => {
    setSubmissions(submissions.map(s => 
      s.id === id ? { ...s, status, adminComment: comment } : s
    ));
  };

  return (
    <AppContext.Provider value={{ 
      role, user, submissions, login, logout, addSubmission, updateStatus 
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
