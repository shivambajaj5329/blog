// components/PreviewComponent.tsx
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // 👈 UNCOMMENTED - This enables tables!

interface PreviewComponentProps {
  title: string;
  tags: string;
  content: string;
  imagePreview: string;
}

export default function PreviewComponent({ title, tags, content, imagePreview }: PreviewComponentProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
        👁️ Live Preview
      </h2>

      <div className="bg-white/5 rounded-xl p-6 border border-white/10 max-h-96 overflow-y-auto">
        {title || content ? (
          <article className="prose prose-invert max-w-none">
            {title && (
              <h1 className="text-2xl font-bold mb-4 leading-tight">
                {title.split(/(\p{Emoji})/gu).map((part: string, index: number) => {
                  // If this part is an emoji, render normally
                  if (/\p{Emoji}/gu.test(part)) {
                    return <span key={index}>{part}</span>;
                  }
                  // If this part is text, apply gradient
                  return part ? (
                    <span key={index} className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                      {part}
                    </span>
                  ) : null;
                })}
              </h1>
            )}
            {tags && (
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.split(",").map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block text-xs px-2 py-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-200 rounded-full border border-blue-500/30"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Cover"
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
            )}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]} // 👈 UNCOMMENTED - This makes tables work!
              components={{
                h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2 text-white">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-bold mt-3 mb-2 text-blue-200">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-bold mt-2 mb-1 text-blue-300">{children}</h3>,
                p: ({ children }) => <p className="text-gray-300 mb-3 leading-relaxed">{children}</p>,

                // 🚀 ENHANCED TABLE COMPONENTS - Now they'll actually work!
                table: ({ children }) => (
                  <div className="overflow-x-auto my-6 rounded-lg border border-white/20">
                    <table className="w-full border-collapse bg-slate-900/80 backdrop-blur-sm">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-gradient-to-r from-blue-600/30 to-purple-600/30">
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-white/10">
                    {children}
                  </tbody>
                ),
                tr: ({ children }) => (
                  <tr className="hover:bg-white/5 transition-colors duration-200">
                    {children}
                  </tr>
                ),
                th: ({ children }) => (
                  <th className="px-3 py-2 text-left font-semibold text-white border-b border-white/30 text-sm">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-3 py-2 text-gray-300 border-b border-white/5 text-sm">
                    {children}
                  </td>
                ),

                code: ({ children, className }) => {
                  const isInline = !className;
                  if (isInline) {
                    return <code className="bg-slate-800 px-1 py-0.5 rounded text-blue-300 text-xs">{children}</code>;
                  }
                  return <code className="block bg-slate-800 p-2 rounded text-xs overflow-x-auto">{children}</code>;
                },
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 my-4 bg-blue-500/10 py-2 rounded-r-lg italic text-gray-300">
                    {children}
                  </blockquote>
                ),
                ul: ({ children }) => <ul className="list-disc list-inside mb-4 text-gray-300 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-4 text-gray-300 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                a: ({ children, href }) => (
                  <a
                    href={href}
                    className="text-blue-400 hover:text-blue-300 underline transition-colors duration-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                img: ({ src, alt }) => (
                  <img
                    src={src}
                    alt={alt}
                    className="max-w-full h-auto rounded-lg my-4 border border-white/10"
                  />
                ),
                pre: ({ children }) => (
                  <pre className="bg-slate-800 p-4 rounded-lg overflow-x-auto mb-4 text-sm border border-white/10">
                    {children}
                  </pre>
                ),
                hr: () => <hr className="border-gray-600 my-6" />,
              }}
            >
              {content || "*Start writing to see preview...*"}
            </ReactMarkdown>
          </article>
        ) : (
          <div className="text-center text-gray-400 py-12">
            <div className="text-4xl mb-2">📝</div>
            <p>Your post preview will appear here</p>
            <p className="text-sm mt-2">Tables, emojis, code blocks, and all markdown features supported!</p>
          </div>
        )}
      </div>
    </div>
  );
}