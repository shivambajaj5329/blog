"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm'; // 👈 ADD THIS IMPORT
import Newsletter from '@/components/Newsletter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) {
        console.error("Error fetching post:", error);
      } else {
        setPost(data);

        // Fetch related posts with same tags
        if (data?.tags) {
          const { data: related } = await supabase
            .from("posts")
            .select("id, title, slug, tags, created_at, image_url")
            .neq("id", data.id)
            .eq("published", true)
            .limit(3);

          setRelatedPosts(related || []);
        }
      }
      setLoading(false);
    };

    if (slug) fetchPost();

    // Handle scroll effect for header
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [slug]);

  // SCROLL TO NEWSLETTER FUNCTION
  const scrollToNewsletter = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("Subscribe button clicked - trying to scroll to newsletter");

    const newsletterSection = document.getElementById('newsletter');
    if (newsletterSection) {
      console.log("Newsletter section found, scrolling...");
      newsletterSection.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    } else {
      console.log("Newsletter section NOT found!");
    }
  };

  // ENHANCED CUSTOM MARKDOWN COMPONENTS WITH PROPER TABLE SUPPORT
  const customComponents = {
    h1: ({ children }: any) => (
      <h1 className="text-3xl font-bold mt-8 mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-2xl font-bold mt-6 mb-3 text-white">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xl font-bold mt-4 mb-2 text-purple-200">
        {children}
      </h3>
    ),
    p: ({ children }: any) => (
      <p className="text-gray-300 leading-relaxed mb-4">
        {children}
      </p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-purple-500 pl-4 my-4 bg-purple-500/10 py-2 rounded-r-lg">
        {children}
      </blockquote>
    ),
    code: ({ children, className }: any) => {
      const isInline = !className;
      if (isInline) {
        return (
          <code className="bg-slate-800 px-2 py-1 rounded text-purple-300 text-sm">
            {children}
          </code>
        );
      }
      return (
        <code className="block bg-slate-800 p-4 rounded-lg overflow-x-auto border border-white/10">
          {children}
        </code>
      );
    },
    ul: ({ children }: any) => (
      <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside space-y-2 text-gray-300 mb-4">
        {children}
      </ol>
    ),
    a: ({ href, children }: any) => (
      <a
        href={href}
        className="text-purple-400 hover:text-purple-300 underline transition-colors duration-300"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    // 🚀 ENHANCED TABLE COMPONENTS WITH BETTER STYLING
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-8 rounded-xl border border-white/20">
        <table className="w-full border-collapse bg-slate-900/80 backdrop-blur-sm">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-gradient-to-r from-purple-600/30 to-pink-600/30">
        {children}
      </thead>
    ),
    tbody: ({ children }: any) => (
      <tbody className="divide-y divide-white/10">
        {children}
      </tbody>
    ),
    tr: ({ children }: any) => (
      <tr className="hover:bg-white/5 transition-colors duration-200">
        {children}
      </tr>
    ),
    th: ({ children }: any) => (
      <th className="px-4 py-4 text-left font-semibold text-white border-b border-white/30">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="px-4 py-4 text-gray-300 border-b border-white/5">
        {children}
      </td>
    ),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <p className="text-gray-400 mb-8">The blog post you're looking for doesn't exist.</p>
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105"
          >
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated Background - Same as homepage */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>

        {/* Moving gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
      </div>

      {/* FIXED Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/10'
          : 'bg-transparent'
      }`}>
        <Header />
      </nav>

      <main className="relative z-10 pt-24">
        {/* Article Content */}
        <article className="max-w-4xl mx-auto px-6 py-12">
          {/* Article Header */}
          <header className="mb-12">
            {/* Back to Blog Link */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300 group mb-8"
            >
              <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back to Blog</span>
            </Link>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.split(",").map((tag: string) => (
                <span
                  key={tag}
                  className="inline-block text-sm px-3 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-200 rounded-full border border-purple-500/30"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>

            {/* Title - Fixed emoji rendering with TypeScript types */}
             <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  {post.title.split(/(\p{Emoji})/gu).map((part: string, index: number) => {
                    // If this part is an emoji, render normally
                    if (/\p{Emoji}/gu.test(part)) {
                      return <span key={index}>{part}</span>;
                    }
                    // If this part is text, apply gradient
                    return part ? (
                      <span key={index} className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                        {part}
                      </span>
                    ) : null;
                  })}
                </h1>
            {/* Meta Info */}
            <div className="flex items-center gap-4 text-gray-400 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-sm font-bold">
                  S
                </div>
                <span className="font-medium">Shivam</span>
              </div>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <time className="text-sm">
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span className="text-sm">
                {Math.ceil(post.content.split(' ').length / 200)} min read
              </span>
            </div>

            {/* Featured Image */}
            {post.image_url && (
              <div className="mb-12 rounded-2xl overflow-hidden border border-white/10">
                <Image
                  src={post.image_url}
                  alt={post.title}
                  width={1200}
                  height={600}
                  className="w-full h-64 md:h-96 object-cover"
                />
              </div>
            )}
          </header>

          {/* Article Body - 👈 UPDATED WITH GFM PLUGIN */}
          <div className="prose prose-lg prose-invert max-w-none">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <ReactMarkdown
                components={customComponents}
                remarkPlugins={[remarkGfm]} // 👈 ADD THIS LINE
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Article Footer */}
          <footer className="mt-12 pt-8 border-t border-white/10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-lg font-bold">
                  S
                </div>
                <div>
                  <p className="font-medium text-white">Written by Shivam</p>
                  <p className="text-sm text-gray-400">Software Developer & Tech Enthusiast</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20">
                  👍 Like
                </button>
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20">
                  💬 Comment
                </button>
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20">
                  📤 Share
                </button>
              </div>
            </div>
          </footer>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="max-w-4xl mx-auto px-6 py-12 border-t border-white/10">
            <h2 className="text-2xl font-bold mb-8 text-center text-white">Related Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group block"
                >
                  <article className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
                    {relatedPost.image_url && (
                      <Image
                        src={relatedPost.image_url}
                        alt={relatedPost.title}
                        width={400}
                        height={200}
                        className="w-full h-32 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-white group-hover:text-purple-200 transition-colors duration-300 mb-2 line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {new Date(relatedPost.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}

        <Newsletter />
        <Footer />
      </main>
    </div>
  );
}