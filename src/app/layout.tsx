// Fixed Layout - Sleek Black Theme with Cox Communications Highlighting
"use client";

import "./globals.css";
import { useEffect } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Function to highlight Cox Communications text
    const highlightCoxText = () => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function(node) {
            // Skip script and style tags
            if (node.parentElement?.tagName === 'SCRIPT' ||
                node.parentElement?.tagName === 'STYLE' ||
                node.parentElement?.tagName === 'NOSCRIPT') {
              return NodeFilter.FILTER_REJECT;
            }
            // Skip if already highlighted
            if (node.parentElement?.classList.contains('cox-highlight')) {
              return NodeFilter.FILTER_REJECT;
            }
            // Accept if contains Cox Communications
            if (node.textContent && /Cox Communications/gi.test(node.textContent)) {
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

      // Replace text nodes with highlighted versions
      nodesToReplace.forEach(textNode => {
        const text = textNode.textContent || '';
        const parent = textNode.parentNode;

        if (parent) {
          const parts = text.split(/(Cox Communications)/gi);
          const fragment = document.createDocumentFragment();

          parts.forEach(part => {
            if (part.toLowerCase() === 'cox communications') {
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

    // Initial highlight
    highlightCoxText();

    // Create observer for dynamic content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          highlightCoxText();
        }
      });
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Cleanup
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

            /* Ensure Cox highlight works in dark mode */
            .cox-highlight::selection {
              background: rgba(0, 200, 180, 0.3);
              -webkit-text-fill-color: #00B5E2;
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
          {/* Main gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>

          {/* Moving gradient orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl orb-animation-1"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl orb-animation-2"></div>
          <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl orb-animation-3"></div>

          {/* Subtle grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3E%3C/svg%3E")`
            }}
          ></div>
        </div>

        {/* Content with proper z-index */}
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}