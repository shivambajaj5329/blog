"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from '@/components/Header';
import Footer from '@/components/Footer';


export default function ResumePage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Set loaded state immediately
    setIsLoaded(true);

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      loadAnimations();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const loadAnimations = async () => {
    try {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");

      gsap.registerPlugin(ScrollTrigger);

      // Wait for elements to be in DOM
      await new Promise(resolve => setTimeout(resolve, 200));

      // Hero animation on load
      gsap.timeline()
        .from('.hero-badge', { opacity: 0, y: 20, duration: 0.6 })
        .from('.hero h1', { opacity: 0, y: 30, duration: 0.8 }, '-=0.3')
        .from('.hero p', { opacity: 0, y: 20, duration: 0.6 }, '-=0.5')
        .from('.hero-buttons', { opacity: 0, y: 20, duration: 0.6 }, '-=0.3');

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

  // Smooth scrolling for anchor links
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

  // Show loading state briefly
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
                      {/* Use Header Component */}
      <Header />
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Hero Section */}
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

        {/* Timeline Section */}
        <section className="my-24">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Professional Journey
          </h2>

          <div className="timeline relative max-w-5xl mx-auto">
            {/* Central timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-purple-500 via-pink-500 to-blue-500 rounded-full hidden md:block"></div>

            {/* Timeline Item 1 - RIGHT SIDE */}
            <div className="timeline-item relative mb-16 opacity-0 transform translate-y-12">
              <div className="absolute left-1/2 top-8 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-4 border-black z-10 shadow-lg shadow-purple-500/50 hidden md:block"></div>

              {/* Desktop: Right side, Mobile: Full width */}
              <div className="md:w-1/2 md:ml-auto md:pl-12">
                <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300">
                  <div className="text-purple-400 font-semibold text-sm mb-2">2024 - Present</div>
                  <h3 className="text-2xl font-bold mb-2 text-white">Senior Full-Stack Developer</h3>
                  <div className="text-pink-400 font-semibold mb-4">TechCorp Solutions</div>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    Leading development of scalable web applications using modern technologies.
                    Mentoring junior developers and architecting cloud-native solutions that serve 100k+ users.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full text-purple-200 text-sm">React</span>
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full text-purple-200 text-sm">Node.js</span>
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full text-purple-200 text-sm">AWS</span>
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full text-purple-200 text-sm">TypeScript</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Item 2 - LEFT SIDE */}
            <div className="timeline-item relative mb-16 opacity-0 transform translate-y-12">
              <div className="absolute left-1/2 top-8 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full border-4 border-black z-10 shadow-lg shadow-pink-500/50 hidden md:block"></div>

              {/* Desktop: Left side, Mobile: Full width */}
              <div className="md:w-1/2 md:pr-12">
                <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300 md:text-right">
                  <div className="text-purple-400 font-semibold text-sm mb-2">2022 - 2024</div>
                  <h3 className="text-2xl font-bold mb-2 text-white">Full-Stack Developer</h3>
                  <div className="text-pink-400 font-semibold mb-4">StartupXYZ</div>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    Built and maintained multiple client projects from concept to deployment.
                    Implemented CI/CD pipelines and optimized application performance by 40%.
                  </p>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full text-purple-200 text-sm">Vue.js</span>
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full text-purple-200 text-sm">Python</span>
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full text-purple-200 text-sm">Docker</span>
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full text-purple-200 text-sm">PostgreSQL</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Item 3 - RIGHT SIDE */}
            <div className="timeline-item relative mb-16 opacity-0 transform translate-y-12">
              <div className="absolute left-1/2 top-8 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full border-4 border-black z-10 shadow-lg shadow-blue-500/50 hidden md:block"></div>

              {/* Desktop: Right side, Mobile: Full width */}
              <div className="md:w-1/2 md:ml-auto md:pl-12">
                <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300">
                  <div className="text-purple-400 font-semibold text-sm mb-2">2021 - 2022</div>
                  <h3 className="text-2xl font-bold mb-2 text-white">Frontend Developer</h3>
                  <div className="text-pink-400 font-semibold mb-4">Digital Agency Pro</div>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    Developed responsive web interfaces and improved user experience metrics.
                    Collaborated with design teams to implement pixel-perfect designs.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full text-purple-200 text-sm">JavaScript</span>
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full text-purple-200 text-sm">CSS3</span>
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full text-purple-200 text-sm">Figma</span>
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full text-purple-200 text-sm">Git</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Item 4 - LEFT SIDE */}
            <div className="timeline-item relative mb-16 opacity-0 transform translate-y-12">
              <div className="absolute left-1/2 top-8 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full border-4 border-black z-10 shadow-lg shadow-cyan-500/50 hidden md:block"></div>

              {/* Desktop: Left side, Mobile: Full width */}
              <div className="md:w-1/2 md:pr-12">
                <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300 md:text-right">
                  <div className="text-purple-400 font-semibold text-sm mb-2">2020 - 2021</div>
                  <h3 className="text-2xl font-bold mb-2 text-white">Junior Web Developer</h3>
                  <div className="text-pink-400 font-semibold mb-4">WebSolutions Inc</div>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    Started my professional journey building websites and learning modern development practices.
                    Gained experience in both frontend and backend technologies.
                  </p>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full text-purple-200 text-sm">HTML5</span>
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full text-purple-200 text-sm">PHP</span>
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full text-purple-200 text-sm">MySQL</span>
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full text-purple-200 text-sm">WordPress</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
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

        {/* Contact Section */}
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