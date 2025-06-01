// components/Newsletter.tsx - Updated to match Contact component styling
"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      // TODO: Implement your subscription logic here
      // This could be:
      // - Supabase insert
      // - API call to email service (ConvertKit, Mailchimp, etc.)
      // - Your own API endpoint

      console.log("Subscribing email:", email);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Success
      setMessage("🎉 Thanks for subscribing! Check your email to confirm.");
      setEmail("");

    } catch (error) {
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
        Get the latest insights delivered straight to your inbox. No spam, just pure value.
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
    </section>
  );
}