// components/EmailPreview.tsx - Preview the newsletter email
"use client";

import { useState } from "react";
import { generateNewsletterTemplate } from "@/lib/email-template";

interface EmailPreviewProps {
  post: any;
  onClose: () => void;
}

export default function EmailPreview({ post, onClose }: EmailPreviewProps) {
  const [viewMode, setViewMode] = useState<"html" | "text">("html");

  const SITE_URL = process.env.NODE_ENV === 'production'
    ? 'https://shivambajaj.com'
    : 'http://localhost:3000';

  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  const unsubscribeUrl = `${SITE_URL}/unsubscribe`;

  const { html, text } = generateNewsletterTemplate({
    post,
    postUrl,
    unsubscribeUrl,
    siteUrl: SITE_URL,
    subscriberEmail: "preview@example.com"
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">📧 Email Preview</h2>
            <p className="text-sm text-gray-400 mt-1">
              Preview how your newsletter will look to subscribers
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View mode toggle */}
            <div className="flex bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setViewMode("html")}
                className={`px-3 py-1 rounded text-sm font-medium transition-all duration-300 ${
                  viewMode === "html"
                    ? "bg-purple-600 text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                📱 HTML
              </button>
              <button
                onClick={() => setViewMode("text")}
                className={`px-3 py-1 rounded text-sm font-medium transition-all duration-300 ${
                  viewMode === "text"
                    ? "bg-purple-600 text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                📝 Text
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-300"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-auto max-h-[calc(90vh-120px)]">
          {viewMode === "html" ? (
            <div className="p-6">
              <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
                <iframe
                  srcDoc={html}
                  className="w-full h-[600px] border-0"
                  title="Email Preview"
                  sandbox="allow-same-origin"
                />
              </div>

              {/* Email details */}
              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-400 text-sm font-medium w-16">Subject:</span>
                  <span className="text-white text-sm">📝 New Post: {post.title}</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-400 text-sm font-medium w-16">From:</span>
                  <span className="text-white text-sm">Shivam &lt;newsletter@shivambajaj.com&gt;</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-400 text-sm font-medium w-16">To:</span>
                  <span className="text-white text-sm">Your newsletter subscribers</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="bg-gray-900 rounded-lg p-6 font-mono text-sm">
                <div className="mb-4 pb-4 border-b border-gray-700">
                  <div className="text-gray-400 mb-2">Subject: 📝 New Post: {post.title}</div>
                  <div className="text-gray-400">From: Shivam &lt;newsletter@shivambajaj.com&gt;</div>
                </div>
                <pre className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {text}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              💡 This is how your email will appear to subscribers
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-all duration-300"
            >
              Close Preview
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}