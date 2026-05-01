"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Building2, Plus, Trash2, X, Edit2, Facebook, Instagram, Search as GSearch, ExternalLink } from "lucide-react";
import { useApp } from "@/lib/context";
import { cn } from "@/lib/utils";
import CommonTable from "../common/CommonTable";
import { Company } from "@/lib/types";

export default function CompanyContent() {
  const { 
    companies, 
    companyPagination, 
    fetchCompanies, 
    addCompany, 
    updateCompany, 
    deleteCompany, 
    isLoading 
  } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    facebook: "",
    instagram: "",
    googleMyBusiness: "",
    category: "Customer" as "Customer" | "Own",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  const handleOpenModal = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        name: company.name,
        facebook: company.facebook || "",
        instagram: company.instagram || "",
        googleMyBusiness: company.googleMyBusiness || "",
        category: company.category || "Customer",
      });
    } else {
      setEditingCompany(null);
      setFormData({
        name: "",
        facebook: "",
        instagram: "",
        googleMyBusiness: "",
        category: "Customer",
      });
    }
    setShowModal(true);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { setError("Company name is required"); return; }
    
    if (editingCompany) {
      await updateCompany(editingCompany.id, formData);
    } else {
      await addCompany(formData);
    }
    setShowModal(false);
  };

  const columns = [
    {
      header: "#",
      accessor: (item: Company) => {
        const index = companies.indexOf(item);
        const page = companyPagination?.page || 1;
        const limit = companyPagination?.limit || 10;
        return <span className="text-slate-400 font-semibold">{(page - 1) * limit + index + 1}</span>;
      },
      className: "w-16"
    },
    {
      header: "Company Details",
      accessor: (item: Company) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Building2 size={18} />
          </div>
          <div>
            <div className="font-bold text-slate-800 text-sm">{item.name}</div>
          </div>
        </div>
      )
    },
    {
      header: "Category",
      accessor: (item: Company) => (
        <span className={cn(
          "text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border shadow-sm inline-block",
          item.category === "Own" 
            ? "bg-indigo-50 text-indigo-700 border-indigo-100 shadow-indigo-100/20" 
            : "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-100/20"
        )}>
          {item.category || "Customer"}
        </span>
      ),
      className: "w-32"
    },
    {
      header: "Social Links",
      accessor: (item: Company) => (
        <div className="flex items-center gap-2">
          {item.facebook && (
            <a href={item.facebook} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
              <Facebook size={14} />
            </a>
          )}
          {item.instagram && (
            <a href={item.instagram} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors">
              <Instagram size={14} />
            </a>
          )}
          {item.googleMyBusiness && (
            <a href={item.googleMyBusiness} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors">
              <GSearch size={14} />
            </a>
          )}
          {!item.facebook && !item.instagram && !item.googleMyBusiness && (
            <span className="text-slate-300 text-xs italic">No links</span>
          )}
        </div>
      )
    },
    {
      header: "Actions",
      accessor: (item: Company) => (
        <div className="flex items-center justify-end gap-2 transition-opacity">
          <button
            onClick={() => handleOpenModal(item)}
            className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-primary/10 hover:text-primary transition-all border border-slate-200"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => { if(confirm("Are you sure?")) deleteCompany(item.id) }}
            className="p-1.5 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition-all border border-rose-100"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
      className: "text-right"
    }
  ];

  const handlePageChange = React.useCallback((page: number) => {
    fetchCompanies(page, 10, searchQuery);
  }, [fetchCompanies, searchQuery]);

  const handleSearchChange = React.useCallback((search: string) => {
    setSearchQuery(search);
    fetchCompanies(1, 10, search);
  }, [fetchCompanies]);


  return (
    <div className="p-8 pb-20 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Companies</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your business partners and own profiles</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary text-white font-bold py-3 px-6 rounded-2xl flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-primary/20 text-sm"
        >
          <Plus size={18} />
          Add Company
        </button>
      </div>

      <CommonTable
        columns={columns}
        data={companies}
        pagination={companyPagination || undefined}
        onPageChange={handlePageChange}
        onSearchChange={handleSearchChange}
        isLoading={isLoading}
        searchPlaceholder="Search companies by name..."
        emptyMessage="No companies found. Add one to get started."
      />

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl border border-white/20 p-8 overflow-hidden relative"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                    {editingCompany ? "Edit Company" : "Add Company"}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">Fill in the details below</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Name & Category */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Company Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. Acme Corp"
                        className={cn(
                          "w-full bg-slate-50 border rounded-2xl px-5 py-4 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm",
                          error ? "border-rose-400" : "border-slate-200"
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm appearance-none"
                      >
                        <option value="Customer">Customer</option>
                        <option value="Own">Own</option>
                      </select>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="space-y-4 pt-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Social Links (Optional)</label>
                    
                    <div className="relative group">
                      <Facebook className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                      <input
                        type="url"
                        value={formData.facebook}
                        onChange={(e) => setFormData({...formData, facebook: e.target.value})}
                        placeholder="Facebook URL"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm"
                      />
                    </div>

                    <div className="relative group">
                      <Instagram className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-pink-500 transition-colors" size={16} />
                      <input
                        type="url"
                        value={formData.instagram}
                        onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                        placeholder="Instagram URL"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm"
                      />
                    </div>

                    <div className="relative group">
                      <GSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={16} />
                      <input
                        type="url"
                        value={formData.googleMyBusiness}
                        onChange={(e) => setFormData({...formData, googleMyBusiness: e.target.value})}
                        placeholder="Google My Business URL"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                {error && <p className="text-xs text-rose-500 ml-1">{error}</p>}

                <div className="flex gap-3 pt-4">
                   <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all text-xs uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-primary text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-xl shadow-primary/20 text-xs uppercase tracking-widest"
                  >
                    {editingCompany ? "Update Company" : "Add Company"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
