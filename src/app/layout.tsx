// Enhanced Layout with Mobile Navigation Fix
"use client";

import "./globals.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Cox Communications highlighting code
    const highlightCoxText = () => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function(node) {
            if (node.parentElement?.tagName === 'SCRIPT' ||
                node.parentElement?.tagName === 'STYLE' ||
                node.parentElement?.tagName === 'NOSCRIPT') {
              return NodeFilter.FILTER_REJECT;
            }
            if (node.parentElement?.classList.contains('cox-highlight')) {
              return NodeFilter.FILTER_REJECT;
            }
            if (node.textContent && /Cox Communications|Cox/gi.test(node.textContent)) {
              return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_REJECT;
          }
        }
      );

      const nodesToReplace = [];
      let node;
      while (node = walker.nextNode()) {
        nodesToReplace.push(node);
      }

      nodesToReplace.forEach(textNode => {
        const text = textNode.textContent || '';
        const parent = textNode.parentNode;

        if (parent) {
          const parts = text.split(/(Cox Communications|Cox)/gi);
          const fragment = document.createDocumentFragment();

          parts.forEach(part => {
            if (part.toLowerCase() === 'cox communications'
            ||
            part.toLowerCase() === 'cox'

            ) {
              const span = document.createElement('span');
              span.className = 'cox-highlight';
              span.textContent = part;
              fragment.appendChild(span);
            } else {
              fragment.appendChild(document.createTextNode(part));
            }
          });

          parent.replaceChild(fragment, textNode);
        }
      });
    };

    highlightCoxText();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          highlightCoxText();
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Global sleek theme styles */
            * {
              scrollbar-width: thin;
              scrollbar-color: rgba(147, 51, 234, 0.5) rgba(0, 0, 0, 0.1);
            }

            *::-webkit-scrollbar {
              width: 8px;
            }

            *::-webkit-scrollbar-track {
              background: rgba(0, 0, 0, 0.1);
            }

            *::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, rgba(147, 51, 234, 0.5), rgba(219, 39, 119, 0.5));
              border-radius: 4px;
            }

            *::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(180deg, rgba(147, 51, 234, 0.8), rgba(219, 39, 119, 0.8));
            }

            *:focus-visible {
              outline: 2px solid rgba(147, 51, 234, 0.8);
              outline-offset: 2px;
              border-radius: 4px;
            }

            ::selection {
              background: rgba(147, 51, 234, 0.3);
              color: white;
            }

            ::-moz-selection {
              background: rgba(147, 51, 234, 0.3);
              color: white;
            }

            body {
              background: black !important;
              color: white !important;
            }

            .bg-zinc-900, .bg-slate-950 {
              background: black !important;
            }

            /* Cox Communications Highlighting Styles */
            .cox-highlight {
              display: inline-block;
              font-weight: 600;
              padding: 0 4px;
              border-radius: 4px;
              background: linear-gradient(90deg, #009DDC 0%, #00B5E2 30%, #00C8B4 70%, #00D264 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              text-shadow: 0 0 25px rgba(0, 200, 180, 0.4);
              animation: cox-glow 2s ease-in-out infinite;
              position: relative;
              background-size: 100% 100%;
              background-position: 0% 0%;
            }

            @keyframes cox-glow {
              0%, 100% {
                filter: brightness(1) drop-shadow(0 0 12px rgba(0, 157, 220, 0.4));
              }
              50% {
                filter: brightness(1.2) drop-shadow(0 0 25px rgba(0, 200, 180, 0.6));
              }
            }

            .cox-highlight::selection {
              background: rgba(0, 200, 180, 0.3);
              -webkit-text-fill-color: #00B5E2;
            }

            /* Mobile Navigation Styles */
            .mobile-nav {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              background: rgba(0, 0, 0, 0.95);
              backdrop-filter: blur(20px);
              border-top: 1px solid rgba(255, 255, 255, 0.1);
              z-index: 100;
              padding: 0.5rem 0;
            }

            @media (min-width: 768px) {
              .mobile-nav {
                display: none;
              }
            }

            .mobile-nav-item {
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 0.5rem;
              color: rgba(255, 255, 255, 0.7);
              text-decoration: none;
              transition: all 0.3s ease;
              position: relative;
            }

            .mobile-nav-item:active {
              transform: scale(0.95);
            }

            .mobile-nav-item.active {
              color: white;
            }

            .mobile-nav-item.active::before {
              content: '';
              position: absolute;
              top: 0;
              left: 50%;
              transform: translateX(-50%);
              width: 30px;
              height: 2px;
              background: linear-gradient(90deg, #9333ea, #db2777);
              border-radius: 1px;
            }

            .mobile-nav-icon {
              font-size: 1.5rem;
              margin-bottom: 0.25rem;
            }

            .mobile-nav-label {
              font-size: 0.75rem;
            }

            /* Adjust content padding for mobile nav */
            @media (max-width: 767px) {
              body {
                padding-bottom: 80px;
              }
            }

            .orb-animation-1 {
              animation: float-orb 8s ease-in-out infinite;
            }

            .orb-animation-2 {
              animation: float-orb 10s ease-in-out infinite;
              animation-delay: 1s;
            }

            .orb-animation-3 {
              animation: float-orb 12s ease-in-out infinite;
              animation-delay: 2s;
            }

            @keyframes float-orb {
              0%, 100% {
                transform: translateY(0px) translateX(0px) scale(1);
              }
              33% {
                transform: translateY(-20px) translateX(10px) scale(1.05);
              }
              66% {
                transform: translateY(10px) translateX(-10px) scale(0.95);
              }
            }
          `
        }} />
      </head>
      <body className="bg-black text-white min-h-screen overflow-x-hidden">
        {/* Global Animated Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl orb-animation-1"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl orb-animation-2"></div>
          <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl orb-animation-3"></div>
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3E%3C/svg%3E")`
            }}
          ></div>
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen">
          {children}
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="mobile-nav">
          <div className="flex">
            <Link href="/" className={`mobile-nav-item ${pathname === '/' ? 'active' : ''}`}>
              <span className="mobile-nav-icon">🏠</span>
              <span className="mobile-nav-label">Home</span>
            </Link>
            <Link href="/resume" className={`mobile-nav-item ${pathname === '/resume' ? 'active' : ''}`}>
              <span className="mobile-nav-icon">📄</span>
              <span className="mobile-nav-label">Resume</span>
            </Link>
            <Link href="/contact" className={`mobile-nav-item ${pathname === '/contact' ? 'active' : ''}`}>
              <span className="mobile-nav-icon">💬</span>
              <span className="mobile-nav-label">Contact</span>
            </Link>
            <a href="/blog" className={`mobile-nav-item ${pathname?.startsWith('/blog') ? 'active' : ''}`}>
              <span className="mobile-nav-icon">📝</span>
              <span className="mobile-nav-label">Blog</span>
            </a>
          </div>
        </nav>
      </body>
    </html>
  );
}