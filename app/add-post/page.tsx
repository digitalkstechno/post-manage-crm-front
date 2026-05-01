"use client";

import React from "react";
import PostForm from "@/components/dashboard/PostForm";
import DashboardLayoutWrapper from "@/components/dashboard/DashboardLayoutWrapper";

export default function AddPostPage() {
  return (
    <DashboardLayoutWrapper>
      <div className="p-8 max-w-5xl mx-auto">
        <PostForm />
      </div>
    </DashboardLayoutWrapper>
  );
}
