// Updated home page with Contact component and GSAP animations
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { blogSupabase as supabase } from "@/lib/supabase";
import Newsletter from '@/components/Newsletter';
import Contact from '@/components/Contact';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function BlogHome() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const gsapRef = useRef<any>(null);
  const scrollTriggerRef = useRef<any>(null);

  useEffect(() => {
    // Load GSAP immediately
    const loadGSAP = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");

      gsap.registerPlugin(ScrollTrigger);
      gsapRef.current = gsap;
      scrollTriggerRef.current = ScrollTrigger;

      // Set page ready after GSAP loads
      setPageReady(true);
    };

    loadGSAP();

    return () => {
      // Clean up ScrollTrigger
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.getAll().forEach((trigger: any) => trigger.kill());
      }
    };
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, slug, tags, content, created_at, image_url")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading posts:", error);
      } else {
        setPosts(data || []);
      }
      setLoading(false);
    };

    fetchPosts();

    // Handle scroll effect for header
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Run animations when page is ready and posts are loaded
  useEffect(() => {
    if (pageReady && !loading && gsapRef.current) {
      runHeroAnimations();
      setupScrollAnimations();
    }
  }, [pageReady, loading, posts]);

  const runHeroAnimations = () => {
    const gsap = gsapRef.current;
    if (!gsap) return;

    // Kill any existing animations
    gsap.killTweensOf(".hero-animate");

    // Create a smooth timeline for hero section
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Hero animations sequence
    tl.fromTo('.hero-title-1',
      { opacity: 0, y: 50, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 1 }
    )
    .fromTo('.hero-title-2',
      { opacity: 0, y: 50, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 1 },
      "-=0.7"
    )
    .fromTo('.hero-subtitle',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.5"
    )
    .fromTo('.hero-button',
      { opacity: 0, y: 20, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1 },
      "-=0.4"
    )
    .fromTo('.hero-search',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 },
      "-=0.3"
    );
  };

  const setupScrollAnimations = () => {
    const gsap = gsapRef.current;
    const ScrollTrigger = scrollTriggerRef.current;
    if (!gsap || !ScrollTrigger) return;

    // Animate tags section
    gsap.fromTo('.tag-button',
      { opacity: 0, y: 20, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.05,
        ease: "power2.out",
        scrollTrigger: {
          trigger: '.tags-section',
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    // Animate blog post cards
    gsap.fromTo('.post-card',
      { opacity: 0, y: 50, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: '.posts-grid',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    // Animate newsletter section
    gsap.fromTo('.newsletter-section',
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: '.newsletter-section',
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    // Animate contact section
    gsap.fromTo('.contact-section',
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: '.contact-section',
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  };

  const allTags = [
    "All",
    ...Array.from(new Set(posts.flatMap((p) => p.tags.split(",").map((t: string) => t.trim()))))
  ];

  const filteredPosts = posts.filter(post => {
    const matchesTag = activeTag === "All" || post.tags.split(",").map((t: string) => t.trim()).includes(activeTag);
    const matchesSearch = searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  // Re-run animations when posts change due to filtering
  useEffect(() => {
    if (pageReady && gsapRef.current && !loading) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        const gsap = gsapRef.current;
        gsap.fromTo('.post-card',
          { opacity: 0, y: 20, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.05,
            ease: "power2.out"
          }
        );
      }, 50);
    }
  }, [filteredPosts, activeTag, searchQuery, pageReady, loading]);

    // Smart contact navigation - scroll to contact section if it exists on current page
  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();

    const contactSection = document.getElementById('contact');
    if (contactSection) {
      // Contact section exists on current page, scroll to it
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // No contact section on current page, go to homepage with contact anchor
      window.location.href = '/#contact';
    }
  };


  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
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

      {/* Sticky Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/10'
          : 'bg-transparent'
      }`}>
        <Header />
      </nav>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">

            {/* Main title - Enhanced with animations */}
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
              <span
                className="hero-animate hero-title-1 block bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
                style={{ opacity: pageReady ? 0 : 1 }}
              >
                Hey, I'm
              </span>
              <span
                className="hero-animate hero-title-2 block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"
                style={{ opacity: pageReady ? 0 : 1 }}
              >
                Shivam
              </span>
            </h1>

            <p
              className="hero-animate hero-subtitle text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
              style={{ opacity: pageReady ? 0 : 1 }}
            >
              i churn bad ideas hoping one sticks
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/resume"
                className="hero-animate hero-button group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-white hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
                style={{ opacity: pageReady ? 0 : 1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative flex items-center gap-2">
                  <span>💼</span>
                  View Resume
                </span>
              </Link>


           <button
              onClick={handleContactClick}
              className="hero-animate hero-button px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
              style={{ opacity: pageReady ? 0 : 1 }}
            >
               <span className="flex items-center gap-2">
                  <span>🚀</span>
              Let's Connect
                </span>
            </button>
            </div>

            {/* Search Bar */}
            <div
              className="hero-animate hero-search max-w-md mx-auto relative"
              style={{ opacity: pageReady ? 0 : 1 }}
            >
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>
        </section>

        {/* Tags Section */}
        <section className="tags-section pb-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap justify-center gap-3">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`tag-button px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    activeTag === tag
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 scale-105"
                      : "bg-white/5 backdrop-blur-sm border border-white/20 text-gray-300 hover:bg-white/10 hover:scale-105"
                  }`}
                  style={{ opacity: 0 }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="posts-grid pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full animate-spin"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
                </div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-8xl mb-6">🕳️</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-300">Nothing here yet</h3>
                <p className="text-gray-400">No posts match your search or filter.</p>
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-8">
                {filteredPosts.map((post, index) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="post-card group block flex-shrink-0"
                    style={{
                      width: 'calc(33.333% - 1.33rem)',
                      minWidth: '320px',
                      maxWidth: '400px',
                      opacity: 0
                    }}
                  >
                    {/* ENHANCED CARD WITH DYNAMIC HEIGHT */}
                    <article className="min-h-[600px] bg-white/5 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col">
                      {/* Image with overlay - Fixed height */}
                      <div className="relative h-64 flex-shrink-0 overflow-hidden">
                        {post.image_url ? (
                          <Image
                            src={post.image_url}
                            alt={post.title}
                            width={600}
                            height={300}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                            <div className="text-6xl opacity-50">📝</div>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Date badge */}
                        <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-sm text-white border border-white/20">
                          {new Date(post.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>

                      {/* Content area - Flexible height */}
                      <div className="p-8 flex-1 flex flex-col">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.split(",").slice(0, 3).map((tag: string) => (
                            <span
                              key={tag}
                              className="inline-block text-xs px-3 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-200 rounded-full border border-purple-500/30"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>

                        {/* ENHANCED TITLE - NO MORE FIXED HEIGHT OR OVERFLOW HIDDEN */}
                        <h2 className="text-xl md:text-2xl font-bold mb-4 text-white group-hover:text-purple-200 transition-colors duration-300 leading-tight break-words">
                          {/* HANDLE EMOJIS AND TEXT SEPARATELY FOR BETTER DISPLAY */}
                          {post.title.split(/(\p{Emoji})/gu).map((part: string, index: number) => {
                            // If this part is an emoji, render with larger size
                            if (/\p{Emoji}/gu.test(part)) {
                              return <span key={index} className="text-2xl md:text-3xl">{part}</span>;
                            }
                            // If this part is text, render normally
                            return part ? (
                              <span key={index}>{part}</span>
                            ) : null;
                          })}
                        </h2>

                        {/* Excerpt - Flexible, takes remaining space */}
                        <p className="text-gray-400 leading-relaxed mb-6 flex-1 text-sm">
                          {post.content.replace(/[#*`]/g, '').slice(0, 120)}...
                        </p>

                        {/* Read more - Fixed at bottom */}
                        <div className="flex items-center text-purple-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                          <span>Read article</span>
                          <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter and Contact Sections with consistent sizing */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="newsletter-section" style={{ opacity: 0 }}>
            <Newsletter />
          </div>
          <div className="contact-section" style={{ opacity: 0 }}>
            <Contact />
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}