"use client";

import { useApp } from "@/lib/context";
import { useMemo, useEffect } from "react";
import { FileText, CheckCircle, XCircle, Upload, TrendingUp, TrendingDown } from "lucide-react";

export default function AdminDashboard() {
  const { adminStats, fetchAdminStats } = useApp();

  useEffect(() => {
    fetchAdminStats();
  }, [fetchAdminStats]);

  const cards = [
    {
      label: "Total Posts",
      value: adminStats.totalPosts,
      icon: Upload,
      color: "bg-violet-500",
      light: "bg-violet-50",
      text: "text-violet-600",
    },
    {
      label: "This Month Posts",
      value: adminStats.thisMonthPosts,
      icon: FileText,
      color: "bg-blue-500",
      light: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      label: "Total Approved",
      value: adminStats.totalApproved,
      icon: CheckCircle,
      color: "bg-emerald-500",
      light: "bg-emerald-50",
      text: "text-emerald-600",
    },
    {
      label: "Total Rejected",
      value: adminStats.totalRejected,
      icon: XCircle,
      color: "bg-rose-500",
      light: "bg-rose-50",
      text: "text-rose-600",
    },
  ];

  const monthName = (offset = 0) => {
    const d = new Date();
    d.setMonth(d.getMonth() - offset);
    return d.toLocaleString("default", { month: "long", year: "numeric" });
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Overview of all posting activity</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-4">
              <div className={`${card.light} p-3 rounded-xl`}>
                <Icon className={card.text} size={22} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800">{card.value}</p>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Monthly Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* This Month */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-emerald-500" size={18} />
            <h2 className="font-bold text-slate-700 text-sm">{monthName(0)}</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 font-medium">Approved</span>
              <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                {adminStats.thisMonthApproved}
              </span>
            </div>
            <div className="h-px bg-slate-100" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 font-medium">Rejected</span>
              <span className="text-sm font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
                {adminStats.thisMonthRejected}
              </span>
            </div>
          </div>
        </div>

        {/* Last Month */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="text-slate-400" size={18} />
            <h2 className="font-bold text-slate-700 text-sm">{monthName(1)}</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 font-medium">Approved</span>
              <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                {adminStats.lastMonthApproved}
              </span>
            </div>
            <div className="h-px bg-slate-100" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 font-medium">Rejected</span>
              <span className="text-sm font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
                {adminStats.lastMonthRejected}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
