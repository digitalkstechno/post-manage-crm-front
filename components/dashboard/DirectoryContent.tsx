"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  UserPlus,
  ShieldCheck,
  User as UserIcon,
  Mail,
  Building2,
  Calendar,
  X,
  Trash2,
  Search,
  Lock,
} from "lucide-react";
import { useApp } from "@/lib/context";
import { StaffMember, Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface DirectoryContentProps {
  searchQuery?: string;
}

export default function DirectoryContent({
  searchQuery = "",
}: DirectoryContentProps) {
  const { login } = useApp();
  const router = useRouter();

  const [staffList, setStaffList] = useState<StaffMember[]>([
    {
      id: "1",
      name: "Sarah Miller",
      email: "sarah.m@company.com",
      role: "staff",
      department: "Finance",
      joinedAt: "2023-10-01T00:00:00Z",
    },
    {
      id: "2",
      name: "David Chen",
      email: "david.c@company.com",
      role: "staff",
      department: "Engineering",
      joinedAt: "2023-10-05T00:00:00Z",
    },
    {
      id: "3",
      name: "Elena Rodriguez",
      email: "elena.r@company.com",
      role: "staff",
      department: "Legal",
      joinedAt: "2023-09-15T00:00:00Z",
    },
    {
      id: "4",
      name: "James Wilson",
      email: "james.w@company.com",
      role: "admin",
      department: "Operations",
      joinedAt: "2023-08-20T00:00:00Z",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "Engineering",
    role: "staff" as Role,
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: StaffMember = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      department: formData.department,
      joinedAt: new Date().toISOString(),
    };
    setStaffList([newMember, ...staffList]);
    setShowModal(false);
    setFormData({
      name: "",
      email: "",
      password: "",
      department: "Engineering",
      role: "staff",
    });

    // Role પ્રમાણે redirect
    login(formData.role);
    if (formData.role === "admin") {
      router.push("/submissions");
    } else {
      router.push("/submissions");
    }
  };

  const handleDelete = (id: string) => {
    setStaffList(staffList.filter((s) => s.id !== id));
  };

  const filtered = staffList.filter(s =>
  s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
  s.department.toLowerCase().includes(searchQuery.toLowerCase())
);

  return (
    <div className="p-8 pb-20 max-w-7xl mx-auto space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          label="Total Staff"
          value={staffList.length}
          color="blue"
          icon={Users}
          trend="All Members"
        />
        <StatCard
          label="Admins"
          value={staffList.filter((s) => s.role === "admin").length}
          color="rose"
          icon={ShieldCheck}
          trend="Executive"
        />
        <StatCard
          label="Employees"
          value={staffList.filter((s) => s.role === "staff").length}
          color="emerald"
          icon={UserIcon}
          trend="Active"
        />
        <StatCard
          label="Departments"
          value={[...new Set(staffList.map((s) => s.department))].length}
          color="amber"
          icon={Building2}
          trend="Teams"
        />
      </div>

      {/* Header */}

      <div className="flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20 text-sm whitespace-nowrap"
        >
          <UserPlus size={16} />
          Add Staff Member
        </button>
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Member
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Department
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Role
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Joined
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-20 text-center text-slate-400 text-sm"
                  >
                    No staff members found.
                  </td>
                </tr>
              ) : (
                filtered.map((member) => (
                  <tr
                    key={member.id}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">
                            {member.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-fit">
                        <Building2 size={12} />
                        {member.department}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                          member.role === "admin"
                            ? "bg-rose-50 text-rose-700 border-rose-100"
                            : "bg-emerald-50 text-emerald-700 border-emerald-100",
                        )}
                      >
                        {member.role === "admin" ? (
                          <ShieldCheck size={10} />
                        ) : (
                          <UserIcon size={10} />
                        )}
                        {member.role === "admin" ? "Executive" : "Employee"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(member.joinedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="p-1.5 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition-all border border-rose-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="p-6 bg-slate-50/30 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Showing {filtered.length} results</span>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                  Add Staff Member
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g. John Smith"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="e.g. john@company.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Department
                  </label>
                  <div className="relative">
                    <Building2
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <select
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all text-sm appearance-none"
                    >
                      <option>Engineering</option>
                      <option>Finance</option>
                      <option>HR</option>
                      <option>Legal</option>
                      <option>Operations</option>
                      <option>Marketing</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Portal Access Level
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, role: "staff" })
                      }
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                        formData.role === "staff"
                          ? "border-primary bg-primary/5 text-primary shadow-sm"
                          : "border-slate-100 bg-white/30 text-slate-400 hover:border-slate-200",
                      )}
                    >
                      <UserIcon size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Employee
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, role: "admin" })
                      }
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                        formData.role === "admin"
                          ? "border-primary bg-primary/5 text-primary shadow-sm"
                          : "border-slate-100 bg-white/30 text-slate-400 hover:border-slate-200",
                      )}
                    >
                      <ShieldCheck size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Executive
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 text-xs uppercase tracking-widest mt-2"
                >
                  <UserPlus size={16} />
                  Create & Login as Member
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// function StatCard({
//   label,
//   value,
//   color,
// }: {
//   label: string;
//   value: number;
//   color: string;
// }) {
//   const colors: Record<string, string> = {
//     blue: "bg-blue-50 text-blue-600",
//     amber: "bg-amber-50 text-amber-600",
//     emerald: "bg-emerald-50 text-emerald-600",
//     rose: "bg-rose-50 text-rose-600",
//   };
//   return (
//     <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all">
//       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
//         {label}
//       </p>
//       <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
//         {value}
//       </p>
//     </div>
//   );
// }
function StatCard({
  label,
  value,
  color,
  icon: Icon,
  trend,
}: {
  label: string;
  value: number;
  color: string;
  icon: any;
  trend: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
  };
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-2.5 rounded-xl", colors[color])}>
          <Icon size={20} />
        </div>
        <span
          className={cn(
            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
            colors[color],
          )}
        >
          {trend}
        </span>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">
        {label}
      </p>
      <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
        {value}
      </p>
    </div>
  );
}
