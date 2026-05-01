"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  UserPlus,
  ShieldCheck,
  User as UserIcon,
  Mail,
  X,
  Lock,
  Building2,
  Check,
  ChevronDown,
  Pencil,
  Trash2,
} from "lucide-react";
import { useApp } from "@/lib/context";
import { StaffMember, Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import CommonTable from "../common/CommonTable";
import toast from "react-hot-toast";

export default function DirectoryContent() {
  const { 
    staffList: rawStaffList, 
    staffPagination, 
    fetchStaff, 
    addStaff,
    updateStaff,
    deleteStaff,
    isLoading,
    getCompanyDropdown
  } = useApp();

  const [availableCompanies, setAvailableCompanies] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    getCompanyDropdown().then(setAvailableCompanies);
  }, [getCompanyDropdown]);

  const staffList: StaffMember[] = useMemo(() => {
    return rawStaffList.map((s: any) => ({
      id: s._id || s.id,
      name: s.fullName || s.name,
      email: s.email,
      role: s.role || "staff",
      joinedAt: s.createdAt || new Date().toISOString(),
      assignedCompanies: s.assignedCompanies || [],
    }));
  }, [rawStaffList]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff" as Role,
    assignedCompanies: [] as string[],
  });
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [searchQuery, setSearchQuery] = useState("");

  const toggleCompany = (id: string) => {
    setFormData(prev => ({
      ...prev,
      assignedCompanies: prev.assignedCompanies.includes(id)
        ? prev.assignedCompanies.filter(c => c !== id)
        : [...prev.assignedCompanies, id]
    }));
  };

  const removeCompany = (id: string) => {
    setFormData(prev => ({
      ...prev,
      assignedCompanies: prev.assignedCompanies.filter(c => c !== id)
    }));
  };

  const handleEdit = (member: StaffMember) => {
    setEditingId(member.id);
    setFormData({
      name: member.name,
      email: member.email,
      password: "", // Keep empty for no change
      role: member.role,
      assignedCompanies: member.assignedCompanies.map((c: any) => c._id || c),
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this member?")) {
      deleteStaff(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!editingId && !formData.password.trim()) newErrors.password = "Password is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const payload: any = {
      fullName: formData.name,
      email: formData.email,
      role: formData.role,
      assignedCompanies: formData.assignedCompanies,
    };
    if (formData.password) payload.password = formData.password;

    if (editingId) {
      await updateStaff(editingId, payload);
    } else {
      await addStaff(payload);
    }

    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "staff",
      assignedCompanies: [],
    });
  };

  const columns = [
    {
      header: "Member",
      accessor: (member: StaffMember) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm group-hover:scale-110 transition-transform">
            {member.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">{member.name}</p>
            <p className="text-[10px] text-slate-400 font-medium">{member.email}</p>
          </div>
        </div>
      )
    },
    {
      header: "Role",
      accessor: (member: StaffMember) => (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
            member.role === "admin"
              ? "bg-rose-50 text-rose-700 border-rose-100 shadow-rose-100/20"
              : member.role === "hr"
              ? "bg-blue-50 text-blue-700 border-blue-100 shadow-blue-100/20"
              : "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-100/20",
          )}
        >
          {member.role === "admin" ? <ShieldCheck size={10} /> : <UserIcon size={10} />}
          {member.role === "admin" ? "Executive" : member.role === "hr" ? "HR Manager" : "Employee"}
        </span>
      )
    },
    {
      header: "Assigned Companies",
      accessor: (member: StaffMember) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {member.role === 'admin' ? (
            <span className="text-[10px] font-bold text-slate-400 uppercase italic">All Companies</span>
          ) : (
            member.assignedCompanies?.map((c: any) => (
              <span key={c._id || c} className="text-[9px] font-black uppercase bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                {c.name || "Unknown"}
              </span>
            )) || <span className="text-[10px] text-slate-300">None</span>
          )}
        </div>
      )
    },
    {
      header: "Actions",
      accessor: (member: StaffMember) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(member)}
            className="p-2 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all border border-transparent hover:border-primary/10"
            title="Edit Member"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => handleDelete(member.id)}
            className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
            title="Delete Member"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
      className: "w-24 text-right"
    }
  ];

  const handlePageChange = React.useCallback((page: number) => {
    fetchStaff(page, 10, searchQuery);
  }, [fetchStaff, searchQuery]);

  const handleSearchChange = React.useCallback((search: string) => {
    setSearchQuery(search);
    fetchStaff(1, 10, search);
  }, [fetchStaff]);


  return (
    <div className="p-8 pb-20 max-w-7xl mx-auto space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          label="Total Staff"
          value={staffPagination?.total || staffList.length}
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
          label="HR Managers"
          value={staffList.filter((s) => s.role === "hr").length}
          color="amber"
          icon={Users}
          trend="Management"
        />
        <StatCard
          label="Employees"
          value={staffList.filter((s) => s.role === "staff").length}
          color="emerald"
          icon={UserIcon}
          trend="Active"
        />
      </div>

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Staff Directory</h1>
          <p className="text-slate-400 text-sm mt-1">Manage team members and permissions</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-primary text-white font-bold py-3 px-6 rounded-2xl flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-primary/20 text-sm whitespace-nowrap"
        >
          <UserPlus size={18} />
          Add Staff Member
        </button>
      </div>

      <CommonTable
        columns={columns}
        data={staffList}
        pagination={staffPagination || undefined}
        onPageChange={handlePageChange}
        onSearchChange={handleSearchChange}
        isLoading={isLoading}
        searchPlaceholder="Search staff by name or email..."
        emptyMessage="No staff members found."
      />

      {/* Create/Edit Staff Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl border border-white/20 p-8"
            >
              <div className="flex justify-between items-center mb-8 sticky top-0 bg-white z-10 pb-2">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                    {editingId ? "Edit Member" : "Add Member"}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">
                    {editingId ? "Update account details" : "Create a new team account"}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"
                        size={16}
                      />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="e.g. John Smith"
                        className={cn(
                          "w-full bg-slate-50 border rounded-2xl pl-12 pr-5 py-4 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm",
                          errors.name ? "border-rose-400" : "border-slate-200",
                        )}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-xs text-rose-500 ml-1">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"
                        size={16}
                      />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="e.g. john@company.com"
                        className={cn(
                          "w-full bg-slate-50 border rounded-2xl pl-12 pr-5 py-4 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm",
                          errors.email ? "border-rose-400" : "border-slate-200",
                        )}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-rose-500 ml-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Password {editingId && "(Leave blank to keep current)"}
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"
                        size={16}
                      />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="••••••••"
                        className={cn(
                          "w-full bg-slate-50 border rounded-2xl pl-12 pr-5 py-4 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm",
                          errors.password
                            ? "border-rose-400"
                            : "border-slate-200",
                        )}
                      />
                    </div>
                    {errors.password && (
                      <p className="text-xs text-rose-500 ml-1">
                        {errors.password}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Portal Access Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'admin', label: 'Executive', icon: ShieldCheck },
                      { id: 'hr', label: 'HR Manager', icon: Users },
                      { id: 'staff', label: 'Employee', icon: UserIcon },
                    ].map((r) => {
                      const Icon = r.icon;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, role: r.id as Role })}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
                            formData.role === r.id
                              ? "border-primary bg-primary/5 text-primary shadow-md shadow-primary/10"
                              : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200",
                          )}
                        >
                          <Icon size={18} />
                          <span className="text-[8px] font-black uppercase tracking-widest text-center">
                            {r.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {formData.role !== 'admin' && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Assign Companies
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 flex items-center justify-between text-sm text-slate-700 focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                      >
                        <span className="text-slate-400">Select Companies...</span>
                        <ChevronDown className={cn("text-slate-400 transition-transform", isDropdownOpen && "rotate-180")} size={18} />
                      </button>

                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-20 left-0 right-0 mt-2 bg-white border border-slate-100 shadow-xl rounded-2xl max-h-[250px] overflow-y-auto p-2 space-y-1"
                          >
                            {availableCompanies.length === 0 ? (
                              <p className="text-xs text-slate-400 p-4 text-center">No companies available</p>
                            ) : (
                              availableCompanies.map((c) => (
                                <button
                                  key={c._id}
                                  type="button"
                                  onClick={() => {
                                    toggleCompany(c._id);
                                    setIsDropdownOpen(false);
                                  }}
                                  className={cn(
                                    "w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-colors text-left",
                                    formData.assignedCompanies.includes(c._id)
                                      ? "bg-primary/5 text-primary"
                                      : "text-slate-600 hover:bg-slate-50"
                                  )}
                                >
                                  {c.name}
                                  {formData.assignedCompanies.includes(c._id) && <Check size={14} />}
                                </button>
                              ))
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {formData.assignedCompanies.map((id) => {
                        const company = availableCompanies.find(c => c._id === id);
                        return (
                          <div
                            key={id}
                            className="flex items-center gap-2 bg-slate-800 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md shadow-slate-200 group animate-in zoom-in-95"
                          >
                            <span>{company?.name || "Unknown"}</span>
                            <button
                              type="button"
                              onClick={() => removeCompany(id)}
                              className="hover:text-rose-400 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        );
                      })}
                      {formData.assignedCompanies.length === 0 && (
                        <p className="text-[10px] text-amber-500 font-bold ml-1 italic animate-pulse">
                          ⚠ Please assign at least one company
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-primary text-white font-black py-5 rounded-[20px] flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-xl shadow-primary/20 text-xs uppercase tracking-widest mt-2"
                >
                  {editingId ? <Pencil size={18} /> : <UserPlus size={18} />}
                  {editingId ? "Update Member Details" : "Add Member to Team"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
