// Updated sections of your resume page
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Jobs from '@/components/Jobs'; // Import the new Jobs component

export default function ResumePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [jobsLoaded, setJobsLoaded] = useState(false);

  useEffect(() => {
    // Set loaded state immediately
    setIsLoaded(true);

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      loadAnimations();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Update loadAnimations to wait for jobs to load
  const loadAnimations = async () => {
    try {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");

      gsap.registerPlugin(ScrollTrigger);

      // Wait for elements to be in DOM and jobs to load
      await new Promise(resolve => setTimeout(resolve, 200));

      // Hero animation on load
      gsap.timeline()
        .from('.hero-badge', { opacity: 0, y: 20, duration: 0.6 })
        .from('.hero h1', { opacity: 0, y: 30, duration: 0.8 }, '-=0.3')
        .from('.hero p', { opacity: 0, y: 20, duration: 0.6 }, '-=0.5')
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
        {/* Hero Section - unchanged */}
        <section className="hero text-center pt-32 pb-16 mb-16">
          <div className="inline-flex items-center gap-3 mb-8 px-6 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hero-badge">
            <div className="relative">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping absolute"></div>
              <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
            </div>
            <span className="text-emerald-300 font-medium">Open to opportunities</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Shivam
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Bajaj
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Full-Stack Developer & Tech Enthusiast passionate about building innovative solutions that make a difference
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 mb-12 hero-buttons">
            <a href="#contact" className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-white hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center gap-2">
                <span>💬</span>
                Let's Connect
              </span>
            </a>
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
                <span>🚀</span> Frontend Development
              </h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">React/Next.js</span>
                    <span className="text-purple-400">95%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="skill-progress h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" data-width="95" style={{width: '0%'}}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">TypeScript</span>
                    <span className="text-purple-400">90%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="skill-progress h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" data-width="90" style={{width: '0%'}}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Tailwind CSS</span>
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
                    <span className="text-gray-300">Node.js</span>
                    <span className="text-purple-400">88%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="skill-progress h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" data-width="88" style={{width: '0%'}}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Python</span>
                    <span className="text-purple-400">82%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="skill-progress h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" data-width="82" style={{width: '0%'}}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">PostgreSQL</span>
                    <span className="text-purple-400">78%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="skill-progress h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" data-width="78" style={{width: '0%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section - unchanged */}
        <section className="text-center my-24 p-16 bg-gradient-to-r from-purple-600/10 to-pink-600/10 backdrop-blur-sm rounded-3xl border border-purple-500/20" id="contact">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Let's Build Something Amazing
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Ready to bring your ideas to life? Let's connect and create the next big thing together.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 hover:scale-105 transition-all duration-300">
              <div className="text-4xl mb-4">📧</div>
              <h4 className="text-lg font-semibold mb-2 text-white">Email</h4>
              <p className="text-gray-300 text-sm">hello@shivam.dev</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 hover:scale-105 transition-all duration-300">
              <div className="text-4xl mb-4">💼</div>
              <h4 className="text-lg font-semibold mb-2 text-white">LinkedIn</h4>
              <p className="text-gray-300 text-sm">linkedin.com/in/shivam</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 hover:scale-105 transition-all duration-300">
              <div className="text-4xl mb-4">🐙</div>
              <h4 className="text-lg font-semibold mb-2 text-white">GitHub</h4>
              <p className="text-gray-300 text-sm">github.com/shivam</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 hover:scale-105 transition-all duration-300">
              <div className="text-4xl mb-4">🐦</div>
              <h4 className="text-lg font-semibold mb-2 text-white">Twitter</h4>
              <p className="text-gray-300 text-sm">@shivam_dev</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:hello@shivam.dev"
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-white hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center gap-2">
                <span>🚀</span>
                Start a Project
              </span>
            </a>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}