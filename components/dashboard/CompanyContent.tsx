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
    isLoading,
    searchQuery 
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
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCompany(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      setError("Company name is required");
      return;
    }

    if (editingCompany) {
      await updateCompany(editingCompany.id, formData);
    } else {
      await addCompany(formData);
    }
    handleCloseModal();
  };

  const columns = [
    {
      header: "Company Name",
      accessor: (item: Company) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm group-hover:scale-110 transition-transform">
            {item.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">{item.name}</p>
            <span className={cn(
              "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
              item.category === "Own" ? "bg-violet-50 text-violet-600 border-violet-100" : "bg-blue-50 text-blue-600 border-blue-100"
            )}>
              {item.category || "Customer"}
            </span>
          </div>
        </div>
      )
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
            onClick={() => {
              if (confirm("Are you sure you want to delete this company?")) {
                deleteCompany(item.id);
              }
            }}
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
    // Top Nav handles global search, but we can also trigger fetch here if needed
    // However, DashboardLayoutWrapper handles the search state
  }, []);

  useEffect(() => {
    fetchCompanies(1, 10, searchQuery);
  }, [searchQuery, fetchCompanies]);

  return (
    <div className="p-8 pb-20 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Companies</h1>
          <p className="text-slate-400 text-sm mt-1">Manage client and business profiles</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary text-white font-bold py-3 px-6 rounded-2xl flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-primary/20 text-sm whitespace-nowrap"
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
        isLoading={isLoading}
        searchPlaceholder="Search companies..."
        emptyMessage="No companies found."
        // We omit onSearchChange because we use global Top Nav search
      />

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl border border-white/20 p-8"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                    {editingCompany ? "Edit Company" : "Add Company"}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">
                    {editingCompany ? "Update company details" : "Create a new business profile"}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Acme Corp"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm appearance-none"
                    >
                      <option value="Customer">Customer Brand</option>
                      <option value="Own">Internal Brand</option>
                    </select>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Social Media Profiles</p>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-300 ml-1">Facebook URL</label>
                      <input
                        type="url"
                        value={formData.facebook}
                        onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                        placeholder="https://facebook.com/..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-slate-700 placeholder:text-slate-300 focus:outline-none text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-300 ml-1">Instagram URL</label>
                      <input
                        type="url"
                        value={formData.instagram}
                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                        placeholder="https://instagram.com/..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-slate-700 placeholder:text-slate-300 focus:outline-none text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-300 ml-1">Google My Business</label>
                      <input
                        type="url"
                        value={formData.googleMyBusiness}
                        onChange={(e) => setFormData({ ...formData, googleMyBusiness: e.target.value })}
                        placeholder="https://g.page/..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-slate-700 placeholder:text-slate-300 focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                {error && <p className="text-xs text-rose-500 font-bold ml-1">{error}</p>}

                <button
                  type="submit"
                  className="w-full bg-primary text-white font-black py-5 rounded-[20px] flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-xl shadow-primary/20 text-xs uppercase tracking-widest"
                >
                  {editingCompany ? "Update Company" : "Create Company"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
