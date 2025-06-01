// src/components/Header.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderProps {
  // Optional props to customize behavior
  showSubscribeButton?: boolean;
  onSubscribeClick?: () => void;
}

export default function Header({
  showSubscribeButton = true,
  onSubscribeClick
}: HeaderProps = {}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smart subscribe button behavior based on current page
  const handleSubscribeClick = () => {
    if (onSubscribeClick) {
      // Custom behavior passed as prop
      onSubscribeClick();
    } else if (pathname === '/') {
      // Homepage - scroll to newsletter on same page
      const newsletterSection = document.getElementById('newsletter');
      if (newsletterSection) {
        newsletterSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      // Other pages - check if newsletter exists on current page, otherwise go to homepage
      const newsletterSection = document.getElementById('newsletter');
      if (newsletterSection) {
        // Newsletter exists on current page, scroll to it
        newsletterSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // No newsletter on current page, go to homepage
        window.location.href = '/#newsletter';
      }
    }
  };

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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled
        ? 'bg-black/80 backdrop-blur-xl border-b border-white/10'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Glowing House */}
          <Link
            href="/"
            className="text-2xl hover:scale-110 transition-all duration-300 group"
          >
            <span className="inline-block relative">
              SB
              {/* Glowing effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-150"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-md animate-pulse"></div>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`transition-colors duration-300 ${
                pathname === '/'
                  ? 'text-white font-medium'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Blog
            </Link>
            <Link
              href="/resume"
              className={`transition-colors duration-300 ${
                pathname === '/resume'
                  ? 'text-white font-medium'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Resume
            </Link>
            <button
              onClick={handleContactClick}
              className="transition-colors duration-300 text-gray-300 hover:text-white cursor-pointer"
            >
              Contact
            </button>

            {showSubscribeButton && (
              <>
                <div className="w-px h-6 bg-white/20"></div>
                <button
                  type="button"
                  onClick={handleSubscribeClick}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 hover:from-purple-600/30 hover:to-pink-600/30 transition-all duration-300 hover:scale-105 group"
                >
                  <svg className="w-4 h-4 text-purple-300 group-hover:text-purple-200 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12h0z" />
                  </svg>
                  <span className="text-purple-300 group-hover:text-purple-200 text-sm font-medium transition-colors">
                    Subscribe
                  </span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button (for future mobile implementation) */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-300 hover:text-white transition-colors"
              onClick={() => {
                // TODO: Implement mobile menu toggle
                console.log('Mobile menu clicked');
              }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}