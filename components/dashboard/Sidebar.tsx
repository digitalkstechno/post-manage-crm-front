"use client";

import React from "react";
import { FileText, Users, LogOut, PlusCircle, ShieldCheck, Building2 } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Role } from "@/lib/types";

interface SidebarProps {
  currentRole: Role;
  onLogout: () => void;
}

export default function Sidebar({ currentRole, onLogout }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      id: "submissions",
      label: "Submissions Record",
      icon: FileText,
      roles: ["admin", "staff"],
      href: "/submissions",
    },
    {
      id: "directory",
      label: "Staff Directory",
      icon: Users,
      roles: ["admin"],
      href: "/directory",
    },
    {
      id: "companies",
      label: "Companies",
      icon: Building2,
      roles: ["admin"],
      href: "/companies",
    },
  ];

  const filteredItems = menuItems.filter((item) =>
    item.roles.includes(currentRole as string),
  );

  return (
    <aside className="w-64 bg-white/70 backdrop-blur-md border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-200/50 flex items-center gap-3">
        <div className="bg-primary p-2.5 rounded-xl text-white shadow-lg shadow-primary/20">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="font-extrabold text-lg text-slate-800 tracking-tight leading-none uppercase">
            SMM
          </h1>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
            Enterprise AI
          </p>
        </div>
      </div>

      <nav className="flex-1 mt-6 px-3 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all relative text-sm font-semibold",
                isActive
                  ? "text-primary bg-primary/5 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-full"
                />
              )}
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-2">
    

        <div className="pt-4 border-t border-slate-200/50 space-y-1">
          
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-rose-600 transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
