"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Building2, Plus, Trash2, X } from "lucide-react";
import { useApp } from "@/lib/context";
import { cn } from "@/lib/utils";

export default function CompanyContent() {
  const { companies, addCompany, deleteCompany } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await addCompany(name.trim());
    setLoading(false);
    setName("");
    setShowModal(false);
  };

  return (
    <div className="p-8 pb-20 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20 text-sm"
        >
          <Plus size={16} />
          Add Company
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Company Name
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Added On
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {companies.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-20 text-center text-slate-400 text-sm">
                    No companies added yet.
                  </td>
                </tr>
              ) : (
                companies.map((c: any) => (
                  <tr key={c._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                          <Building2 size={16} />
                        </div>
                        <span className="font-bold text-slate-800 text-sm">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteCompany(c._id)}
                        className="p-1.5 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition-all border border-rose-100"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="p-6 bg-slate-50/30 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Showing {companies.length} results
          </div>
        </div>
      </div>

      {/* Add Company Modal */}
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
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Add Company</h3>
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
                    Company Name
                  </label>
                  <div className="relative">
                    <Building2
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Acme Corp"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all text-sm"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 text-xs uppercase tracking-widest mt-2 disabled:opacity-60"
                >
                  <Plus size={16} />
                  {loading ? "Adding..." : "Add Company"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
