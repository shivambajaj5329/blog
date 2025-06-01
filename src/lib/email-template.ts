// lib/email-template.ts
interface BlogPost {
  title: string;
  slug: string;
  content: string;
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

  // Extract excerpt from content
  const excerpt = post.content
    .replace(/[#*`\[\]]/g, '') // Remove markdown
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .slice(0, 200) + '...';

  // Format date
  const publishDate = new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Tags array
  const tags = post.tags ? post.tags.split(',').map(tag => tag.trim()) : [];

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${post.title} - Shivam's Blog</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset and base styles */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      outline: none;
      text-decoration: none;
    }

    /* Client-specific styles */
    .ReadMsgBody { width: 100%; }
    .ExternalClass { width: 100%; }
    .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {
      line-height: 100%;
    }

    /* Mobile styles */
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .content { padding: 16px !important; }
      .header { padding: 20px 16px !important; }
      .post-title { font-size: 24px !important; line-height: 1.2 !important; }
      .cta-button { width: 100% !important; display: block !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%); color: #ffffff; line-height: 1.6;">

  <!-- Wrapper table -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%);">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <!-- Main container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="container" style="max-width: 600px; background: rgba(0, 0, 0, 0.7); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);">

          <!-- Header -->
          <tr>
            <td class="header" style="padding: 40px 32px 20px; text-align: center; background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%); border-bottom: 1px solid rgba(168, 85, 247, 0.2);">
              <h1 style="margin: 0 0 12px 0; font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                Shivam's Blog
              </h1>
              <p style="margin: 0; color: #9ca3af; font-size: 16px; font-weight: 500;">
                📬 New Post Notification
              </p>
            </td>
          </tr>

          <!-- Post content -->
          <tr>
            <td class="content" style="padding: 32px;">

              <!-- Post image -->
              ${post.image_url ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td>
                    <img src="${post.image_url}" alt="${post.title}" style="width: 100%; height: 250px; object-fit: cover; border-radius: 16px; display: block;">
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Post metadata -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px;">
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                      <span style="color: #9ca3af; font-size: 14px;">📅 ${publishDate}</span>
                      ${tags.length > 0 ? `<span style="color: #9ca3af; font-size: 14px;">•</span>` : ''}
                      ${tags.slice(0, 3).map(tag => `<span style="background: rgba(168, 85, 247, 0.2); color: #c084fc; padding: 4px 8px; border-radius: 8px; font-size: 12px; font-weight: 500;">${tag}</span>`).join(' ')}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Post title -->
              <h2 class="post-title" style="margin: 0 0 20px 0; font-size: 28px; font-weight: 700; line-height: 1.3; color: #ffffff;">
                ${post.title}
              </h2>

              <!-- Post excerpt -->
              <p style="margin: 0 0 32px 0; color: #d1d5db; font-size: 16px; line-height: 1.7;">
                ${excerpt}
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${postUrl}" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);">
                      📖 Read Full Post →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 32px;">
              <div style="height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(168, 85, 247, 0.3) 50%, transparent 100%);"></div>
            </td>
          </tr>

          <!-- Social links -->
          <tr>
            <td style="padding: 24px 32px; text-align: center;">
              <p style="margin: 0 0 16px 0; color: #9ca3af; font-size: 16px; font-weight: 500;">
                Connect with me
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="${siteUrl}" style="display: inline-block; background: rgba(255, 255, 255, 0.1); color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 8px; font-size: 14px; transition: all 0.3s ease;">
                      🌐 Blog
                    </a>
                  </td>
                  <td style="padding: 0 8px;">
                    <a href="https://twitter.com/yourusername" style="display: inline-block; background: rgba(255, 255, 255, 0.1); color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 8px; font-size: 14px; transition: all 0.3s ease;">
                      🐦 Twitter
                    </a>
                  </td>
                  <td style="padding: 0 8px;">
                    <a href="https://linkedin.com/in/yourusername" style="display: inline-block; background: rgba(255, 255, 255, 0.1); color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 8px; font-size: 14px; transition: all 0.3s ease;">
                      💼 LinkedIn
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px 32px; text-align: center; background: rgba(255, 255, 255, 0.02); border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <p style="margin: 0 0 12px 0; color: #9ca3af; font-size: 14px; line-height: 1.5;">
                You're receiving this because you subscribed to Shivam's newsletter.<br>
                Thanks for being part of the community! 🙏
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                <a href="${unsubscribeUrl}${subscriberEmail ? `?email=${encodeURIComponent(subscriberEmail)}` : ''}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
                •
                <a href="${siteUrl}" style="color: #6b7280; text-decoration: underline;">Visit Blog</a>
                •
                <a href="${siteUrl}/contact" style="color: #6b7280; text-decoration: underline;">Contact</a>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;

  const text = `
📬 NEW POST FROM SHIVAM'S BLOG

${post.title}

Published: ${publishDate}
${tags.length > 0 ? `Tags: ${tags.join(', ')}` : ''}

${excerpt}

Read the full post here:
${postUrl}

---

CONNECT WITH ME:
🌐 Blog: ${siteUrl}
🐦 Twitter: https://twitter.com/yourusername
💼 LinkedIn: https://linkedin.com/in/yourusername

---

You're receiving this because you subscribed to Shivam's newsletter.
Thanks for being part of the community! 🙏

Unsubscribe: ${unsubscribeUrl}${subscriberEmail ? `?email=${encodeURIComponent(subscriberEmail)}` : ''}
Visit Blog: ${siteUrl}
Contact: ${siteUrl}/contact
`;

  return { html, text };
}