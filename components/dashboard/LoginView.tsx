'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, Mail, ChevronRight, User as UserIcon } from 'lucide-react';
import { Role } from '@/lib/types';

interface LoginViewProps {
  onLogin: (role: Role) => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [selectedRole, setSelectedRole] = useState<Role>('staff');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      onLogin(selectedRole);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-rose-400/10 blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl shadow-primary/20 mb-4 border border-white">
            <ShieldCheck className="text-primary" size={40} />
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter">StaffCore Pro</h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Enterprise Resource Portal</p>
        </div>

        <div className="bg-white/70 backdrop-blur-lg rounded-[2.5rem] border border-white p-10 shadow-2xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Staff Identity</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="ID or Email Address"
                  className="w-full bg-white/50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Security Key</label>
                <button type="button" className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Recovery?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-white/50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Portal Access Level</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('staff')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                    selectedRole === 'staff' 
                      ? "border-primary bg-primary/5 text-primary shadow-sm" 
                      : "border-slate-100 bg-white/30 text-slate-400 hover:border-slate-200"
                  }`}
                >
                  <UserIcon size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Employee</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                    selectedRole === 'admin' 
                      ? "border-primary bg-primary/5 text-primary shadow-sm" 
                      : "border-slate-100 bg-white/30 text-slate-400 hover:border-slate-200"
                  }`}
                >
                  <ShieldCheck size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Executive</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-primary/30 uppercase tracking-widest text-xs"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Initialize Portal Session</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-slate-400 text-sm">
          Need assistance? <button className="text-primary font-bold hover:underline">Contact System Admin</button>
        </p>

        <div className="mt-12 flex justify-center gap-6 opacity-40">
          <button className="text-[10px] font-bold uppercase tracking-widest hover:opacity-100 transition-opacity">Privacy</button>
          <button className="text-[10px] font-bold uppercase tracking-widest hover:opacity-100 transition-opacity">Terms</button>
          <button className="text-[10px] font-bold uppercase tracking-widest hover:opacity-100 transition-opacity">Contact</button>
        </div>
      </motion.div>
    </div>
  );
}
