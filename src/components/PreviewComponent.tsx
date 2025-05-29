// components/PreviewComponent.tsx
"use client";

import ReactMarkdown from "react-markdown";
// Add this to package.json: npm install remark-gfm
// import remarkGfm from "remark-gfm";

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
              <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                {title}
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
              // Uncomment when you add remark-gfm: remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2 text-white">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-bold mt-3 mb-2 text-blue-200">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-bold mt-2 mb-1 text-blue-300">{children}</h3>,
                p: ({ children }) => <p className="text-gray-300 mb-3 leading-relaxed">{children}</p>,
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full border border-gray-600 rounded-lg">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-gray-800">{children}</thead>,
                tbody: ({ children }) => <tbody className="bg-gray-900/50">{children}</tbody>,
                tr: ({ children }) => <tr className="border-b border-gray-600">{children}</tr>,
                th: ({ children }) => <th className="px-4 py-2 text-left text-white font-semibold border-r border-gray-600 last:border-r-0">{children}</th>,
                td: ({ children }) => <td className="px-4 py-2 text-gray-300 border-r border-gray-600 last:border-r-0">{children}</td>,
                code: ({ children, className }) => {
                  const isInline = !className;
                  if (isInline) {
                    return <code className="bg-slate-800 px-1 py-0.5 rounded text-blue-300 text-xs">{children}</code>;
                  }
                  return <code className="block bg-slate-800 p-2 rounded text-xs overflow-x-auto">{children}</code>;
                },
                blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-400">{children}</blockquote>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-4 text-gray-300">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-4 text-gray-300">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                a: ({ children, href }) => <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                img: ({ src, alt }) => <img src={src} alt={alt} className="max-w-full h-auto rounded-lg my-4" />,
                pre: ({ children }) => <pre className="bg-slate-800 p-4 rounded-lg overflow-x-auto mb-4 text-sm">{children}</pre>,
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
            <p className="text-sm mt-2">Tables, code blocks, and all markdown features supported!</p>
          </div>
        )}
      </div>
    </div>
  );
}