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

          <div className="space-y-6">
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
              onClick={handleLogin}
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
          </div>
        </div>
      </div>
    </div>
  );
}