// Updated admin page with OpportunityStatusManager integration
"use client";

import { useState } from "react";
import { SessionContextProvider, useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

// Import your components
import LoginComponent from "@/components/LoginComponent";
import ImageManager from "@/components/ImageManager";
import PostEditor from "@/components/PostEditor";
import PreviewComponent from "@/components/PreviewComponent";
import PostsList from "@/components/PostsList";
import JobsManager from "@/components/JobsManager";
import OpportunityStatusManager from "@/components/OpportunityStatusManager"; // Import the new component

const supabaseClient = createPagesBrowserClient();

// Environment configuration
const ENVIRONMENTS = {
  dev: {
    name: "Development",
    url: "https://dev.shivambajaj.com",
  },
  prod: {
    name: "Production",
    url: "https://shivambajaj.com",
  }
};

export default function AdminPageWrapper() {
  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        {/* Global background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10">
          <AdminPage />
        </div>
      </div>
    </SessionContextProvider>
  );
}

function AdminPage() {
  const session = useSession();
  const authClient = useSupabaseClient();

  // UI States
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [currentEnv, setCurrentEnv] = useState<"dev" | "prod">("dev");
  const [showImageManager, setShowImageManager] = useState(false);
  const [showPostsList, setShowPostsList] = useState(false);
  const [showJobsManager, setShowJobsManager] = useState(false);
  const [showOpportunityManager, setShowOpportunityManager] = useState(false); // Add state for OpportunityStatusManager

  // Post editing states
  const [editingPost, setEditingPost] = useState<any>(null);
  const [postData, setPostData] = useState({
    title: "",
    tags: "",
    content: "",
    imagePreview: ""
  });

  const showMessage = (text: string, type: "success" | "error" | "info") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 7000);
  };

  const handleLogout = async () => {
    await authClient.auth.signOut();
    location.reload();
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    setPostData({
      title: post.title,
      tags: post.tags,
      content: post.content,
      imagePreview: post.image_url || ""
    });
    showMessage(`✏️ Now editing: ${post.title}`, "info");
  };

  const handleEditCancel = () => {
    setEditingPost(null);
    setPostData({
      title: "",
      tags: "",
      content: "",
      imagePreview: ""
    });
    showMessage("❌ Edit cancelled", "info");
  };

  const handlePostSaved = () => {
    // Refresh posts list and reset form
    setEditingPost(null);
    setPostData({
      title: "",
      tags: "",
      content: "",
      imagePreview: ""
    });
  };

  const handleImageInsert = (markdownImageText: string) => {
    setPostData(prev => ({
      ...prev,
      content: prev.content + `\n${markdownImageText}\n`
    }));
    showMessage("🖼️ Image inserted into post!", "success");
  };

  // If not logged in, show login component
  if (!session) {
    return <LoginComponent />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            🛠️ Content Management System
          </h1>
          <p className="text-gray-400">Create and manage your blog posts & resume across environments</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Environment Switcher */}
          <div className="flex bg-white/5 rounded-full p-1 border border-white/20">
            {Object.entries(ENVIRONMENTS).map(([key, env]) => (
              <button
                key={key}
                onClick={() => setCurrentEnv(key as "dev" | "prod")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  currentEnv === key
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {key === "dev" ? "🔧" : "🚀"} {env.name}
              </button>
            ))}
          </div>

          {/* Management Buttons */}
          <button
            onClick={() => setShowImageManager(!showImageManager)}
            className={`px-4 py-2 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
              showImageManager ? "bg-blue-600/30 text-blue-200" : "bg-white/10 hover:bg-white/20"
            }`}
          >
            🖼️ Images
          </button>

          <button
            onClick={() => setShowPostsList(!showPostsList)}
            className={`px-4 py-2 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
              showPostsList ? "bg-blue-600/30 text-blue-200" : "bg-white/10 hover:bg-white/20"
            }`}
          >
            📚 Posts
          </button>

          <button
            onClick={() => setShowJobsManager(!showJobsManager)}
            className={`px-4 py-2 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
              showJobsManager ? "bg-purple-600/30 text-purple-200" : "bg-white/10 hover:bg-white/20"
            }`}
          >
            💼 Resume Jobs
          </button>

          {/* New Opportunity Status Button */}
          <button
            onClick={() => setShowOpportunityManager(!showOpportunityManager)}
            className={`px-4 py-2 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
              showOpportunityManager ? "bg-emerald-600/30 text-emerald-200" : "bg-white/10 hover:bg-white/20"
            }`}
          >
            💼 Job Status
          </button>

          <button
            onClick={() => window.open(ENVIRONMENTS[currentEnv].url, '_blank')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105"
          >
            🏠 View Site
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-full text-sm font-medium text-red-200 transition-all duration-300 hover:scale-105"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Environment Status */}
      <div className="mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${currentEnv === "dev" ? "bg-yellow-400" : "bg-green-400"}`}></div>
          <span className="text-white font-medium">
            Currently working on: {ENVIRONMENTS[currentEnv].name}
          </span>
          <span className="text-gray-400 text-sm">
            ({ENVIRONMENTS[currentEnv].url})
          </span>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl border ${
          messageType === "success" ? "bg-green-500/20 text-green-200 border-green-500/30" :
          messageType === "error" ? "bg-red-500/20 text-red-200 border-red-500/30" :
          "bg-blue-500/20 text-blue-200 border-blue-500/30"
        } transition-all duration-300`}>
          {message}
        </div>
      )}

      {/* Image Manager Component */}
      <ImageManager
        showImageManager={showImageManager}
        onImageInsert={handleImageInsert}
        showMessage={showMessage}
      />

      {/* Posts List Component */}
      <PostsList
        showPostsList={showPostsList}
        currentEnv={currentEnv}
        environments={ENVIRONMENTS}
        onEditPost={handleEditPost}
        showMessage={showMessage}
      />

      {/* Jobs Manager Component */}
      <JobsManager
        showJobsManager={showJobsManager}
        showMessage={showMessage}
      />

      {/* Opportunity Status Manager Component */}
      <OpportunityStatusManager
        showOpportunityManager={showOpportunityManager}
        showMessage={showMessage}
      />

      {/* Main Content Grid - Only show when not managing jobs or opportunities */}
      {!showJobsManager && !showOpportunityManager && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Post Editor Component */}
          <div className="space-y-6">
            <PostEditor
              currentEnv={currentEnv}
              environments={ENVIRONMENTS}
              editingPost={editingPost}
              onPostSaved={handlePostSaved}
              onEditCancel={handleEditCancel}
              showMessage={showMessage}
            />
          </div>

          {/* Preview Component */}
          <div className="space-y-6">
            <PreviewComponent
              title={postData.title}
              tags={postData.tags}
              content={postData.content}
              imagePreview={postData.imagePreview}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>🚀 Powered by Next.js, Supabase & Tailwind CSS</p>
        <p className="mt-1">Environment: {ENVIRONMENTS[currentEnv].name}</p>
        {showJobsManager && (
          <p className="mt-1 text-purple-400">💼 Resume Jobs Management Mode</p>
        )}
        {showOpportunityManager && (
          <p className="mt-1 text-emerald-400">💼 Opportunity Status Management Mode</p>
        )}
      </div>
    </div>
  );
}