// components/PreviewComponent.tsx
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PreviewComponentProps {
  title: string;
  tags: string;
  content: string;
  imagePreview: string;
}

// Define proper types for markdown components
interface CodeProps {
  children?: React.ReactNode;
  className?: string;
  inline?: boolean;
  [key: string]: any;
}

interface MarkdownComponentProps {
  children?: React.ReactNode;
  [key: string]: any;
}

export default function PreviewComponent({ title, tags, content, imagePreview }: PreviewComponentProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
        👁️ Live Preview
      </h2>

      {/* ENHANCED PREVIEW CONTAINER WITH BETTER TITLE HANDLING */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10 max-h-[600px] overflow-y-auto">
        {title || content ? (
          <article className="prose prose-invert max-w-none">
            {/* ENHANCED TITLE SECTION WITH FULL DISPLAY */}
            {title && (
              <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-tight break-words">
                  {title.split(/(\p{Emoji})/gu).map((part: string, index: number) => {
                    // If this part is an emoji, render with larger size
                    if (/\p{Emoji}/gu.test(part)) {
                      return <span key={index} className="text-3xl md:text-4xl">{part}</span>;
                    }
                    // If this part is text, apply gradient
                    return part ? (
                      <span key={index} className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                        {part}
                      </span>
                    ) : null;
                  })}
                </h1>
                {/* Title character count indicator */}
                <div className="text-xs text-gray-500 mb-2">
                  {title.length} characters
                </div>
              </div>
            )}

            {/* ENHANCED TAGS SECTION */}
            {tags && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.split(",").map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block text-xs px-3 py-1.5 bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-200 rounded-full border border-blue-500/30 font-medium"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* ENHANCED IMAGE PREVIEW */}
            {imagePreview && (
              <div className="mb-6 rounded-lg overflow-hidden border border-white/10">
                <img
                  src={imagePreview}
                  alt="Cover"
                  className="w-full h-40 md:h-48 object-cover"
                />
              </div>
            )}

            {/* CONTENT PREVIEW WITH BETTER SPACING */}
            <div className="prose-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // ENHANCED HEADING COMPONENTS
                  h1: ({ children }: MarkdownComponentProps) => (
                    <h1 className="text-xl md:text-2xl font-bold mt-6 mb-4 text-white border-b border-white/20 pb-2">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }: MarkdownComponentProps) => (
                    <h2 className="text-lg md:text-xl font-bold mt-5 mb-3 text-blue-200">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }: MarkdownComponentProps) => (
                    <h3 className="text-base md:text-lg font-bold mt-4 mb-2 text-blue-300">
                      {children}
                    </h3>
                  ),

                  // ENHANCED PARAGRAPH STYLING
                  p: ({ children }: MarkdownComponentProps) => (
                    <p className="text-gray-300 mb-4 leading-relaxed text-sm md:text-base">
                      {children}
                    </p>
                  ),

                  // ENHANCED TABLE COMPONENTS
                  table: ({ children }: MarkdownComponentProps) => (
                    <div className="overflow-x-auto my-6 rounded-lg border border-white/20">
                      <table className="w-full border-collapse bg-slate-900/80 backdrop-blur-sm min-w-full">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }: MarkdownComponentProps) => (
                    <thead className="bg-gradient-to-r from-blue-600/30 to-purple-600/30">
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }: MarkdownComponentProps) => (
                    <tbody className="divide-y divide-white/10">
                      {children}
                    </tbody>
                  ),
                  tr: ({ children }: MarkdownComponentProps) => (
                    <tr className="hover:bg-white/5 transition-colors duration-200">
                      {children}
                    </tr>
                  ),
                  th: ({ children }: MarkdownComponentProps) => (
                    <th className="px-4 py-3 text-left font-semibold text-white border-b border-white/30 text-sm whitespace-nowrap">
                      {children}
                    </th>
                  ),
                  td: ({ children }: MarkdownComponentProps) => (
                    <td className="px-4 py-3 text-gray-300 border-b border-white/5 text-sm">
                      {children}
                    </td>
                  ),

                  // FIXED CODE STYLING WITH PROPER TYPES
                  code: ({ children, className, inline, ...props }: CodeProps) => {
                    const isInline = inline || !className;

                    if (isInline) {
                      return (
                        <code className="bg-slate-800 px-2 py-1 rounded text-blue-300 text-xs font-mono">
                          {children}
                        </code>
                      );
                    }

                    return (
                      <div className="my-4">
                        <pre className="bg-slate-800 p-4 rounded-lg overflow-x-auto text-xs border border-white/10">
                          <code className="text-gray-100 font-mono whitespace-pre">
                            {children}
                          </code>
                        </pre>
                      </div>
                    );
                  },

                  // ENHANCED BLOCKQUOTE
                  blockquote: ({ children }: MarkdownComponentProps) => (
                    <blockquote className="border-l-4 border-blue-500 pl-4 my-4 bg-blue-500/10 py-3 rounded-r-lg italic text-gray-300">
                      {children}
                    </blockquote>
                  ),

                  // ENHANCED LISTS
                  ul: ({ children }: MarkdownComponentProps) => (
                    <ul className="list-disc list-inside mb-4 text-gray-300 space-y-2 ml-4">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }: MarkdownComponentProps) => (
                    <ol className="list-decimal list-inside mb-4 text-gray-300 space-y-2 ml-4">
                      {children}
                    </ol>
                  ),
                  li: ({ children }: MarkdownComponentProps) => (
                    <li className="mb-1 text-sm md:text-base leading-relaxed">
                      {children}
                    </li>
                  ),

                  // ENHANCED LINKS
                  a: ({ children, href }: MarkdownComponentProps & { href?: string }) => (
                    <a
                      href={href}
                      className="text-blue-400 hover:text-blue-300 underline transition-colors duration-300 break-words"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),

                  // ENHANCED IMAGES
                  img: ({ src, alt }: MarkdownComponentProps & { src?: string; alt?: string }) => (
                    <div className="my-6">
                      <img
                        src={src}
                        alt={alt}
                        className="max-w-full h-auto rounded-lg border border-white/10 mx-auto"
                      />
                    </div>
                  ),

                  // ENHANCED HR
                  hr: () => <hr className="border-gray-600 my-6" />,

                  // ENHANCED STRONG AND EM
                  strong: ({ children }: MarkdownComponentProps) => (
                    <strong className="font-bold text-white">
                      {children}
                    </strong>
                  ),
                  em: ({ children }: MarkdownComponentProps) => (
                    <em className="italic text-blue-200">
                      {children}
                    </em>
                  ),
                }}
              >
                {content || "*Start writing to see preview...*"}
              </ReactMarkdown>
            </div>
          </article>
        ) : (
          <div className="text-center text-gray-400 py-12">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium mb-2 text-white">Your post preview will appear here</h3>
            <p className="text-sm mt-2">Full titles, tables, emojis, code blocks, and all markdown features supported!</p>
            <div className="mt-4 text-xs text-gray-500">
              ✨ Enhanced with responsive design and better typography
            </div>
          </div>
        )}
      </div>
    </div>
  );
}