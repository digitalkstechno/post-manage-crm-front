"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { PaginationData } from "@/lib/types";

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface CommonTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pagination?: PaginationData;
  onPageChange?: (page: number) => void;
  onSearchChange?: (search: string) => void;
  isLoading?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  rowKey?: (item: T) => string | number;
}

export default function CommonTable<T>({
  columns,
  data,
  pagination,
  onPageChange,
  onSearchChange,
  isLoading,
  searchPlaceholder = "Search...",
  emptyMessage = "No records found.",
  rowKey = (item: any) => item.id || item._id,
}: CommonTableProps<T>) {
  const [searchValue, setSearchValue] = useState("");

  const isFirstRender = React.useRef(true);

  // Debounce search
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!searchValue) return;
    }

    const handler = setTimeout(() => {
      onSearchChange?.(searchValue);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchValue, onSearchChange]);

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative group max-w-md w-full">
          <Search 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" 
            size={18} 
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={cn(
                      "px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400",
                      col.className
                    )}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((_, idx) => (
                      <td key={idx} className="px-6 py-5">
                        <div className={cn(
                          "h-4 bg-slate-100 rounded-lg animate-pulse",
                          idx === 0 ? "w-1/2" : idx === 1 ? "w-3/4" : "w-1/4"
                        )} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-20 text-center text-slate-400 text-sm italic"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((item, i) => (
                  <tr
                    key={rowKey(item)}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    {columns.map((col, idx) => (
                      <td
                        key={idx}
                        className={cn("px-6 py-4 text-sm text-slate-600", col.className)}
                      >
                        {typeof col.accessor === "function"
                          ? col.accessor(item)
                          : (item[col.accessor] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination && (
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1 || isLoading}
                onClick={() => onPageChange?.(pagination.page - 1)}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1">
                {(() => {
                  const pages = [];
                  const totalPages = pagination.pages;
                  const current = pagination.page;
                  
                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    if (current > 3) pages.push('...');
                    
                    const start = Math.max(2, current - 1);
                    const end = Math.min(totalPages - 1, current + 1);
                    
                    for (let i = start; i <= end; i++) {
                      if (!pages.includes(i)) pages.push(i);
                    }
                    
                    if (current < totalPages - 2) pages.push('...');
                    if (!pages.includes(totalPages)) pages.push(totalPages);
                  }
                  
                  return pages.map((p, i) => (
                    p === '...' ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-slate-300">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => onPageChange?.(p as number)}
                        className={cn(
                          "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                          pagination.page === p
                            ? "bg-primary text-white shadow-md shadow-primary/20"
                            : "text-slate-400 hover:bg-slate-100"
                        )}
                      >
                        {p}
                      </button>
                    )
                  ));
                })()}
              </div>
              <button
                disabled={pagination.page >= pagination.pages || isLoading}
                onClick={() => onPageChange?.(pagination.page + 1)}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
