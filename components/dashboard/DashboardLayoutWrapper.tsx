'use client';

import React from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import TopNav from '@/components/dashboard/TopNav';
import { useApp } from '@/lib/context';
import LoginView from '@/components/dashboard/LoginView';
import { motion, AnimatePresence } from 'motion/react';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { role, user, logout, login } = useApp();
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === '/') return 'Administrative Overview';
    if (pathname === '/submissions') return 'Documentation Queue';
    if (pathname === '/upload') return 'Create Submission';
    if (pathname === '/directory') return 'Staff Directory';
    if (pathname === '/settings') return 'System Settings';
    return 'StaffCore Portal';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AnimatePresence mode="wait">
        {!role ? (
          <motion.div 
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoginView onLogin={login} />
          </motion.div>
        ) : (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex min-h-screen"
          >
            <Sidebar 
              currentRole={role} 
              onLogout={logout}
            />
            
            <div className="flex-1 flex flex-col min-w-0">
              <TopNav user={user} title={getPageTitle()} />
              <div className="flex-1 overflow-y-auto">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
