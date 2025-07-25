// components/PostsList.tsx
"use client";

import { useState, useEffect } from "react";
import { getClientByEnv, createProdClient } from "@/lib/supabase";

interface PostsListProps {
  showPostsList: boolean;
  currentEnv: "dev" | "prod";
  environments: any;
  onEditPost: (post: any) => void;
  showMessage: (text: string, type: "success" | "error" | "info") => void;
}

type Environment = "dev" | "prod";

export default function PostsList({
  showPostsList,
  currentEnv,
  environments,
  onEditPost,
  showMessage
}: PostsListProps) {
  const [existingPosts, setExistingPosts] = useState<any[]>([]);
  const [deploymentStatus, setDeploymentStatus] = useState("");

  // Get the correct supabase client based on current environment
  const getCurrentClient = () => {
    return getClientByEnv(currentEnv);
  };

  // Explicitly type the environment check
  const isCurrentlyViewingProd = (): boolean => {
    return currentEnv === "prod";
  };

  useEffect(() => {
    if (showPostsList) {
      loadExistingPosts();
    }
  }, [showPostsList, currentEnv]);

  const loadExistingPosts = async () => {
    try {
      const client = getCurrentClient();

      console.log(`🔍 Loading posts from ${currentEnv} database...`);

      const { data, error } = await client
        .from("posts")
        .select("*")
        .eq("published", true) // Only show published posts
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error(`❌ Error loading ${currentEnv} posts:`, error);
        showMessage(`❌ Failed to load ${currentEnv} posts: ${error.message}`, "error");
        setExistingPosts([]);
      } else {
        console.log(`✅ Loaded ${data?.length || 0} posts from ${currentEnv}`);
        setExistingPosts(data || []);
      }
    } catch (error) {
      console.error(`❌ Failed to connect to ${currentEnv} database:`, error);
      showMessage(`❌ Failed to connect to ${currentEnv} database`, "error");
      setExistingPosts([]);
    }
  };

  const promoteToProduction = async (post: any) => {
    if (isCurrentlyViewingProd()) {
      showMessage("❌ Post is already in production.", "error");
      return;
    }
    const prodUrl = process.env.NEXT_PUBLIC_SUPABASE_PROD_URL;
    const prodKey = process.env.NEXT_PUBLIC_SUPABASE_PROD_ANON_KEY;

    if (!prodUrl || !prodKey) {
      showMessage("❌ Production environment variables not configured.", "error");
      console.error('Missing env vars:', { prodUrl: !!prodUrl, prodKey: !!prodKey });
      return;
    }

    if (prodUrl === process.env.NEXT_PUBLIC_SUPABASE_DEV_URL) {
      showMessage("❌ Dev and Prod URLs are the same! You need separate Supabase projects.", "error");
      return;
    }

    if (!confirm(`Promote "${post.title}" to production?`)) return;

    setDeploymentStatus("Promoting to production...");

    try {
      // Create production client using lib function
      const prodClient = createProdClient();

      console.log('✅ Production client created');

      // Test connection first
      console.log('🔍 Testing production connection...');
      const { data: testData, error: testError } = await prodClient
        .from("posts")
        .select("count", { count: 'exact', head: true });

      if (testError) {
        console.error("❌ Production connection test failed:", testError);
        showMessage(`❌ Cannot connect to production: ${testError.message}`, "error");
        return;
      }

      console.log('✅ Production connection successful');

      // Check if post already exists
      console.log('🔍 Checking for existing post with slug:', post.slug);
      const { data: existingPost, error: findError } = await prodClient
        .from("posts")
        .select("id")
        .eq("slug", post.slug)
        .maybeSingle();

      if (findError) {
        console.error("❌ Error finding existing post:", findError);
        showMessage(`❌ Error checking existing post: ${findError.message}`, "error");
        return;
      }

      console.log('📝 Existing post found:', !!existingPost);

      const postData = {
        title: post.title,
        slug: post.slug,
        tags: post.tags,
        content: post.content,
        image_url: post.image_url,
        published: post.published
        // Remove environment field since we're using separate databases
      };

      console.log('📤 Preparing to save post data:', postData);

      let result;
      if (existingPost) {
        console.log('🔄 Updating existing post...');
        result = await prodClient
          .from("posts")
          .update(postData)
          .eq("id", existingPost.id)
          .select();
      } else {
        console.log('➕ Creating new post...');
        result = await prodClient
          .from("posts")
          .insert(postData)
          .select();
      }

      if (result.error) {
        console.error("❌ Promotion error:", result.error);
        showMessage(`❌ Failed to promote: ${result.error.message}`, "error");
      } else {
        console.log('✅ Promotion successful:', result.data);
        showMessage(`🚀 Successfully ${existingPost ? 'updated' : 'created'} post in production!`, "success");

        // Refresh the current list if we're viewing prod
        if (isCurrentlyViewingProd()) {
          loadExistingPosts();
        }
      }
    } catch (error) {
      console.error("❌ Promotion error:", error);
      showMessage("❌ Deployment failed.", "error");
    } finally {
      setDeploymentStatus("");
    }
  };

  const deletePost = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}" from ${currentEnv}?`)) return;

    try {
      const client = getCurrentClient();

      const { error } = await client
        .from("posts")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("❌ Delete error:", error);
        showMessage(`❌ Failed to delete post: ${error.message}`, "error");
      } else {
        showMessage("🗑️ Post deleted successfully.", "success");
        loadExistingPosts();
      }
    } catch (error) {
      console.error("❌ Delete error:", error);
      showMessage("❌ Failed to delete post.", "error");
    }
  };

  const duplicatePost = async (post: any) => {
    try {
      const client = getCurrentClient();

      const duplicatedPost = {
        title: `${post.title} (Copy)`,
        slug: `${post.slug}-copy-${Date.now()}`,
        tags: post.tags,
        content: post.content,
        image_url: post.image_url,
        published: false
        // Remove environment field since we're using separate databases
      };

      const { error } = await client
        .from("posts")
        .insert(duplicatedPost);

      if (error) {
        console.error("❌ Duplicate error:", error);
        showMessage(`❌ Failed to duplicate post: ${error.message}`, "error");
      } else {
        showMessage("📄 Post duplicated successfully!", "success");
        loadExistingPosts();
      }
    } catch (error) {
      console.error("❌ Duplicate error:", error);
      showMessage("❌ Failed to duplicate post.", "error");
    }
  };

  if (!showPostsList) return null;

  return (
    <div className="mb-8 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">
          📚 Posts in {environments[currentEnv].name}
          <span className="ml-2 text-sm text-gray-400">
            ({isCurrentlyViewingProd() ? "Production DB" : "Development DB"})
          </span>
        </h2>
        {deploymentStatus && (
          <div className="text-blue-400 text-sm animate-pulse">
            {deploymentStatus}
          </div>
        )}
      </div>

      {existingPosts.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <div className="text-4xl mb-2">📝</div>
          <p>No posts yet in {environments[currentEnv].name}</p>
          <p className="text-sm mt-1">
            {!isCurrentlyViewingProd() ?
              "Create your first post to get started!" :
              "Promote posts from development to see them here!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {existingPosts.map((post) => (
            <div key={post.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors gap-4">
              {/* ENHANCED TITLE SECTION - NO MORE TRUNCATION */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white leading-tight break-words mb-2">
                  {/* HANDLE EMOJIS AND TEXT SEPARATELY FOR BETTER DISPLAY */}
                  {post.title.split(/(\p{Emoji})/gu).map((part: string, index: number) => {
                    // If this part is an emoji, render with larger size
                    if (/\p{Emoji}/gu.test(part)) {
                      return <span key={index} className="text-xl">{part}</span>;
                    }
                    // If this part is text, render normally
                    return part ? (
                      <span key={index}>{part}</span>
                    ) : null;
                  })}
                </h3>

                {/* ENHANCED META INFO SECTION */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    📅 {new Date(post.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>

                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    post.published
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  }`}>
                    {post.published ? '✅ Published' : '📝 Draft'}
                  </span>

                  {post.tags && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs border border-blue-500/30">
                      🏷️ {post.tags}
                    </span>
                  )}

                  <span className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs border border-purple-500/30">
                    🗄️ {currentEnv.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* ENHANCED ACTION BUTTONS */}
              <div className="flex flex-wrap gap-2 lg:ml-4">
                {!isCurrentlyViewingProd() && post.published && (
                  <button
                    onClick={() => promoteToProduction(post)}
                    className="px-3 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg text-sm text-green-200 transition-all duration-300 whitespace-nowrap font-medium hover:scale-105"
                    title="Promote to production"
                  >
                    🚀 To Prod
                  </button>
                )}
                <button
                  onClick={() => duplicatePost(post)}
                  className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-sm text-purple-200 transition-all duration-300 font-medium hover:scale-105"
                  title="Duplicate post"
                >
                  📄 Copy
                </button>
                <button
                  onClick={() => onEditPost(post)}
                  className="px-3 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/30 rounded-lg text-sm text-yellow-200 transition-all duration-300 font-medium hover:scale-105"
                  title="Edit post"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => window.open(`${environments[currentEnv].url}/blog/${post.slug}`, '_blank')}
                  className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-sm text-blue-200 transition-all duration-300 font-medium hover:scale-105"
                  title="View post"
                >
                  👁️ View
                </button>
                <button
                  onClick={() => deletePost(post.id, post.title)}
                  className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg text-sm text-red-200 transition-all duration-300 font-medium hover:scale-105"
                  title="Delete post"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={loadExistingPosts}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm text-gray-300 transition-all duration-300 font-medium hover:scale-105"
        >
          🔄 Refresh Posts
        </button>
      </div>
    </div>
  );
}