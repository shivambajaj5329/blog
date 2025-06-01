// components/Newsletter.tsx - Store subscribers in Supabase
"use client";

import { useState } from "react";
import { blogSupabase } from "@/lib/supabase";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      // Check if email already exists
      const { data: existingSubscriber, error: checkError } = await blogSupabase
        .from("newsletter_subscribers")
        .select("id")
        .eq("email", email.toLowerCase())
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(checkError.message);
      }

      if (existingSubscriber) {
        setMessage("📧 You're already subscribed! Thanks for your interest.");
        setEmail("");
        return;
      }

      // Add new subscriber
      const { error: insertError } = await blogSupabase
        .from("newsletter_subscribers")
        .insert({
          email: email.toLowerCase(),
          subscribed_at: new Date().toISOString(),
          is_active: true,
          source: 'website'
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Success
      setMessage("🎉 Thanks for subscribing! You'll get notified about new posts.");
      setEmail("");

      // Optional: Track subscription event
      console.log("New newsletter subscriber:", email);

    } catch (error) {
      console.error("Newsletter subscription error:", error);
      setMessage("❌ Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="text-center my-24 p-16 bg-gradient-to-r from-purple-600/10 to-pink-600/10 backdrop-blur-sm rounded-3xl border border-purple-500/20" id="newsletter">
      <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Stay in the Loop
      </h2>
      <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
        Get notified when I publish new posts. No spam, just quality content delivered to your inbox.
      </p>

      <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row max-w-md mx-auto gap-4 mb-4">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          className="flex-1 px-6 py-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !email}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-semibold text-white hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isLoading ? "Subscribing..." : "Subscribe"}
        </button>
      </form>

      {message && (
        <p className={`text-sm ${message.includes('❌') ? 'text-red-400' : 'text-green-400'}`}>
          {message}
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4">
        ✨ Join {/* TODO: Add subscriber count */} other readers
      </p>
    </section>
  );
}