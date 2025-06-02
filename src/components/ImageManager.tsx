// components/ImageManager.tsx
"use client";

import { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

interface ImageManagerProps {
  showImageManager: boolean;
  onImageInsert: (url: string) => void;
  showMessage: (text: string, type: "success" | "error" | "info") => void;
}

export default function ImageManager({ showImageManager, onImageInsert, showMessage }: ImageManagerProps) {
  const supabaseClient = useSupabaseClient();
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadFile, setImageUploadFile] = useState<File | null>(null);
  const [showResizer, setShowResizer] = useState<string | null>(null); // Track which image's resizer is open

  useEffect(() => {
    if (showImageManager) {
      loadUploadedImages();
    }
  }, [showImageManager]);

  const loadUploadedImages = async () => {
    const { data } = await supabaseClient.storage
      .from("blog-images")
      .list("", { limit: 50, sortBy: { column: "created_at", order: "desc" } });

    if (data) {
      const imagesWithUrls = data.map(img => {
        const { data: urlData } = supabaseClient.storage
          .from("blog-images")
          .getPublicUrl(img.name);
        return {
          ...img,
          url: urlData?.publicUrl || ""
        };
      });
      setUploadedImages(imagesWithUrls);
    }
  };

  const handleImageManagerUpload = async () => {
    if (!imageUploadFile) {
      console.log("❌ No file selected");
      return;
    }

    console.log("📁 File details:", {
      name: imageUploadFile.name,
      size: imageUploadFile.size,
      type: imageUploadFile.type
    });

    // Check if file is too large (Supabase free tier has 50MB limit)
    if (imageUploadFile.size > 50 * 1024 * 1024) {
      showMessage("❌ File too large. Maximum size is 50MB.", "error");
      return;
    }

    setIsUploadingImage(true);
    try {
      const fileExt = imageUploadFile.name.split(".").pop();
      const fileName = `blog-${Date.now()}.${fileExt}`;

      console.log("🚀 Attempting upload:", fileName);

      const { data, error: uploadError } = await supabaseClient.storage
        .from("blog-images")
        .upload(fileName, imageUploadFile);

      console.log("📤 Upload result:", { data, error: uploadError });

      if (uploadError) {
        console.error("❌ Upload error details:", uploadError);
        showMessage(`❌ Upload failed: ${uploadError.message}`, "error");
        return;
      }

      console.log("✅ Upload successful!");
      showMessage("✅ Image uploaded successfully!", "success");
      setImageUploadFile(null);
      loadUploadedImages();
    } catch (error) {
      console.error("❌ Catch block error:", error);
      showMessage(`❌ Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`, "error");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const copyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showMessage("📋 Image URL copied to clipboard!", "success");
  };

  const insertImageWithSize = (imageUrl: string, size: string) => {
    let imageMarkdown = "";

    switch (size) {
      case "small":
        imageMarkdown = `<img src="${imageUrl}" alt="" style="width: 300px; max-width: 100%; height: auto; margin: 20px auto; display: block; border-radius: 8px;">`;
        break;
      case "medium":
        imageMarkdown = `<img src="${imageUrl}" alt="" style="width: 500px; max-width: 100%; height: auto; margin: 20px auto; display: block; border-radius: 8px;">`;
        break;
      case "large":
        imageMarkdown = `<img src="${imageUrl}" alt="" style="width: 700px; max-width: 100%; height: auto; margin: 20px auto; display: block; border-radius: 8px;">`;
        break;
      case "full":
        imageMarkdown = `![](${imageUrl})`;
        break;
      default:
        imageMarkdown = `![](${imageUrl})`;
    }

    onImageInsert(imageMarkdown);
    setShowResizer(null);
    showMessage(`📷 ${size} image inserted!`, "success");
  };

  const deleteImage = async (imageName: string) => {
    if (!confirm("Delete this image?")) return;

    const { error } = await supabaseClient.storage
      .from("blog-images")
      .remove([imageName]);

    if (error) {
      showMessage("❌ Failed to delete image.", "error");
    } else {
      showMessage("🗑️ Image deleted successfully.", "success");
      loadUploadedImages();
    }
  };

  if (!showImageManager) return null;

  return (
    <div className="mb-8 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <h2 className="text-xl font-bold mb-4 text-white">🖼️ Image Manager</h2>

      {/* Upload Section */}
      <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
        <h3 className="text-lg font-medium text-white mb-3">Upload New Image</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageUploadFile(e.target.files?.[0] || null)}
              className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all duration-300"
            />
          </div>
          <button
            onClick={handleImageManagerUpload}
            disabled={!imageUploadFile || isUploadingImage}
            className="px-6 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-xl text-blue-200 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploadingImage ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {uploadedImages.map((image, index) => (
          <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
            <img
              src={image.url}
              alt={image.name}
              className="w-full h-24 object-cover rounded mb-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => window.open(image.url, '_blank')}
            />
            <p className="text-xs text-gray-400 mb-2 truncate" title={image.name}>
              {image.name}
            </p>

            {/* Size Selector */}
            {showResizer === image.name && (
              <div className="mb-2 p-2 bg-white/10 rounded border border-white/20">
                <p className="text-xs text-white mb-2 font-medium">Choose size:</p>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => insertImageWithSize(image.url, "small")}
                    className="px-2 py-1 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded text-xs text-green-200 transition-all duration-300"
                  >
                    Small
                  </button>
                  <button
                    onClick={() => insertImageWithSize(image.url, "medium")}
                    className="px-2 py-1 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded text-xs text-green-200 transition-all duration-300"
                  >
                    Medium
                  </button>
                  <button
                    onClick={() => insertImageWithSize(image.url, "large")}
                    className="px-2 py-1 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded text-xs text-green-200 transition-all duration-300"
                  >
                    Large
                  </button>
                  <button
                    onClick={() => insertImageWithSize(image.url, "full")}
                    className="px-2 py-1 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded text-xs text-green-200 transition-all duration-300"
                  >
                    Full
                  </button>
                </div>
                <button
                  onClick={() => setShowResizer(null)}
                  className="w-full mt-1 px-2 py-1 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-500/30 rounded text-xs text-gray-300 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="flex gap-1">
              <button
                onClick={() => copyImageUrl(image.url)}
                className="flex-1 px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded text-xs text-blue-200 transition-all duration-300"
                title="Copy URL"
              >
                📋
              </button>
              <button
                onClick={() => setShowResizer(showResizer === image.name ? null : image.name)}
                className="flex-1 px-2 py-1 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded text-xs text-green-200 transition-all duration-300"
                title="Insert with size options"
              >
                📐
              </button>
              <button
                onClick={() => deleteImage(image.name)}
                className="flex-1 px-2 py-1 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded text-xs text-red-200 transition-all duration-300"
                title="Delete image"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {uploadedImages.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          <div className="text-4xl mb-2">📷</div>
          <p>No images uploaded yet</p>
        </div>
      )}
    </div>
  );
}