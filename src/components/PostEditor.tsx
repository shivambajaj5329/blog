// components/PostEditor.tsx
"use client";

import { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

interface PostEditorProps {
  currentEnv: "dev" | "prod";
  environments: any;
  editingPost: any;
  onPostSaved: () => void;
  onEditCancel: () => void;
  showMessage: (text: string, type: "success" | "error" | "info") => void;
}

export default function PostEditor({
  currentEnv,
  environments,
  editingPost,
  onPostSaved,
  onEditCancel,
  showMessage
}: PostEditorProps) {
  const supabaseClient = useSupabaseClient();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);

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

  // Load post data when editing
  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title);
      setSlug(editingPost.slug);
      setTags(editingPost.tags);
      setContent(editingPost.content);
      if (editingPost.image_url) {
        setImagePreview(editingPost.image_url);
      }
    } else {
      clearForm();
    }
  }, [editingPost]);

  const clearForm = () => {
    setTitle("");
    setSlug("");
    setTags("");
    setContent("");
    setImageFile(null);
    setImagePreview("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

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
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(img);
      showMessage("🖼️ Image selected for upload!", "success");
    }
  };

  const handleSubmit = async (isDraft = false) => {
    if (!title || !content) {
      showMessage("❌ Title and content are required.", "error");
      return;
    }

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
        environment: currentEnv,
      };

      let error;
      if (editingPost) {
        const result = await supabaseClient
          .from("posts")
          .update(postData)
          .eq("id", editingPost.id);
        error = result.error;
      } else {
        const result = await supabaseClient
          .from("posts")
          .insert(postData);
        error = result.error;
      }

      if (error) {
        showMessage("❌ Failed to save post.", "error");
      } else {
        const envName = environments[currentEnv].name;
        showMessage(
          editingPost
            ? (isDraft ? `💾 Draft updated in ${envName}!` : `🚀 Post updated and published to ${envName}!`)
            : (isDraft ? `💾 Draft saved to ${envName}!` : `🚀 Post published to ${envName}!`),
          "success"
        );

        clearForm();
        onPostSaved();
      }
    } catch (error) {
      showMessage("❌ An error occurred.", "error");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = () => {
    setIsDrafting(true);
    handleSubmit(true).finally(() => setIsDrafting(false));
  };

  const handleCancel = () => {
    clearForm();
    onEditCancel();
  };

  return (
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
            onClick={handleCancel}
            className="mt-2 text-xs text-yellow-400 hover:text-yellow-300 underline"
          >
            Cancel editing
          </button>
        </div>
      )}

      <div className="space-y-6">
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
            Preview: {environments[currentEnv].url}/blog/{slug || 'your-slug'}
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

        {/* Cover Image Upload */}
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Content (Markdown)
          </label>
          <textarea
            placeholder="Write your content in Markdown... Tables are now supported!"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 h-96 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            Supports full Markdown with tables, code blocks, and GitHub Flavored Markdown
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {editingPost && (
            <button
              type="button"
              onClick={handleCancel}
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
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isPublishing}
            className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isPublishing ? '🚀 Publishing...' : editingPost ? `🚀 Update & Publish to ${environments[currentEnv].name}` : `🚀 Publish to ${environments[currentEnv].name}`}
          </button>
        </div>
      </div>
    </div>
  );
}