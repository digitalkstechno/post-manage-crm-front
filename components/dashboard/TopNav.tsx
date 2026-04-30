"use client";

import React from "react";
import Image from "next/image";
import {
  Search,
  Bell,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { User } from "@/lib/types";

interface TopNavProps {
  user: User | null;
  title: string;
  onSearch?: (query: string) => void;
  searchValue?: string;
}

export default function TopNav({
  user,
  title,
  onSearch,
  searchValue,
}: TopNavProps) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white/50 backdrop-blur-md flex justify-between items-center px-8 sticky top-0 z-30">
      <div className="flex items-center gap-8 flex-1">
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight whitespace-nowrap">
          {title}
        </h2>
        <div className="relative max-w-md w-full hidden md:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
            size={16}
          />
          <input
            type="text"
            value={searchValue || ""}
            onChange={(e) => onSearch?.(e.target.value)}
            placeholder="Search..."
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all placeholder:text-slate-300"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
        <div className="flex items-center gap-3">
          
            <p className="text-sm font-semibold text-slate-800 leading-none">
              {user?.name}
            </p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
              {typeof user?.role === 'string' ? user.role : ''}
            </p>
          
          <div
            className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
              user?.role === "admin"
                ? "bg-rose-50 text-rose-600 border-rose-100"
                : "bg-emerald-50 text-emerald-600 border-emerald-100"
            }`}
          >
            {user?.role === "admin" ? (
              <ShieldCheck size={18} />
            ) : (
              <UserIcon size={18} />
            )}
          </div>
          {/* <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden relative">
            <Image
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt="Avatar"
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div> */}
        </div>
      </div>
    </header>
  );
}
