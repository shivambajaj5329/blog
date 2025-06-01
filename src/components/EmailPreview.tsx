// components/EmailPreview.tsx - Preview the newsletter email
"use client";

import { useState, useEffect } from "react";
import { generateNewsletterTemplate } from "@/lib/email-template";

interface EmailPreviewProps {
  post: any;
  onClose: () => void;
}

export default function EmailPreview({ post, onClose }: EmailPreviewProps) {
  const [viewMode, setViewMode] = useState<"html" | "text">("html");
  const [isLoading, setIsLoading] = useState(true);
  const [emailContent, setEmailContent] = useState({ html: "", text: "" });

  const SITE_URL = process.env.NODE_ENV === 'production'
    ? 'https://shivambajaj.com'
    : 'http://localhost:3000';

  useEffect(() => {
    // Generate email content when component mounts
    console.log("🎬 EmailPreview useEffect triggered");
    console.log("🎬 EmailPreview - post prop:", post);
    console.log("🎬 EmailPreview - post type:", typeof post);

    if (!post) {
      console.error("🎬 EmailPreview - No post provided!");
      setIsLoading(false);
      return;
    }

    console.log("🎬 EmailPreview - post keys:", Object.keys(post));
    console.log("🎬 EmailPreview - post.slug:", post.slug);

    try {
      const postUrl = `${SITE_URL}/blog/${post.slug}`;
      const unsubscribeUrl = `${SITE_URL}/unsubscribe`;

      console.log("🎬 EmailPreview - About to call generateNewsletterTemplate");
      console.log("🎬 EmailPreview - postUrl:", postUrl);
      console.log("🎬 EmailPreview - Final post object being passed:", post);

      const { html, text } = generateNewsletterTemplate({
        post,
        postUrl,
        unsubscribeUrl,
        siteUrl: SITE_URL,
        subscriberEmail: "preview@example.com"
      });

      console.log("🎬 EmailPreview - Template generated successfully");
      setEmailContent({ html, text });
      setIsLoading(false);
    } catch (error) {
      console.error("🎬 EmailPreview - Error generating email template:", error);
      console.error("🎬 EmailPreview - Error details:", {
        message: error.message,
        stack: error.stack,
        post: post,
        postType: typeof post
      });
      setIsLoading(false);
    }
  }, [post, SITE_URL]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-white/20 max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-800/50">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              📧 Email Preview
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Preview how "{post?.title || 'Unknown Post'}" will look to subscribers
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View mode toggle */}
            <div className="flex bg-slate-800/50 rounded-lg p-1 border border-white/10">
              <button
                onClick={() => setViewMode("html")}
                className={`px-4 py-2 rounded text-sm font-medium transition-all duration-300 ${
                  viewMode === "html"
                    ? "bg-purple-600 text-white shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                📱 Visual
              </button>
              <button
                onClick={() => setViewMode("text")}
                className={`px-4 py-2 rounded text-sm font-medium transition-all duration-300 ${
                  viewMode === "text"
                    ? "bg-purple-600 text-white shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                📝 Plain Text
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-300 text-gray-400 hover:text-white"
              title="Close (ESC)"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-auto max-h-[calc(95vh-140px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                <span className="text-gray-300">Generating preview...</span>
              </div>
            </div>
          ) : viewMode === "html" ? (
            <div className="p-6">
              {/* Email details */}
              <div className="mb-6 space-y-3">
                <div className="flex items-start gap-3 p-4 bg-slate-800/30 rounded-lg border border-white/10">
                  <span className="text-gray-400 text-sm font-medium w-20 flex-shrink-0">Subject:</span>
                  <span className="text-white text-sm">📧 Shivam's Newsletter: {post?.title || 'Unknown'}</span>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-800/30 rounded-lg border border-white/10">
                  <span className="text-gray-400 text-sm font-medium w-20 flex-shrink-0">From:</span>
                  <span className="text-white text-sm">Shivam's Newsletter &lt;newsletter@shivambajaj.com&gt;</span>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-800/30 rounded-lg border border-white/10">
                  <span className="text-gray-400 text-sm font-medium w-20 flex-shrink-0">To:</span>
                  <span className="text-white text-sm">Your newsletter subscribers</span>
                </div>
              </div>

              {/* Email preview */}
              <div className="bg-white rounded-xl overflow-hidden shadow-2xl border-4 border-gray-200">
                {emailContent.html ? (
                  <iframe
                    srcDoc={emailContent.html}
                    className="w-full h-[700px] border-0"
                    title="Email Preview"
                    sandbox="allow-same-origin allow-popups"
                    style={{
                      minHeight: '700px',
                      background: 'white'
                    }}
                    onLoad={() => console.log('Email preview loaded')}
                    onError={() => console.error('Email preview failed to load')}
                  />
                ) : (
                  <div className="flex items-center justify-center h-[700px] bg-gray-100">
                    <div className="text-center">
                      <div className="text-4xl mb-4">❌</div>
                      <p className="text-gray-600">Failed to generate email preview</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Debug info */}
              <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-white/10">
                <p className="text-xs text-gray-400">
                  💡 This preview shows how your email will appear in most email clients
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="bg-slate-800 rounded-xl p-6 border border-white/10">
                <div className="mb-4 pb-4 border-b border-gray-600">
                  <div className="text-gray-400 mb-2 text-sm">
                    <strong>Subject:</strong> 📧 Shivam's Newsletter: {post?.title || 'Unknown'}
                  </div>
                  <div className="text-gray-400 text-sm">
                    <strong>From:</strong> Shivam's Newsletter &lt;newsletter@shivambajaj.com&gt;
                  </div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                  <pre className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm font-mono overflow-x-auto">
                    {emailContent.text || "Failed to generate text version"}
                  </pre>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-white/10">
                <p className="text-xs text-gray-400">
                  📝 This is the plain text version for email clients that don't support HTML
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-slate-800/30">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              ✨ Preview generated successfully
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Copy email HTML to clipboard
                  navigator.clipboard.writeText(emailContent.html);
                  alert('Email HTML copied to clipboard!');
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm font-medium transition-all duration-300"
              >
                📋 Copy HTML
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-all duration-300"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}