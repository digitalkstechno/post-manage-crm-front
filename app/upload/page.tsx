'use client';

import DashboardContent from '@/components/dashboard/DashboardContent';
import DashboardLayoutWrapper from '@/components/dashboard/DashboardLayoutWrapper';
import { useApp } from '@/lib/context';

export default function UploadPage() {
  const { role, posts, updateStatus, resubmit, postToSocial, addPost } = useApp();

  return (
    <DashboardLayoutWrapper>
      <DashboardContent 
        role={role}
        activeTab="posts"
        posts={posts}
        updateStatus={updateStatus}
        resubmit={resubmit}
        postToSocial={postToSocial}
        addPost={addPost}
      />
    </DashboardLayoutWrapper>
  );
}
