"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Building2, Plus, Trash2, X } from "lucide-react";
import { useApp } from "@/lib/context";
import { cn } from "@/lib/utils";

export default function CompanyContent({ searchQuery = "" }: { searchQuery?: string }) {
  const { companies, addCompany, deleteCompany } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Company name is required"); return; }
    setError("");
    await addCompany(name.trim());
    setName("");
    setShowModal(false);
  };

  return (
    <div className="p-8 pb-20 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Companies</h2>
          <p className="text-slate-400 text-sm mt-1">{companies.length} companies registered</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20 text-sm"
        >
          <Plus size={16} />
          Add Company
        </button>
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">#</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Company Name</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-20 text-center text-slate-400 text-sm">
                  No companies found. Add one to get started.
                </td>
              </tr>
            ) : (
              filtered.map((c, i) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-400 font-semibold">{i + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Building2 size={16} />
                      </div>
                      <span className="font-bold text-slate-800 text-sm">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteCompany(c.id)}
                      className="p-1.5 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition-all border border-rose-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="p-4 bg-slate-50/30 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Showing {filtered.length} results
        </div>
      </div>

      {/* Add Modal */}
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
                <button onClick={() => { setShowModal(false); setName(""); setError(""); }} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Acme Corp"
                      className={cn(
                        "w-full bg-slate-50 border rounded-xl pl-10 pr-4 py-3 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all text-sm",
                        error ? "border-rose-400" : "border-slate-200"
                      )}
                    />
                  </div>
                  {error && <p className="text-xs text-rose-500 ml-1">{error}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 text-xs uppercase tracking-widest mt-2"
                >
                  <Plus size={16} />
                  Add Company
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
