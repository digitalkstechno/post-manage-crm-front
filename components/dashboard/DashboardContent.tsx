"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  CloudUpload,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  MessageSquare,
  Filter,
  Download,
  MoreVertical,
  Check,
  X,
} from "lucide-react";
import { Submission, Role, SubmissionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

interface DashboardContentProps {
  role: Role;
  activeTab: string;
  submissions: Submission[];
  searchQuery?: string;
  addSubmission: (
    s: Omit<
      Submission,
      "id" | "status" | "createdAt" | "staffName" | "staffEmail"
    >,
  ) => void;
  updateStatus: (
    id: string,
    status: SubmissionStatus,
    comment?: string,
  ) => void;
}

export default function DashboardContent({
  role,
  activeTab,
  submissions,
  searchQuery = "",
  addSubmission,
  updateStatus,
}: DashboardContentProps) {
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState("");

  // Local state for the upload form
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    category: "General",
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.link) return;
    addSubmission(formData);
    setFormData({ title: "", description: "", link: "", category: "General" });
  };

  const getStatusColor = (status: SubmissionStatus) => {
    switch (status) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-100";
      default:
        return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  const personalSubmissions = submissions.filter((s) => true); // In a real app, filter by user email

  const filteredSubmissions = submissions.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const stats = {
    total: filteredSubmissions.length,
    pending: filteredSubmissions.filter((s) => s.status === "pending").length,
    approved: filteredSubmissions.filter((s) => s.status === "approved").length,
    rejected: filteredSubmissions.filter((s) => s.status === "rejected").length,
  };

  return (
    <div className="p-8 pb-20 max-w-7xl mx-auto space-y-8">
      {/* Stats Section */}
      {(activeTab === "overview" || activeTab === "submissions") && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            label="Total Submissions"
            value={stats.total}
            icon={FileText}
            trend="+12% ↑"
            color="blue"
          />
          <StatCard
            label="Pending Requests"
            value={stats.pending}
            icon={Clock}
            trend="Action Req"
            color="amber"
          />
          <StatCard
            label="Total Approved"
            value={stats.approved}
            icon={CheckCircle2}
            trend="93% Rate"
            color="emerald"
          />
          <StatCard
            label="Total Rejected"
            value={stats.rejected}
            icon={XCircle}
            trend="Manual Rev."
            color="rose"
          />
        </div>
      )}

      {/* Main Content Areas */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {role === "staff" && (
              <div className="flex justify-end">
                <Link
                  href="/upload"
                  className="bg-primary text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20 text-sm"
                >
                  <PlusCircle size={16} />
                  <span>New Submission</span>
                </Link>
              </div>
            )}

            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                Recent Activity
              </h3>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                  <Filter size={14} />
                  Filter
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                  <Download size={14} />
                  Export
                </button>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <SubmissionTable
                submissions={filteredSubmissions.slice(0, 5)}
                role={role}
                getStatusColor={getStatusColor}
                onApprove={(id) => updateStatus(id, "approved")}
                onRejectInitiate={(id) => setShowRejectModal(id)}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 p-6 h-64 flex flex-col justify-between">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Submission Trends
                </h4>
                <div className="flex items-end justify-between h-32 gap-3 px-2">
                  {[40, 60, 45, 80, 95, 70, 90].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-slate-100/50 rounded-t-xl relative group transition-all hover:bg-primary/5"
                    >
                      <div
                        className="absolute inset-x-1 bottom-0 bg-primary/20 rounded-t-lg scale-y-0 origin-bottom transition-transform duration-700"
                        style={{ height: `${h}%`, transform: "scaleY(1)" }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[9px] font-bold text-slate-300 uppercase tracking-widest px-2">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
              <div className="bg-primary rounded-2xl p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-primary/30">
                <div className="relative z-10">
                  <h4 className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em] mb-2">
                    System Health
                  </h4>
                  <p className="text-xl font-extrabold tracking-tight">
                    Active & Secure
                  </p>
                </div>
                <div className="space-y-4 relative z-10">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase opacity-60">
                      <span>Server Load</span>
                      <span>32%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-white w-[32%] shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase opacity-60">
                      <span>Response Time</span>
                      <span>42ms</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 w-[12%] shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                    </div>
                  </div>
                </div>
                <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "submissions" && (
          <motion.div
            key="submissions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {role === "staff" && (
              <div className="flex justify-end">
                <Link
                  href="/upload"
                  className="bg-primary text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20 text-sm"
                >
                  <PlusCircle size={16} />
                  <span>New Submission</span>
                </Link>
              </div>
            )}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <SubmissionTable
                submissions={filteredSubmissions}
                role={role}
                getStatusColor={getStatusColor}
                onApprove={(id) => updateStatus(id, "approved")}
                onRejectInitiate={(id) => setShowRejectModal(id)}
              />
            </div>
          </motion.div>
        )}

        {role === "staff" && activeTab === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col md:flex-row gap-8"
          >
            <div className="flex-1 bg-white rounded-3xl border border-slate-200 p-10 shadow-sm">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
                <CloudUpload className="text-primary" size={24} />
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                  Submit New Documentation
                </h3>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                      Document Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="e.g., Performance Review Q1"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all"
                    >
                      <option>General</option>
                      <option>HR</option>
                      <option>Finance</option>
                      <option>Legal</option>
                      <option>Operations</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                      Drive / File Link
                    </label>
                    <input
                      type="url"
                      value={formData.link}
                      onChange={(e) =>
                        setFormData({ ...formData, link: e.target.value })
                      }
                      placeholder="https://drive.google.com/..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all"
                      required
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                      Context / Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      placeholder="Provide additional details for the reviewer..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                  >
                    Send to Review
                  </button>
                </div>
              </form>
            </div>

            <div className="w-full md:w-80 space-y-6">
              <div className="bg-primary rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-primary/10">
                <h4 className="text-sm font-bold opacity-60 uppercase tracking-widest mb-2">
                  Submission Policy
                </h4>
                <p className="text-sm leading-relaxed opacity-90 mb-6">
                  Ensure all documents are properly categorized and links are
                  shared for external viewing to avoid rejection.
                </p>
                <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:underline">
                  View Full Guidelines
                  <ExternalLink size={14} />
                </button>
                <div className="absolute -right-6 -bottom-6 opacity-10">
                  <FileText size={120} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                Reject Submission
              </h3>
              <button
                onClick={() => setShowRejectModal(null)}
                className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-slate-500 text-sm mb-6">
              Provide a reason for the rejection. This feedback will be visible
              to the staff member.
            </p>

            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="e.g., Missing departmental sign-off..."
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 transition-all resize-none mb-6"
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRejectModal(null)}
                className="px-6 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateStatus(showRejectModal, "rejected", rejectComment);
                  setShowRejectModal(null);
                  setRejectComment("");
                }}
                className="px-8 py-2.5 bg-rose-600 text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-rose-600/20"
              >
                Reject Now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  color,
}: {
  label: string;
  value: number;
  icon: any;
  trend: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:translate-y-[-2px]">
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

function SubmissionTable({
  submissions,
  role,
  getStatusColor,
  onApprove,
  onRejectInitiate,
}: {
  submissions: Submission[];
  role: Role;
  getStatusColor: (s: SubmissionStatus) => string;
  onApprove: (id: string) => void;
  onRejectInitiate: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Submission
            </th>
            {role === "admin" && (
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Staff
              </th>
            )}
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Category
            </th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Submitted At
            </th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Status
            </th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {submissions.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                No submissions found.
              </td>
            </tr>
          ) : (
            submissions.map((s) => (
              <tr
                key={s.id}
                className="group hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <p className="font-bold text-slate-800 truncate">
                      {s.title}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {s.description}
                    </p>
                  </div>
                </td>
                {role === "admin" && (
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden relative">
                        <Image
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.staffName}`}
                          alt="Avatar"
                          fill
                          className="object-cover transition-opacity opacity-0 duration-300"
                          onLoadingComplete={(img) =>
                            img.classList.remove("opacity-0")
                          }
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-600">
                        {s.staffName}
                      </span>
                    </div>
                  </td>
                )}
                <td className="px-6 py-4">
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {s.category || "General"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(s.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      getStatusColor(s.status),
                    )}
                  >
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        s.status === "approved"
                          ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                          : s.status === "rejected"
                            ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                            : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
                      )}
                    />
                    {s.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {role === "admin" && s.status === "pending" ? (
                      <>
                        <button
                          onClick={() => onApprove(s.id)}
                          className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all border border-emerald-100"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => onRejectInitiate(s.id)}
                          className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-all border border-rose-100"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <a
                          href={s.link}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                        >
                          <ExternalLink size={16} />
                        </a>
                        {s.adminComment && (
                          <div className="relative group/comment">
                            <MessageSquare
                              size={16}
                              className="text-amber-400 cursor-help"
                            />
                            <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-slate-800 text-white text-[10px] leading-relaxed rounded-xl opacity-0 translate-y-2 pointer-events-none group-hover/comment:opacity-100 group-hover/comment:translate-y-0 transition-all z-50 shadow-xl">
                              {s.adminComment}
                            </div>
                          </div>
                        )}
                        <button className="p-1.5 text-slate-300 hover:text-slate-600">
                          <MoreVertical size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="p-6 bg-slate-50/30 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <span>Showing {submissions.length} results</span>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-30"
            disabled
          >
            Prev
          </button>
          <button
            className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-30"
            disabled
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
