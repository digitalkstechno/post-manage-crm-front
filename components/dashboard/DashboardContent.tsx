"use client";

import React, { useState } from "react";
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
  Check,
  X,
  Share2,
} from "lucide-react";
import { Post, Role, PostStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/context";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import CommonTable from "../common/CommonTable";

interface DashboardContentProps {
  role: Role;
  activeTab: string;
  posts: Post[];
  searchQuery?: string;
  addPost: (
    s: Omit<
      Post,
      "id" | "status" | "createdAt" | "staffName" | "staffEmail"
    >,
  ) => void;
  updateStatus: (
    id: string,
    status: PostStatus,
    comment?: string,
  ) => void;
  resubmit?: (id: string, fileLink: string) => Promise<void>;
  postToSocial?: (id: string) => Promise<void>;
}

export default function DashboardContent({
  role,
  activeTab,
  posts,
  searchQuery = "",
  addPost,
  updateStatus,
  resubmit,
  postToSocial,
}: DashboardContentProps) {
  const { 
    companies, 
    postPagination, 
    postStats,
    fetchPosts, 
    isLoading 
  } = useApp();
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState("");
  const [reworkModal, setReworkModal] = useState<Post | null>(null);
  const [reworkLink, setReworkLink] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [socialModal, setSocialModal] = useState<Post | null>(null);
  const [commentPopup, setCommentPopup] = useState<Post | null>(null);

  const getStatusColor = (status: PostStatus) => {
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

  const stats = postStats;

  const columns = [
    {
      header: "Post Content",
      accessor: (s: Post) => (
        <div className="max-w-[200px]">
          <p className="font-bold text-slate-800 truncate">{s.title}</p>
          <p className="text-[10px] text-slate-400 truncate mt-0.5">{s.description || "No description"}</p>
        </div>
      )
    },
    ...(role === "admin" ? [{
      header: "Staff",
      accessor: (s: Post) => (
        <span className="text-xs font-semibold text-slate-600">{s.staffName}</span>
      )
    }] : []),
    {
      header: "Company",
      accessor: (s: Post) => (
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
          {s.companyName || "N/A"}
        </span>
      )
    },
    {
      header: "Status",
      accessor: (s: Post) => (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
              getStatusColor(s.status)
            )}
          >
            {s.status}
          </span>
          {s.adminComment && (
             <button
                onClick={() => setCommentPopup(s)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                title="View Note"
              >
                <MessageSquare size={12} />
              </button>
          )}
        </div>
      )
    },
    {
      header: "Post Date",
      accessor: (s: Post) => (
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-600">
            {s.uploadAt ? new Date(s.uploadAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            }) : "N/A"}
          </span>
          <span className="text-[9px] text-slate-400 font-medium">
            {s.uploadAt ? new Date(s.uploadAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit"
            }) : ""}
          </span>
        </div>
      )
    },
    {
      header: "Link",
      accessor: (s: Post) => (
        <a
          href={s.link}
          target="_blank"
          rel="noreferrer"
          className="p-2 bg-primary/5 text-primary rounded-xl hover:bg-primary/10 transition-colors flex items-center justify-center w-fit"
        >
          <ExternalLink size={14} />
        </a>
      )
    },
    {
      header: "Actions",
      accessor: (s: Post) => (
        <div className="flex items-center justify-end gap-2 transition-opacity">
          {(role === "admin" || role === "hr") && s.status === "pending" && (
            <>
              <button
                onClick={() => updateStatus(s.id, "approved")}
                className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 border border-emerald-100 transition-all"
                title="Approve"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => setShowRejectModal(s.id)}
                className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 border border-rose-100 transition-all"
                title="Reject / Rework"
              >
                <X size={14} />
              </button>
            </>
          )}
          {(role === "admin" || role === "hr") && s.status === "approved" && (
            <button
              onClick={() => setSocialModal(s)}
              className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-100 transition-all"
              title="Post to Social"
            >
              <Share2 size={14} />
            </button>
          )}
          {role === "staff" && s.status === "rework" && (
            <button
              onClick={() => {
                setReworkModal(s);
                setReworkLink(s.link);
              }}
              className="px-3 py-1 bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-violet-600/20 active:scale-95 transition-all"
            >
              Resubmit
            </button>
          )}
        </div>
      ),
      className: "text-right"
    }
  ];

  const handlePageChange = React.useCallback((page: number) => {
    fetchPosts(page, 10, searchQuery, activeFilter !== "all" ? activeFilter : undefined);
  }, [fetchPosts, searchQuery, activeFilter]);

  const handleSearchChange = React.useCallback((search: string) => {
    fetchPosts(1, 10, search, activeFilter !== "all" ? activeFilter : undefined);
  }, [fetchPosts, activeFilter]);

  return (
    <div className="p-8 pb-20 max-w-7xl mx-auto space-y-8">
      {/* Stats Section */}
      {(activeTab === "admin" || activeTab === "posts") && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            label="Total Posts"
            value={stats.total}
            icon={FileText}
            trend="All Time"
            color="blue"
            active={activeFilter === "all"}
            onClick={() => setActiveFilter("all")}
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={Clock}
            trend="Needs Action"
            color="amber"
            active={activeFilter === "pending"}
            onClick={() => setActiveFilter("pending")}
          />
          <StatCard
            label="Approved"
            value={stats.approved}
            icon={CheckCircle2}
            trend="Confirmed"
            color="emerald"
            active={activeFilter === "approved"}
            onClick={() => setActiveFilter("approved")}
          />
          <StatCard
            label="Rejected"
            value={stats.rejected}
            icon={XCircle}
            trend="Failed"
            color="rose"
            active={activeFilter === "rejected"}
            onClick={() => setActiveFilter("rejected")}
          />
          <StatCard
            label="Rework"
            value={stats.rework}
            icon={MessageSquare}
            trend="Fixes Needed"
            color="violet"
            active={activeFilter === "rework"}
            onClick={() => setActiveFilter("rework")}
          />
        </div>
      )}

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {activeTab === "admin" && (
          <motion.div
            key="admin"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
             <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Recent Posts</h2>
                <p className="text-slate-400 text-sm mt-1">Latest updates from your team</p>
              </div>
            </div>

            <CommonTable
              columns={columns}
              data={posts.slice(0, 5)}
              isLoading={isLoading}
              hidePagination
              hideSearch
              emptyMessage="No recent activity."
            />
          </motion.div>
        )}

        {activeTab === "posts" && (
          <motion.div
            key="posts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">All Posts</h1>
                <p className="text-slate-400 text-sm mt-1">Full history of content uploads</p>
              </div>
              {/* {role === "staff" && (
                <Link
                  href="/add-post"
                  className="bg-primary text-white font-bold py-3 px-6 rounded-2xl flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-primary/20 text-sm"
                >
                  <PlusCircle size={18} />
                  <span>Create New Post</span>
                </Link>
              )} */}
            </div>

            <CommonTable
              columns={columns}
              data={posts}
              pagination={postPagination || undefined}
              onPageChange={handlePageChange}
              onSearchChange={handleSearchChange}
              isLoading={isLoading}
              searchPlaceholder="Search posts..."
              emptyMessage="No posts matching your criteria."
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-md rounded-[32px] shadow-2xl border border-white/20 p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Review Feedback</h3>
                <p className="text-slate-400 text-xs mt-1">Add a note for the staff member</p>
              </div>
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectComment("");
                }}
                className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Explain why this needs rework or is rejected..."
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all resize-none mb-8"
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  updateStatus(showRejectModal, "rework", rejectComment);
                  setShowRejectModal(null);
                  setRejectComment("");
                }}
                className="flex-1 bg-violet-50 text-violet-600 font-bold py-4 rounded-2xl hover:bg-violet-100 transition-all text-xs uppercase tracking-widest border border-violet-100"
              >
                Request Rework
              </button>
              {/* <button
                onClick={() => {
                  updateStatus(showRejectModal, "rejected", rejectComment);
                  setShowRejectModal(null);
                  setRejectComment("");
                }}
                className="flex-1 bg-rose-600 text-white font-black py-4 rounded-2xl active:scale-95 transition-all shadow-xl shadow-rose-600/20 text-xs uppercase tracking-widest"
              >
                Reject
              </button> */}
            </div>
          </motion.div>
        </div>
      )}

      {/* Social Modal */}
      <AnimatePresence>
        {socialModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-[32px] shadow-2xl border border-white/20 p-8"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Share2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Social Post</h3>
                    <p className="text-slate-400 text-xs mt-1">Publish to external channels</p>
                  </div>
                </div>
                <button onClick={() => setSocialModal(null)} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6 mb-10">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Content Title</p>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 text-sm font-bold">
                    {socialModal.title}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Live Source</p>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium">
                    <a href={socialModal.link} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all">
                      {socialModal.link}
                    </a>
                  </div>
                </div>
              </div>

              <button
                onClick={async () => {
                  await postToSocial?.(socialModal.id);
                  setSocialModal(null);
                }}
                className="w-full bg-primary text-white font-black py-5 rounded-[20px] flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-xl shadow-primary/20 text-xs uppercase tracking-widest"
              >
                <Share2 size={18} />
                Confirm & Publish
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rework Modal (Staff) */}
      <AnimatePresence>
        {reworkModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-[32px] shadow-2xl border border-white/20 p-8"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Resubmit</h3>
                  <p className="text-slate-400 text-xs mt-1">Update your work for review</p>
                </div>
                <button
                  onClick={() => setReworkModal(null)}
                  className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {reworkModal.adminComment && (
                <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5 mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare size={14} className="text-violet-400" />
                    <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest">
                      Reviewer Notes
                    </p>
                  </div>
                  <p className="text-sm text-violet-700 font-medium">
                    {reworkModal.adminComment}
                  </p>
                </div>
              )}

              <div className="space-y-2 mb-8">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Updated File Link
                </label>
                <input
                  type="url"
                  value={reworkLink}
                  onChange={(e) => setReworkLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm"
                />
              </div>

              <div className="flex gap-4">
                 <button
                  onClick={() => setReworkModal(null)}
                  className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all text-xs uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!reworkLink.trim()) return;
                    await resubmit?.(reworkModal.id, reworkLink);
                    setReworkModal(null);
                  }}
                  className="flex-[2] bg-primary text-white font-black py-4 rounded-2xl active:scale-95 transition-all shadow-xl shadow-primary/20 text-xs uppercase tracking-widest"
                >
                  Resubmit Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Note Modal */}
      <AnimatePresence>
        {commentPopup && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-[32px] shadow-2xl border border-white/20 p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Reviewer Feedback</h3>
                <button onClick={() => setCommentPopup(null)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {commentPopup.adminComment}
                </p>
              </div>
              <button
                onClick={() => setCommentPopup(null)}
                className="w-full mt-6 bg-slate-800 text-white font-black py-4 rounded-2xl hover:opacity-90 transition-all text-xs uppercase tracking-widest"
              >
                Close
              </button>
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
        "bg-white/80 backdrop-blur-sm p-5 rounded-[24px] border shadow-sm transition-all hover:shadow-lg hover:translate-y-[-4px] cursor-pointer group",
        active ? `${borderColors[color]} shadow-md bg-white` : "border-slate-100",
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-2xl group-hover:scale-110 transition-transform", colors[color])}>
          <Icon size={20} />
        </div>
        <span
          className={cn(
            "text-[8px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border",
            colors[color],
          )}
        >
          {trend}
        </span>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">
          {label}
        </p>
        <p className="text-2xl font-black text-slate-800 tracking-tight">
          {value}
        </p>
      </div>
    </div>
  );
}
