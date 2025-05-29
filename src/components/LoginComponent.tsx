// components/LoginComponent.tsx
"use client";

import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function LoginComponent() {
  const authClient = useSupabaseClient();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");

  const showMessage = (text: string, type: "success" | "error" | "info") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Fix redirect URL - use your actual domain
    const getRedirectUrl = () => {
      // Check if we're in production
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        // If localhost or development, use localhost
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          return `${window.location.origin}/admin`;
        }

        // For production, use your actual domain
        return 'https://shivambajaj.com/admin';
      }

      // Fallback
      return 'https://shivambajaj.com/admin';
    };

    const { error } = await authClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getRedirectUrl(),
      },
    });

    if (error) {
      console.error('Login error:', error);
      showMessage("❌ Failed to send login link.", "error");
    } else {
      showMessage("✅ Magic link sent to your email.", "success");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Admin Portal
              </span>
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
                className="w-full p-3 bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 focus:bg-black/70"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  color: 'white !important',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                }}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!email.trim()}
            >
              Send Magic Link ✨
            </button>

            {message && (
              <div className={`p-3 rounded-xl text-sm transition-all duration-300 ${
                messageType === "success" ? "bg-green-500/20 text-green-200 border border-green-500/30" :
                messageType === "error" ? "bg-red-500/20 text-red-200 border border-red-500/30" :
                "bg-blue-500/20 text-blue-200 border border-blue-500/30"
              }`}>
                {message}
              </div>
            )}

            <div className="text-center text-xs text-gray-500 mt-4">
              <p>🔒 Secure login via email verification</p>
              <p className="mt-1">Check your inbox and click the magic link</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}