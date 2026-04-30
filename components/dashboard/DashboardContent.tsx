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
  Share2,
} from "lucide-react";
import { Submission, Role, SubmissionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/context";
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
  resubmit?: (id: string, fileLink: string) => Promise<void>;
  postToSocial?: (id: string) => Promise<void>;
}

export default function DashboardContent({
  role,
  activeTab,
  submissions,
  searchQuery = "",
  addSubmission,
  updateStatus,
  resubmit,
  postToSocial,
}: DashboardContentProps) {
  const { companies } = useApp();
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState("");
  const [reworkModal, setReworkModal] = useState<Submission | null>(null);
  const [reworkLink, setReworkLink] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [socialModal, setSocialModal] = useState<Submission | null>(null);
  const [posting, setPosting] = useState(false);

  // Local state for the upload form
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    company: "",
    uploadAt: "",
  });

  const nowLocal = () => {
    const now = new Date();
    now.setSeconds(0, 0);
    return now.toISOString().slice(0, 16);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.link) return;
    if (formData.uploadAt && new Date(formData.uploadAt) < new Date()) {
      alert("Upload date cannot be in the past.");
      return;
    }
    addSubmission(formData);
    setFormData({
      title: "",
      description: "",
      link: "",
      company: "",
      uploadAt: "",
    });
  };

  const getStatusColor = (status: SubmissionStatus) => {
    switch (status) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-100";
      case "rework":
        return "bg-violet-50 text-violet-700 border-violet-100";
      default:
        return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  const personalSubmissions = submissions.filter((s) => true); // In a real app, filter by user email

  const filteredSubmissions = submissions.filter((s) => {
    // Search filter
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.staffName.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesFilter = activeFilter === "all" || s.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === "pending").length,
    approved: submissions.filter((s) => s.status === "approved").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
    rework: submissions.filter((s) => s.status === "rework").length,
  };

  return (
    <div className="p-8 pb-20 max-w-7xl mx-auto space-y-8">
      {/* Stats Section */}
      {(activeTab === "overview" || activeTab === "submissions") && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            label="Total Submissions"
            value={stats.total}
            icon={FileText}
            trend="+12% ↑"
            color="blue"
            active={activeFilter === "all"}
            onClick={() => setActiveFilter("all")}
          />
          <StatCard
            label="Pending Requests"
            value={stats.pending}
            icon={Clock}
            trend="Action Req"
            color="amber"
            active={activeFilter === "pending"}
            onClick={() => setActiveFilter("pending")}
          />
          <StatCard
            label="Total Approved"
            value={stats.approved}
            icon={CheckCircle2}
            trend="93% Rate"
            color="emerald"
            active={activeFilter === "approved"}
            onClick={() => setActiveFilter("approved")}
          />
          <StatCard
            label="Total Rejected"
            value={stats.rejected}
            icon={XCircle}
            trend="Manual Rev."
            color="rose"
            active={activeFilter === "rejected"}
            onClick={() => setActiveFilter("rejected")}
          />
          <StatCard
            label="Rework"
            value={stats.rework}
            icon={MessageSquare}
            trend="In Review"
            color="violet"
            active={activeFilter === "rework"}
            onClick={() => setActiveFilter("rework")}
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
                onReworkInitiate={() => {}}
                onResubmitInitiate={(s) => {
                  setReworkModal(s);
                  setReworkLink(s.link);
                }}
                onPostSocial={role === "admin" ? setSocialModal : undefined}
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
                onReworkInitiate={() => {}}
                onResubmitInitiate={(s) => {
                  setReworkModal(s);
                  setReworkLink(s.link);
                }}
                onPostSocial={role === "admin" ? setSocialModal : undefined}
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

                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                      Drive Link
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
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                      Company
                    </label>
                    <select
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all"
                    >
                      <option value="">Select Company</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                      Upload At
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.uploadAt}
                      min={nowLocal()}
                      onChange={(e) =>
                        setFormData({ ...formData, uploadAt: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all"
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject / Rework Modal */}
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
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectComment("");
                }}
                className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-slate-500 text-sm mb-6">
              Add a comment and choose to reject or request a rework.
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
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectComment("");
                }}
                className="px-6 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateStatus(showRejectModal, "rework", rejectComment);
                  setShowRejectModal(null);
                  setRejectComment("");
                }}
                className="px-6 py-2.5 bg-violet-600 text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-violet-600/20 text-sm"
              >
                Request Rework
              </button>
              <button
                onClick={() => {
                  updateStatus(showRejectModal, "rejected", rejectComment);
                  setShowRejectModal(null);
                  setRejectComment("");
                }}
                className="px-6 py-2.5 bg-rose-600 text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-rose-600/20 text-sm"
              >
                Reject
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Rework Resubmit Modal (staff) */}
      <AnimatePresence>
        {reworkModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 p-8"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">
                  Resubmit — {reworkModal.title}
                </h3>
                <button
                  onClick={() => setReworkModal(null)}
                  className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              {reworkModal.adminComment && (
                <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 mb-4">
                  <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1">
                    Admin Note
                  </p>
                  <p className="text-sm text-violet-700">
                    {reworkModal.adminComment}
                  </p>
                </div>
              )}
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                Updated Drive / File Link
              </label>
              <input
                type="url"
                value={reworkLink}
                onChange={(e) => setReworkLink(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all text-sm mb-6"
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setReworkModal(null)}
                  className="px-6 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!reworkLink.trim()) return;
                    await resubmit?.(reworkModal.id, reworkLink);
                    setReworkModal(null);
                  }}
                  className="px-8 py-2.5 bg-primary text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-primary/20"
                >
                  Resubmit
                </button>
              </div>
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
  icon: Icon,
  trend,
  color,
  active,
  onClick,
}: {
  label: string;
  value: number;
  icon: any;
  trend: string;
  color: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
    violet: "bg-violet-50 text-violet-600",
  };

  const borderColors: Record<string, string> = {
    blue: "border-blue-300",
    amber: "border-amber-300",
    emerald: "border-emerald-300",
    rose: "border-rose-300",
    violet: "border-violet-300",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white/80 backdrop-blur-sm p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md hover:translate-y-[-2px] cursor-pointer",
        active ? `${borderColors[color]} shadow-md` : "border-slate-200",
      )}
    >
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
  onReworkInitiate,
  onResubmitInitiate,
  onPostSocial,
}: {
  submissions: Submission[];
  role: Role;
  getStatusColor: (s: SubmissionStatus) => string;
  onApprove: (id: string) => void;
  onRejectInitiate: (id: string) => void;
  onReworkInitiate: (id: string) => void;
  onResubmitInitiate: (s: Submission) => void;
  onPostSocial?: (s: Submission) => void;
}) {
  const PAGE_SIZE = 10;
  const [page, setPage] = React.useState(1);
  const [commentPopup, setCommentPopup] = React.useState<Submission | null>(
    null,
  );

  // Reset to page 1 when submissions list changes (filter/search)
  React.useEffect(() => {
    setPage(1);
  }, [submissions.length]);

  const totalPages = Math.max(1, Math.ceil(submissions.length / PAGE_SIZE));
  const paged = submissions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse table-fixed">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Submission
            </th>
            {role === "admin" && (
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Staff
              </th>
            )}
            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Submitted At
            </th>
            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Upload At
            </th>
            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Company
            </th>
            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Status
            </th>
            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {submissions.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-20 text-center text-slate-400">
                No submissions found.
              </td>
            </tr>
          ) : (
            paged.map((s) => (
              <tr
                key={s.id}
                className="group hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-4 py-4">
                  <div>
                    <p className="font-bold text-slate-800 truncate">
                      {s.title}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {s.description}
                    </p>
                  </div>
                </td>
                {role === "admin" && (
                  <td className="px-2 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-600">
                        {s.staffName}
                      </span>
                    </div>
                  </td>
                )}
                <td className="px-2 py-4 text-sm text-slate-500">
                  {new Date(s.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-2 py-4 text-sm text-slate-500">
                  {s.uploadAt ? (
                    new Date(s.uploadAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="px-2 py-4">
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {s.companyName || s.company || "—"}
                  </span>
                </td>
                <td className="px-2 py-4">
                  <div className="flex flex-col gap-1 items-start">
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
                              : s.status === "rework"
                                ? "bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                                : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
                        )}
                      />
                      {s.status}
                    </span>
                    {/* {s.status === "rejected" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-violet-50 text-violet-700 border-violet-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                        rework
                      </span>
                    )} */}
                    {s.status === "rejected" && role === "staff" && (
                      <button
                        onClick={() => onResubmitInitiate(s)}
                        className="px-3 py-1 bg-violet-50 text-violet-600 rounded-full hover:bg-violet-100 transition-all border border-violet-100 text-[10px] font-black uppercase tracking-widest"
                      >
                        Rework
                      </button>
                    )}
                    {s.status === "rework" && role === "staff" && (
                      <button
                        onClick={() => onResubmitInitiate(s)}
                        className="px-3 py-1 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-all text-[10px] font-black uppercase tracking-widest"
                      >
                        Submit Rework
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex justify-end gap-2 items-center">
                    {role === "admin" &&
                    (s.status === "pending" || s.status === "rework") ? (
                      <>
                        <button
                          onClick={() => onApprove(s.id)}
                          className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all border border-emerald-100"
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => onRejectInitiate(s.id)}
                          className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-all border border-rose-100"
                          title="Reject / Rework"
                        >
                          <X size={16} />
                        </button>
                        {s.link && (
                          <a
                            href={s.link}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </>
                    ) : role === "admin" && s.status === "rejected" ? (
                      <div className="flex justify-end gap-2 items-center">
                        <button
                          onClick={() => onRejectInitiate(s.id)}
                          className="px-2 py-1.5 bg-violet-50 text-violet-600 rounded-lg hover:bg-violet-100 transition-all border border-violet-100 text-[10px] font-black uppercase tracking-widest"
                          title="Request Rework"
                        >
                          Rework
                        </button>
                        <button
                          onClick={() => setCommentPopup(s)}
                          className=" text-rose-400 hover:text-rose-600 transition-colors"
                          title="View rejection reason"
                        >
                          <MessageSquare size={16} />
                        </button>
                        {s.link && (
                          <a
                            href={s.link}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex justify-end gap-2 items-center">
                          {(s.status === "rejected" ||
                            s.status === "rework") && (
                            <button
                              onClick={() => setCommentPopup(s)}
                              className={cn(
                                "p-1.5 transition-colors",
                                s.status === "rework"
                                  ? "text-violet-400 hover:text-violet-600"
                                  : "text-rose-400 hover:text-rose-600",
                              )}
                              title="View admin note"
                            >
                              <MessageSquare size={16} />
                            </button>
                          )}
                          {s.link && s.status !== "rework" && (
                            <a
                              href={s.link}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                            >
                              <ExternalLink size={16} />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Rejection Comment Popup */}
      <AnimatePresence>
        {commentPopup && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 p-8"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">
                  Rejection Reason
                </h3>
                <button
                  onClick={() => setCommentPopup(null)}
                  className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                {commentPopup.title}
              </p>
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mt-3">
                {commentPopup.adminComment ? (
                  <p className="text-sm text-rose-700 leading-relaxed">
                    {commentPopup.adminComment}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400">No reason provided.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="p-6 bg-slate-50/30 border-t border-slate-100 flex justify-end items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Prev
          </button>
          <span className="text-slate-500">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
