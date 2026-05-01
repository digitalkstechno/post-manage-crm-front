"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { CloudUpload } from "lucide-react";
import { useApp } from "@/lib/context";

export default function PostForm() {
  const { getCompanyDropdown, addPost } = useApp();
  const [dropdownCompanies, setDropdownCompanies] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    companyId: "",
    uploadAt: "",
  });

  React.useEffect(() => {
    getCompanyDropdown().then(setDropdownCompanies);
  }, [getCompanyDropdown]);

  const nowLocal = () => {
    const now = new Date();
    now.setSeconds(0, 0);
    return now.toISOString().slice(0, 16);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.link || !formData.companyId) {
      alert("Please fill all required fields (Title, Link, Company)");
      return;
    }
    if (formData.uploadAt && new Date(formData.uploadAt) < new Date()) {
      alert("Upload date cannot be in the past.");
      return;
    }
    addPost(formData);
    setFormData({
      title: "",
      description: "",
      link: "",
      companyId: "",
      uploadAt: "",
    });
  };

  return (
    <motion.div
      key="upload"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col md:flex-row gap-8"
    >
      <div className="flex-1 bg-white rounded-[32px] border border-slate-200 p-10 shadow-sm">
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-50">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <CloudUpload size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
              Create New Post
            </h3>
            <p className="text-slate-400 text-xs mt-1">Submit your content for review</p>
          </div>
        </div>

        <form onSubmit={handleUploadSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Post Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Summer Collection Launch"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm"
                required
              />
            </div>

            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Content Link (Drive/Social)
              </label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
                placeholder="https://drive.google.com/..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Target Company
              </label>
              <select
                value={formData.companyId}
                onChange={(e) =>
                  setFormData({ ...formData, companyId: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm appearance-none"
                required
              >
                <option value="">Select Company</option>
                {dropdownCompanies.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Post Date/Time
              </label>
              <input
                type="datetime-local"
                value={formData.uploadAt}
                min={nowLocal()}
                onChange={(e) =>
                  setFormData({ ...formData, uploadAt: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Caption / Additional Notes
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
                placeholder="Provide caption or notes for the post..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all resize-none text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-primary text-white font-black py-4 px-10 rounded-[20px] hover:opacity-90 active:scale-[0.98] transition-all shadow-xl shadow-primary/20 text-xs uppercase tracking-widest"
            >
              Submit for Approval
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
