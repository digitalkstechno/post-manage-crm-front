"use client";

import React from "react";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardLayoutWrapper from "@/components/dashboard/DashboardLayoutWrapper";
import { useApp } from "@/lib/context";

export default function PostsPage() {
  const {
    role,
    posts,
    fetchPosts,
    addPost,
    updateStatus,
    searchQuery,
    resubmit,
    postToSocial,
  } = useApp();

  React.useEffect(() => {
    fetchPosts(1, 10);
  }, [fetchPosts]);

  return (
    <DashboardLayoutWrapper>
      <DashboardContent
        role={role}
        activeTab="posts"
        posts={posts}
        searchQuery={searchQuery}
        addPost={addPost}
        updateStatus={updateStatus}
        resubmit={resubmit}
        postToSocial={postToSocial}
      />
    </DashboardLayoutWrapper>
  );
}
