// lib/email-template.ts
interface BlogPost {
  title: string;
  slug: string;
  content?: string;
  body?: string;
  text?: string;
  description?: string;
  excerpt?: string;
  image_url?: string;
  created_at: string;
  tags?: string;
}

interface EmailTemplateProps {
  post: BlogPost;
  postUrl: string;
  unsubscribeUrl: string;
  siteUrl: string;
  subscriberEmail?: string;
}

export function generateNewsletterTemplate({
  post,
  postUrl,
  unsubscribeUrl,
  siteUrl,
  subscriberEmail
}: EmailTemplateProps): { html: string; text: string } {

  // Safety check
  if (!post) {
    throw new Error("Post object is required");
  }

  // Try to find content from various possible field names
  const getContent = (): string => {
    const fields = ['content', 'body', 'text', 'description', 'excerpt'];

    for (const field of fields) {
      const value = (post as any)[field];
      if (value && typeof value === 'string' && value.trim()) {
        return value;
      }
    }

    return "Check out this great new post on the blog!";
  };

  // Extract content safely
  const rawContent = getContent();

  // Extract excerpt from content
  const excerpt = rawContent
    .replace(/[#*`\[\]]/g, '') // Remove markdown
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .slice(0, 180) + '...';

  // Format date
  const publishDate = new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Tags array
  const tags = post.tags ? post.tags.split(',').map(tag => tag.trim()).slice(0, 3) : [];

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title} - Shivam's Newsletter</title>
  <style>
    /* Reset */
    body, table, td, p, a, li {
      margin: 0;
      padding: 0;
      border: 0;
      font-size: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    }

    body {
      background-color: #f8fafc;
      color: #1f2937;
      line-height: 1.6;
    }

    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }

    .header {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      padding: 40px 30px;
      text-align: center;
    }

    .header h1 {
      font-size: 28px;
      font-weight: bold;
      margin: 0 0 8px 0;
      color: #ffffff;
    }

    .header p {
      font-size: 16px;
      margin: 0;
      color: #ffffff;
      opacity: 0.9;
    }

    .content {
      padding: 40px 30px;
      background-color: #ffffff;
    }

    .post-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 24px;
      display: block;
    }

    .meta {
      margin-bottom: 20px;
    }

    .date {
      background-color: #f1f5f9;
      color: #64748b;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 14px;
      display: inline-block;
      margin-right: 10px;
      border: 1px solid #e2e8f0;
    }

    .tag {
      background-color: #6366f1;
      color: #ffffff;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      display: inline-block;
      margin-right: 6px;
    }

    .post-title {
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
      margin: 0 0 16px 0;
      line-height: 1.3;
    }

    .excerpt {
      color: #4b5563;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 30px 0;
    }

    .cta-button {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #ffffff;
      padding: 16px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      font-size: 16px;
      display: inline-block;
      text-align: center;
    }

    .cta-container {
      text-align: center;
      margin: 30px 0;
    }

    .footer {
      background-color: #f8fafc;
      padding: 30px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
    }

    .social-links {
      margin: 20px 0;
    }

    .social-link {
      color: #6366f1;
      text-decoration: none;
      margin: 0 15px;
      font-size: 14px;
      font-weight: 500;
    }

    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 25px 0;
    }

    .footer-links a {
      color: #6b7280;
      text-decoration: none;
      font-size: 12px;
    }

    .footer-links a:hover {
      color: #6366f1;
    }

    /* Mobile styles */
    @media only screen and (max-width: 600px) {
      .container {
        margin: 10px;
        border-radius: 8px;
      }

      .header, .content, .footer {
        padding: 20px;
      }

      .header h1 {
        font-size: 24px;
      }

      .post-title {
        font-size: 20px;
      }

      .excerpt {
        font-size: 14px;
      }

      .cta-button {
        padding: 14px 24px;
        font-size: 14px;
        display: block;
        margin: 0 auto;
      }

      .post-image {
        height: 160px;
      }

      .social-link {
        display: block;
        margin: 8px 0;
      }
    }
  </style>
</head>
<body>
  <div class="container">

    <!-- Header -->
    <div class="header">
      <table style="margin: 0 auto 20px; width: 60px; height: 60px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
        <tr>
          <td style="text-align: center; vertical-align: middle; font-size: 28px; font-weight: bold; color: #6366f1; line-height: 1;">
            S
          </td>
        </tr>
      </table>
      <h1>Shivam's Newsletter</h1>
      <p>📬 Fresh insights delivered to your inbox</p>
    </div>

    <!-- Content -->
    <div class="content">

      <!-- Post Image -->
      ${post.image_url ? `
        <img src="${post.image_url}" alt="${post.title}" class="post-image">
      ` : ''}

      <!-- Meta -->
      <div class="meta">
        <span class="date">📅 ${publishDate}</span>
        ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>

      <!-- Title -->
      <h2 class="post-title">${post.title}</h2>

      <!-- Excerpt -->
      <p class="excerpt">${excerpt}</p>

      <!-- CTA -->
      <div class="cta-container">
        <a href="${postUrl}" class="cta-button">📖 Read Full Article</a>
      </div>

    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin-bottom: 20px; font-weight: 600;">Let's stay connected</p>

      <div class="social-links">
        <a href="${siteUrl}" class="social-link">🌐 Blog</a>
        <a href="https://twitter.com/shivz2cool" class="social-link">🐦 Twitter</a>
        <a href="https://linkedin.com/in/shivbajaj" class="social-link">💼 LinkedIn</a>
      </div>

      <div class="divider"></div>

      <p style="margin-bottom: 16px; color: #6b7280;">
        You're receiving this newsletter because you subscribed to updates from Shivam's blog.<br>
        Thanks for being part of our growing community! 🚀
      </p>

      <div class="footer-links">
        <a href="${unsubscribeUrl}${subscriberEmail ? `?email=${encodeURIComponent(subscriberEmail)}` : ''}">Unsubscribe</a> •
        <a href="${siteUrl}">Visit Blog</a> •
        <a href="mailto:email@shivambajaj.com">Contact</a>
      </div>

      <p style="margin-top: 16px; font-size: 11px; color: #9ca3af;">
        © ${new Date().getFullYear()} Shivam Bajaj. All rights reserved.
      </p>

    </div>

  </div>
</body>
</html>`;

  const text = `
SHIVAM'S NEWSLETTER
===================

${post.title}

Published: ${publishDate}
${tags.length > 0 ? `Tags: ${tags.join(', ')}` : ''}

${excerpt}

Read the full article: ${postUrl}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONNECT WITH ME:
🌐 Blog: ${siteUrl}
🐦 Twitter: https://twitter.com/shivz2cool
💼 LinkedIn: https://linkedin.com/in/shivbajaj

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You're receiving this newsletter because you subscribed to updates from Shivam's blog.
Thanks for being part of our growing community! 🚀

Unsubscribe: ${unsubscribeUrl}${subscriberEmail ? `?email=${encodeURIComponent(subscriberEmail)}` : ''}
Visit Blog: ${siteUrl}
Contact: email@shivambajaj.com

© ${new Date().getFullYear()} Shivam Bajaj. All rights reserved.
`;

  return { html, text };
}