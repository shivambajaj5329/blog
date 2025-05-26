// Enhanced Admin CMS with Modern Interface and Live Preview

"use client";

import { useState, useEffect } from "react";
import { SessionContextProvider, useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import ReactMarkdown from "react-markdown";

const supabaseClient = createPagesBrowserClient();

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

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [existingPosts, setExistingPosts] = useState<any[]>([]);
  const [showPostsList, setShowPostsList] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !slug) {
      const autoSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(autoSlug);
    }
  }, [title, slug]);

  // Load existing posts
  useEffect(() => {
    if (session) {
      loadExistingPosts();
    }
  }, [session]);

  const loadExistingPosts = async () => {
    const { data } = await supabaseClient
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    setExistingPosts(data || []);
  };

  const showMessage = (text: string, type: "success" | "error" | "info") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await authClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/admin`,
      },
    });
    if (error) {
      showMessage("❌ Failed to send login link.", "error");
    } else {
      showMessage("✅ Magic link sent to your email.", "success");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    const reader = new FileReader();
    reader.onload = () => {
      setContent(reader.result as string);
      showMessage("📄 Markdown file loaded successfully!", "success");
    };
    reader.readAsText(uploadedFile);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const img = e.target.files?.[0];
    if (img) {
      setImageFile(img);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(img);

      showMessage("🖼️ Image selected for upload!", "success");
    }
  };

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    setIsPublishing(true);

    try {
      let imageUrl = "";
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${slug}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabaseClient.storage
          .from("post-images")
          .upload(fileName, imageFile);

        if (uploadError) {
          showMessage("❌ Failed to upload image.", "error");
          return;
        }

        const { data: urlData } = supabaseClient.storage
          .from("post-images")
          .getPublicUrl(fileName);

        imageUrl = urlData?.publicUrl || "";
      }

      const postData = {
        title,
        slug,
        tags,
        content,
        image_url: imageUrl || (editingPost?.image_url || ""),
        published: !isDraft,
      };

      let error;
      if (editingPost) {
        // Update existing post
        const result = await supabaseClient
          .from("posts")
          .update(postData)
          .eq("id", editingPost.id);
        error = result.error;
      } else {
        // Create new post
        const result = await supabaseClient
          .from("posts")
          .insert(postData);
        error = result.error;
      }

      if (error) {
        showMessage("❌ Failed to save post.", "error");
      } else {
        showMessage(
          editingPost
            ? (isDraft ? "💾 Draft updated!" : "🚀 Post updated and published!")
            : (isDraft ? "💾 Draft saved!" : "🚀 Post published!"),
          "success"
        );

        // Reset form
        clearForm();

        // Reload posts list
        loadExistingPosts();
      }
    } catch (error) {
      showMessage("❌ An error occurred.", "error");
    } finally {
      setIsPublishing(false);
    }
  };

  const clearForm = () => {
    setTitle("");
    setSlug("");
    setTags("");
    setContent("");
    setFile(null);
    setImageFile(null);
    setImagePreview("");
    setEditingPost(null);
  };

  const handleEditPost = (post: any) => {
    setTitle(post.title);
    setSlug(post.slug);
    setTags(post.tags);
    setContent(post.content);
    setEditingPost(post);
    if (post.image_url) {
      setImagePreview(post.image_url);
    }
    showMessage(`✏️ Now editing: ${post.title}`, "info");
  };

  const handleCancelEdit = () => {
    clearForm();
    showMessage("❌ Edit cancelled", "info");
  };

  const handleSaveDraft = (e: React.FormEvent) => {
    setIsDrafting(true);
    handleSubmit(e, true).finally(() => setIsDrafting(false));
  };

  const handleLogout = async () => {
    await authClient.auth.signOut();
    location.reload();
  };

  const deletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    const { error } = await supabaseClient
      .from("posts")
      .delete()
      .eq("id", id);

    if (error) {
      showMessage("❌ Failed to delete post.", "error");
    } else {
      showMessage("🗑️ Post deleted successfully.", "success");
      loadExistingPosts();
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-2xl">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🔐</div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Admin Portal
              </h1>
              <p className="text-gray-400">Enter your email to access the CMS</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Send Magic Link ✨
              </button>

              {message && (
                <div className={`p-3 rounded-xl text-sm ${
                  messageType === "success" ? "bg-green-500/20 text-green-200 border border-green-500/30" :
                  messageType === "error" ? "bg-red-500/20 text-red-200 border border-red-500/30" :
                  "bg-blue-500/20 text-blue-200 border border-blue-500/30"
                }`}>
                  {message}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            🛠️ Content Management System
          </h1>
          <p className="text-gray-400">Create and manage your blog posts</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowPostsList(!showPostsList)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105"
          >
            📚 Recent Posts
          </button>
          <button
            onClick={() => window.location.href = "/"}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105"
          >
            🏠 View Blog
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-full text-sm font-medium text-red-200 transition-all duration-300 hover:scale-105"
          >
            🚪 Logout
          </button>
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

      {/* Recent Posts Panel */}
      {showPostsList && (
        <div className="mb-8 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-bold mb-4 text-white">Recent Posts</h2>
          {existingPosts.length === 0 ? (
            <p className="text-gray-400">No posts yet.</p>
          ) : (
            <div className="space-y-3">
              {existingPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{post.title}</h3>
                    <p className="text-sm text-gray-400">
                      {new Date(post.created_at).toLocaleDateString()} •
                      <span className={`ml-1 ${post.published ? 'text-green-400' : 'text-yellow-400'}`}>
                        {post.published ? '✅ Published' : '📝 Draft'}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditPost(post)}
                      className="px-3 py-1 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/30 rounded text-sm text-yellow-200 transition-all duration-300"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                      className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded text-sm text-blue-200 transition-all duration-300"
                    >
                      👁️ View
                    </button>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded text-sm text-red-200 transition-all duration-300"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Form */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Editor Panel */}
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
              {editingPost ? '✏️ Edit Post' : '✍️ Write New Post'}
            </h2>

            {editingPost && (
              <div className="mb-4 p-3 bg-yellow-600/20 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-200 text-sm">
                  ✏️ Editing: <strong>{editingPost.title}</strong>
                </p>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="mt-2 text-xs text-yellow-400 hover:text-yellow-300 underline"
                >
                  Cancel editing
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Post Title
                </label>
                <input
                  type="text"
                  placeholder="Enter your blog post title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>

              {/* Slug Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL Slug
                </label>
                <input
                  type="text"
                  placeholder="url-friendly-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Preview: /blog/{slug || 'your-slug'}
                </p>
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  placeholder="tech, programming, tutorial"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Separate multiple tags with commas
                </p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cover Image
                </label>
                {imagePreview ? (
                  <div className="space-y-4 border-2 border-dashed border-white/20 rounded-xl p-6 text-center">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-32 mx-auto rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                      }}
                      className="text-sm text-red-400 hover:text-red-300 transition-colors duration-300"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-white/40 transition-colors duration-300">
                    <div className="text-4xl mb-2">🖼️</div>
                    <p className="text-gray-400 mb-4">Upload cover image</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all duration-300"
                    />
                  </div>
                )}
              </div>

              {/* Markdown File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Import Markdown File (Optional)
                </label>
                <input
                  type="file"
                  accept=".md,.txt"
                  onChange={handleFileUpload}
                  className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all duration-300"
                />
              </div>

              {/* Content Textarea */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Content (Markdown)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-300"
                  >
                    {showPreview ? '✍️ Edit' : '👁️ Preview'}
                  </button>
                </div>
                <textarea
                  placeholder="Write your content in Markdown..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-4 h-96 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Supports full Markdown syntax including headers, links, code blocks, etc.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {editingPost && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 py-3 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-500/30 text-gray-200 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                  >
                    ❌ Cancel Edit
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isDrafting}
                  className="flex-1 py-3 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/30 text-yellow-200 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDrafting ? '💾 Saving...' : editingPost ? '💾 Update Draft' : '💾 Save Draft'}
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isPublishing ? '🚀 Publishing...' : editingPost ? '🚀 Update & Publish' : '🚀 Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
              👁️ Live Preview
            </h2>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10 max-h-96 overflow-y-auto">
              {title || content ? (
                <article className="prose prose-invert max-w-none">
                  {title && (
                    <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                      {title}
                    </h1>
                  )}
                  {tags && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tags.split(",").map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block text-xs px-2 py-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-200 rounded-full border border-blue-500/30"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Cover"
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                  )}
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2 text-white">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-lg font-bold mt-3 mb-2 text-blue-200">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-base font-bold mt-2 mb-1 text-blue-300">{children}</h3>,
                      p: ({ children }) => <p className="text-gray-300 mb-3 leading-relaxed">{children}</p>,
                      code: ({ children, className }) => {
                        const isInline = !className;
                        if (isInline) {
                          return <code className="bg-slate-800 px-1 py-0.5 rounded text-blue-300 text-xs">{children}</code>;
                        }
                        return <code className="block bg-slate-800 p-2 rounded text-xs overflow-x-auto">{children}</code>;
                      },
                    }}
                  >
                    {content || "*Start writing to see preview...*"}
                  </ReactMarkdown>
                </article>
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <div className="text-4xl mb-2">📝</div>
                  <p>Your post preview will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}