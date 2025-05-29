// src/components/EmojiProvider.tsx
"use client";

import { useEffect } from 'react';
import twemoji from 'twemoji';

interface EmojiProviderProps {
  children: React.ReactNode;
}

const emojiConfig = {
  folder: 'svg',
  ext: '.svg',
  className: 'emoji-icon',
  attributes: () => ({
    loading: 'lazy' as const,
  }),
};

export const EmojiProvider = ({ children }: EmojiProviderProps) => {
  useEffect(() => {
    // Parse emojis on initial load
    const parseEmojis = () => {
      if (typeof document !== 'undefined') {
        twemoji.parse(document.body, emojiConfig);
      }
    };

    // Parse emojis immediately
    parseEmojis();

    // Set up MutationObserver to parse emojis when new content is added
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              twemoji.parse(element, emojiConfig);
            }
          });
        }
      });
    });

    // Start observing the document for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Cleanup observer on unmount
    return () => {
      observer.disconnect();
    };
  }, []);

  return <>{children}</>;
};

// Utility function for manual emoji parsing
export const parseEmojis = (content: string): string => {
  return twemoji.parse(content, emojiConfig);
};

// Custom hook for manual emoji parsing on specific elements
export const useEmojiParsing = () => {
  const parseElement = (element: HTMLElement) => {
    twemoji.parse(element, emojiConfig);
  };

  return { parseElement };
};