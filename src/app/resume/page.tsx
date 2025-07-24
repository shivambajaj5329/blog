// Enhanced resume page with smooth GSAP animations
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Jobs from '@/components/Jobs';
import Contact from '@/components/Contact';
import Newsletter from '@/components/Newsletter';
import { blogSupabase as supabase } from "@/lib/supabase";

export default function ResumePage() {
  const [showOpportunityBadge, setShowOpportunityBadge] = useState(false);
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
    fetchOpportunityStatus();

    // Set up real-time subscription
    const channel = supabase
      .channel('settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'settings',
          filter: 'key=eq.open_to_opportunities'
        },
        () => {
          fetchOpportunityStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      // Clean up ScrollTrigger
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.getAll().forEach((trigger: any) => trigger.kill());
      }
    };
  }, []);

  // Run animations when page is ready
  useEffect(() => {
    if (pageReady && gsapRef.current) {
      runHeroAnimations();
      setupScrollAnimations();
    }
  }, [pageReady, showOpportunityBadge]);

  const fetchOpportunityStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'open_to_opportunities')
        .single();

      if (!error || error.code === 'PGRST116') {
        setShowOpportunityBadge(data?.value === 'true' || false);
      }
    } catch (error) {
      console.error('Error fetching opportunity status:', error);
    }
  };

  const runHeroAnimations = () => {
    const gsap = gsapRef.current;
    if (!gsap) return;

    // Kill any existing animations
    gsap.killTweensOf(".hero-animate");

    // Create a smooth timeline
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Add elements to timeline with smooth timing
    if (showOpportunityBadge) {
      tl.fromTo('.opportunity-badge',
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6 }
      );
    }

    tl.fromTo('.hero-title-1',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8 },
      showOpportunityBadge ? "-=0.3" : "0"
    )
    .fromTo('.hero-title-2',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.6"
    )
    .fromTo('.hero-subtitle',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 },
      "-=0.4"
    )
    .fromTo('.about-me-card',
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8 },
      "-=0.3"
    )
    .fromTo('.hero-button',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 },
      "-=0.4"
    );
  };

  const setupScrollAnimations = () => {
    const gsap = gsapRef.current;
    const ScrollTrigger = scrollTriggerRef.current;
    if (!gsap || !ScrollTrigger) return;

    // Animate timeline items
    gsap.fromTo('.timeline-item',
      { opacity: 0, x: -50 },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: '.timeline-container',
          start: 'top 80%',
          end: 'bottom 60%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    // Animate skill bars with intersection observer for better performance
    const skillBars = document.querySelectorAll('.skill-bar');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target as HTMLElement;
          const width = bar.dataset.width;
          gsap.to(bar, {
            width: width + '%',
            duration: 1.2,
            ease: 'power2.out',
            delay: 0.1
          });
          observer.unobserve(bar);
        }
      });
    }, { threshold: 0.1 });

    skillBars.forEach(bar => observer.observe(bar));

    // Fade in skill cards
    gsap.fromTo('.skill-card',
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: '.skills-section',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Handle jobs loaded callback
  const handleJobsLoaded = () => {
    // Re-run timeline animations after jobs load
    if (gsapRef.current) {
      setTimeout(() => {
        const gsap = gsapRef.current;
        gsap.fromTo('.timeline-item',
          { opacity: 0, x: -50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: "power2.out"
          }
        );
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <Header />
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Hero Section */}
        <section className="text-center pt-32 pb-8 mb-8">
          {/* Opportunity Badge */}
          {showOpportunityBadge && (
            <div className="hero-animate opportunity-badge inline-flex items-center gap-3 mb-8 px-6 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10" style={{ opacity: 0 }}>
              <div className="relative">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping absolute"></div>
                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
              </div>
              <span className="text-emerald-300 font-medium">Open to opportunities</span>
            </div>
          )}

          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
            <span className="hero-animate hero-title-1 block bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent" style={{ opacity: pageReady ? 0 : 1 }}>
              Shivam
            </span>
            <span className="hero-animate hero-title-2 block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent" style={{ opacity: pageReady ? 0 : 1 }}>
              Bajaj
            </span>
          </h1>

          <p className="hero-animate hero-subtitle text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed" style={{ opacity: pageReady ? 0 : 1 }}>
            Applied Data Science Backend Engineer & Tech Enthusiast passionate about building innovative solutions that make a difference
          </p>

          {/* About Me Section */}
          <div className="hero-animate about-me-card max-w-4xl mx-auto mb-12" style={{ opacity: pageReady ? 0 : 1 }}>
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-purple-500/30 transition-all duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                {/* Background */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">🚀</div>
                    <h3 className="text-xl font-bold text-white">Background</h3>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Software engineer with 5+ years of experience building scalable systems at the intersection of data engineering, machine learning, and cloud infrastructure. I thrive in fast-paced environments where I can solve complex problems and deliver impact.
                  </p>
                </div>

                {/* Expertise */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">⚡</div>
                    <h3 className="text-xl font-bold text-white">Expertise</h3>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Specialized in AWS cloud architecture, Python backend development, and data pipeline orchestration. I've led teams, mentored junior developers, and architected systems that process millions of data points daily with 99.9% uptime.
                  </p>
                </div>

                {/* Passion */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">💡</div>
                    <h3 className="text-xl font-bold text-white">Passion</h3>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    When I'm not coding, you'll find me exploring the latest tech trends, contributing to open-source projects, or writing about my learnings. I believe in building technology that makes people's lives better and more efficient.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
            <button
              onClick={handleContactClick}
              className="hero-animate hero-button group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-white hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
              style={{ opacity: pageReady ? 0 : 1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center gap-2">
                <span>💬</span>
                Let's Connect
              </span>
            </button>
            <a
              href="/resume.pdf"
              className="hero-animate hero-button px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
              target="_blank"
              style={{ opacity: pageReady ? 0 : 1 }}
            >
              <span className="flex items-center gap-2">
                <span>📄</span>
                Download Resume
              </span>
            </a>
            <Link
              href="/"
              className="hero-animate hero-button px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
              style={{ opacity: pageReady ? 0 : 1 }}
            >
              <span className="flex items-center gap-2">
                <span>📝</span>
                View Blog
              </span>
            </Link>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="my-24">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Professional Journey
          </h2>
          <div className="timeline-container">
            <Jobs onLoadComplete={handleJobsLoaded} />
          </div>
        </section>

        {/* Skills Section */}
        <section className="my-24 skills-section">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Technical Arsenal
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Frontend Skills */}
            <div className="skill-card bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300">
              <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                <span>🚀</span> Frameworks
              </h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">AWS (S3, EKS, Lambdas, Sagemaker, Athena, OpenSearch, CloudWatch)</span>
                    <span className="text-purple-400">95%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="skill-bar h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" data-width="95" style={{width: '0%'}}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Databases - Kafka, Redis, SQL, Neptune</span>
                    <span className="text-purple-400">90%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="skill-bar h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" data-width="90" style={{width: '0%'}}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">CICD -Serverless, Jenkins, Terraform</span>
                    <span className="text-purple-400">92%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="skill-bar h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" data-width="92" style={{width: '0%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Backend Skills */}
            <div className="skill-card bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300">
              <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                <span>⚡</span> Backend Development
              </h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Python</span>
                    <span className="text-purple-400">98%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="skill-bar h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" data-width="98" style={{width: '0%'}}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">SQL(Postgres, Oracle, Athena, Trino, Gremlin)</span>
                    <span className="text-purple-400">95%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="skill-bar h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" data-width="95" style={{width: '0%'}}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">JAVA Spring</span>
                    <span className="text-purple-400">73%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="skill-bar h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" data-width="73" style={{width: '0%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter and Contact Sections */}
        <Newsletter/>
        <Contact />

        <Footer />
      </div>
    </div>
  );
}