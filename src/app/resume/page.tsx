// Enhanced resume page with conditional opportunity badge
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Jobs from '@/components/Jobs'; // Import the new Jobs component
import Contact from '@/components/Contact'; // Import the new Contact component
import Newsletter from '@/components/Newsletter';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ResumePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [jobsLoaded, setJobsLoaded] = useState(false);
  const [showOpportunityBadge, setShowOpportunityBadge] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Set loaded state immediately
    setIsLoaded(true);

    // Fetch opportunity status and load animations
    const initializePage = async () => {
      await fetchOpportunityStatus();

      // Small delay to ensure DOM is ready
      setTimeout(() => {
        loadAnimations();
      }, 100);
    };

    initializePage();

    // Set up real-time subscription for opportunity status changes
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
        (payload) => {
          console.log('Opportunity status changed:', payload);
          // Re-fetch the status when it changes
          fetchOpportunityStatus();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch opportunity status from database
  const fetchOpportunityStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'open_to_opportunities')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching opportunity status:', error);
        return;
      }

      // If no record exists, default to false
      const status = data?.value === 'true' || false;
      const previousStatus = showOpportunityBadge;
      setShowOpportunityBadge(status);

      // If status changed and page is already loaded, trigger animations
      if (isLoaded && previousStatus !== status) {
        setTimeout(() => {
          loadAnimations();
        }, 100);
      }
    } catch (error) {
      console.error('Error fetching opportunity status:', error);
      // Default to false on error
      setShowOpportunityBadge(false);
    }
  };

  // Update loadAnimations to wait for jobs to load
  const loadAnimations = async () => {
    try {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");

      gsap.registerPlugin(ScrollTrigger);

      // Wait for elements to be in DOM and jobs to load
      await new Promise(resolve => setTimeout(resolve, 200));

      // Hero animation on load - conditional badge animation
      const timeline = gsap.timeline();

      if (showOpportunityBadge) {
        timeline.from('.hero-badge', { opacity: 0, y: 20, duration: 0.6 });
      }

      timeline
        .from('.hero h1', { opacity: 0, y: 30, duration: 0.8 }, showOpportunityBadge ? '-=0.3' : '0')
        .from('.hero p', { opacity: 0, y: 20, duration: 0.6 }, '-=0.5')
        .from('.about-me', { opacity: 0, y: 30, duration: 0.8 }, '-=0.4')
        .from('.hero-buttons', { opacity: 0, y: 20, duration: 0.6 }, '-=0.3');

      // Only animate timeline items after jobs are loaded
      if (jobsLoaded) {
        animateTimelineItems(gsap);
      }

      // Animate skill bars
      ScrollTrigger.batch('.skill-progress', {
        onEnter: (elements: Element[]) => {
          elements.forEach(el => {
            const width = (el as HTMLElement).dataset.width;
            gsap.to(el, {
              width: width + '%',
              duration: 1.5,
              ease: 'power2.out'
            });
          });
        },
        start: 'top 80%'
      });

      // Animate fade-in elements
      gsap.fromTo('.fade-in', {
        opacity: 0,
        y: 30
      }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: {
          trigger: '.skills-grid',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      });

    } catch (error) {
      console.log('GSAP not loaded, animations disabled');
    }
  };

  // Separate function to animate timeline items
  const animateTimelineItems = async (gsap: any) => {
    // Small delay to ensure timeline items are rendered
    await new Promise(resolve => setTimeout(resolve, 100));

    // Animate timeline items
    gsap.fromTo('.timeline-item', {
      opacity: 0,
      y: 50
    }, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: '.timeline',
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      }
    });
  };

  // Handle when jobs finish loading
  const handleJobsLoaded = async () => {
    setJobsLoaded(true);

    // If GSAP is already loaded, animate the timeline items
    if (isLoaded) {
      try {
        const { gsap } = await import("gsap");
        animateTimelineItems(gsap);
      } catch (error) {
        console.log('GSAP not available for timeline animation');
      }
    }
  };

  // Smart contact navigation - scroll to contact section
  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Smooth scrolling for anchor links (unchanged)
  useEffect(() => {
    const handleAnchorClick = (e: Event) => {
      e.preventDefault();
      const target = e.target as HTMLAnchorElement;
      const href = target.getAttribute('href');
      if (href?.startsWith('#')) {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    };

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', handleAnchorClick);
    });

    return () => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.removeEventListener('click', handleAnchorClick);
      });
    };
  }, [isLoaded]);

  // Show loading state briefly (unchanged)
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Sleek Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <Header />
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Enhanced Hero Section */}
        <section className="hero text-center pt-32 pb-8 mb-8">
          {/* Conditional Opportunity Badge */}
          {showOpportunityBadge && (
            <div className="inline-flex items-center gap-3 mb-8 px-6 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hero-badge">
              <div className="relative">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping absolute"></div>
                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
              </div>
              <span className="text-emerald-300 font-medium">Open to opportunities</span>
            </div>
          )}

          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Shivam
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Bajaj
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Applied Data Science Backend Engineer & Tech Enthusiast passionate about building innovative solutions that make a difference
          </p>

          {/* Enhanced About Me Section */}
          <div className="about-me max-w-4xl mx-auto mb-12">
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
          <div className="flex flex-wrap items-center justify-center gap-6 mb-12 hero-buttons">
            <button
              onClick={handleContactClick}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-white hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center gap-2">
                <span>💬</span>
                Let's Connect
              </span>
            </button>
            <a href="/resume.pdf" className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105" target="_blank">
              <span className="flex items-center gap-2">
                <span>📄</span>
                Download Resume
              </span>
            </a>
            <Link href="/" className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <span className="flex items-center gap-2">
                <span>📝</span>
                View Blog
              </span>
            </Link>
          </div>
        </section>

        {/* Updated Timeline Section - Now Dynamic */}
        <section className="my-24">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Professional Journey
          </h2>

          {/* Replace the hardcoded timeline with the dynamic Jobs component */}
          <Jobs onLoadComplete={handleJobsLoaded} />
        </section>

        {/* Skills Section - unchanged */}
        <section className="my-24">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Technical Arsenal
          </h2>

          <div className="skills-grid grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Frontend Skills */}
            <div className="fade-in bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300">
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
                    <div className="skill-progress h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" data-width="95" style={{width: '0%'}}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Databases - Kafka, Redis, SQL, Neptune</span>
                    <span className="text-purple-400">90%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="skill-progress h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" data-width="90" style={{width: '0%'}}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">CICD -Serverless, Jenkins, Terraform</span>
                    <span className="text-purple-400">92%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="skill-progress h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" data-width="92" style={{width: '0%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Backend Skills */}
            <div className="fade-in bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300">
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
                    <div className="skill-progress h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" data-width="88" style={{width: '0%'}}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">SQL(Postgres, Oracle, Athena, Trino, Gremlin)</span>
                    <span className="text-purple-400">95%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="skill-progress h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" data-width="82" style={{width: '0%'}}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">JAVA Spring</span>
                    <span className="text-purple-400">73%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="skill-progress h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" data-width="78" style={{width: '0%'}}></div>
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