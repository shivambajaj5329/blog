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
    .slice(0, 180) + '...';

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
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${post.title} - Shivam's Newsletter</title>

  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->

  <style>
    /* Reset and base styles */
    * { box-sizing: border-box; }
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      margin: 0;
      padding: 0;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      border-collapse: collapse;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      outline: none;
      text-decoration: none;
      max-width: 100%;
      height: auto;
      display: block;
    }

    /* Client-specific styles */
    .ReadMsgBody { width: 100%; }
    .ExternalClass { width: 100%; }
    .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {
      line-height: 100%;
    }

    /* Dark mode styles */
    @media (prefers-color-scheme: dark) {
      .dark-bg { background-color: #0a0a0a !important; }
      .dark-container { background-color: rgba(15, 15, 15, 0.95) !important; }
      .dark-content { background-color: rgba(30, 30, 30, 0.8) !important; }
      .dark-text { color: #f8fafc !important; }
      .dark-muted { color: #94a3b8 !important; }
      .dark-border { border-color: rgba(255, 255, 255, 0.1) !important; }
    }

    /* Mobile styles */
    @media only screen and (max-width: 640px) {
      .container { width: 100% !important; max-width: 100% !important; margin: 0 !important; }
      .mobile-padding { padding: 20px !important; }
      .mobile-padding-sm { padding: 16px !important; }
      .mobile-text-center { text-align: center !important; }
      .mobile-full-width { width: 100% !important; display: block !important; }
      .mobile-hide { display: none !important; }
      .mobile-show { display: block !important; max-height: none !important; overflow: visible !important; }
      .mobile-title { font-size: 28px !important; line-height: 1.2 !important; }
      .mobile-subtitle { font-size: 18px !important; }
      .mobile-button {
        width: 100% !important;
        padding: 18px 24px !important;
        font-size: 16px !important;
        text-align: center !important;
      }
      .mobile-social {
        display: block !important;
        margin: 8px 0 !important;
        width: auto !important;
      }
      .mobile-spacing { padding: 24px 0 !important; }
    }

    /* iPhone specific */
    @media only screen and (max-width: 480px) {
      .mobile-title { font-size: 24px !important; }
      .mobile-padding { padding: 16px !important; }
    }

    /* High DPI screens */
    @media only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (min-device-pixel-ratio: 2) {
      .retina-img { max-width: 100% !important; height: auto !important; }
    }
  </style>
</head>

<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #334155 100%); color: #ffffff; line-height: 1.6; -webkit-font-smoothing: antialiased;" class="dark-bg">

  <!-- Preheader text -->
  <div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: transparent;">
    ${post.title} - New post from Shivam's Newsletter
  </div>

  <!-- Wrapper table -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #334155 100%); min-height: 100vh;" class="dark-bg">
    <tr>
      <td align="center" style="padding: 40px 20px;" class="mobile-padding">

        <!-- Main container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="container" style="max-width: 600px; background: rgba(15, 23, 42, 0.95); border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px);" class="dark-container">

          <!-- Header -->
          <tr>
            <td style="padding: 48px 40px 32px; text-align: center; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 50%, rgba(236, 72, 153, 0.1) 100%); border-bottom: 1px solid rgba(255, 255, 255, 0.08);" class="mobile-padding dark-border">

              <!-- Logo/Brand -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%); border-radius: 20px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);">
                      <span style="font-size: 28px; font-weight: 800; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">S</span>
                    </div>

                    <h1 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -0.025em;" class="dark-text">
                      Shivam's Newsletter
                    </h1>

                    <p style="margin: 0; color: #94a3b8; font-size: 16px; font-weight: 500; letter-spacing: 0.025em;" class="dark-muted">
                      📬 Fresh insights delivered to your inbox
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Post content -->
          <tr>
            <td style="padding: 40px;" class="mobile-padding dark-content">

              <!-- Post image -->
              ${post.image_url ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
                <tr>
                  <td style="border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);">
                    <img src="${post.image_url}" alt="${post.title}" style="width: 100%; height: 280px; object-fit: cover; border-radius: 16px; display: block;" class="retina-img">
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Post metadata -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-right: 16px;">
                          <span style="color: #94a3b8; font-size: 14px; font-weight: 500; background: rgba(148, 163, 184, 0.1); padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(148, 163, 184, 0.2);" class="dark-muted">
                            📅 ${publishDate}
                          </span>
                        </td>
                        ${tags.length > 0 ? tags.slice(0, 2).map(tag => `
                        <td style="padding-right: 8px;">
                          <span style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%); color: #c4b5fd; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; border: 1px solid rgba(196, 181, 253, 0.3); text-transform: uppercase; letter-spacing: 0.05em;">
                            ${tag}
                          </span>
                        </td>
                        `).join('') : ''}
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Post title -->
              <h2 style="margin: 0 0 24px 0; font-size: 32px; font-weight: 800; line-height: 1.2; color: #f8fafc; letter-spacing: -0.025em;" class="mobile-title dark-text">
                ${post.title}
              </h2>

              <!-- Post excerpt -->
              <p style="margin: 0 0 40px 0; color: #cbd5e1; font-size: 18px; line-height: 1.7; letter-spacing: 0.025em;" class="mobile-subtitle dark-muted">
                ${excerpt}
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding: 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="border-radius: 16px; background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%); box-shadow: 0 8px 32px rgba(99, 102, 241, 0.4);">
                          <a href="${postUrl}" style="display: inline-block; padding: 20px 40px; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 16px; letter-spacing: 0.025em; border-radius: 16px; transition: all 0.3s ease;" class="mobile-button">
                            📖 Read Full Article
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;" class="mobile-padding-sm">
              <div style="height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(148, 163, 184, 0.3) 20%, rgba(99, 102, 241, 0.5) 50%, rgba(148, 163, 184, 0.3) 80%, transparent 100%);"></div>
            </td>
          </tr>

          <!-- Social links -->
          <tr>
            <td style="padding: 32px 40px; text-align: center;" class="mobile-padding mobile-spacing">
              <p style="margin: 0 0 20px 0; color: #94a3b8; font-size: 16px; font-weight: 600; letter-spacing: 0.025em;" class="dark-muted">
                Let's stay connected
              </p>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="padding: 0 8px;" class="mobile-social">
                    <a href="${siteUrl}" style="display: inline-block; background: rgba(148, 163, 184, 0.1); color: #94a3b8; text-decoration: none; padding: 12px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; border: 1px solid rgba(148, 163, 184, 0.2); transition: all 0.3s ease; letter-spacing: 0.025em;" class="dark-muted">
                      🌐 Blog
                    </a>
                  </td>
                  <td style="padding: 0 8px;" class="mobile-social">
                    <a href="https://twitter.com/shivz2cool" style="display: inline-block; background: rgba(148, 163, 184, 0.1); color: #94a3b8; text-decoration: none; padding: 12px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; border: 1px solid rgba(148, 163, 184, 0.2); transition: all 0.3s ease; letter-spacing: 0.025em;" class="dark-muted">
                      🐦 Twitter
                    </a>
                  </td>
                  <td style="padding: 0 8px;" class="mobile-social">
                    <a href="https://linkedin.com/in/shivbajaj" style="display: inline-block; background: rgba(148, 163, 184, 0.1); color: #94a3b8; text-decoration: none; padding: 12px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; border: 1px solid rgba(148, 163, 184, 0.2); transition: all 0.3s ease; letter-spacing: 0.025em;" class="dark-muted">
                      💼 LinkedIn
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; text-align: center; background: rgba(15, 23, 42, 0.5); border-top: 1px solid rgba(148, 163, 184, 0.1);" class="mobile-padding dark-border">
              <p style="margin: 0 0 16px 0; color: #64748b; font-size: 14px; line-height: 1.6; letter-spacing: 0.025em;" class="dark-muted">
                You're receiving this newsletter because you subscribed to updates from Shivam's blog.<br>
                Thanks for being part of our growing community of tech enthusiasts! 🚀
              </p>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="${unsubscribeUrl}${subscriberEmail ? `?email=${encodeURIComponent(subscriberEmail)}` : ''}" style="color: #64748b; text-decoration: none; font-size: 12px; border-bottom: 1px solid rgba(100, 116, 139, 0.3); transition: all 0.3s ease;">Unsubscribe</a>
                  </td>
                  <td style="color: #64748b; font-size: 12px; padding: 0 8px;">•</td>
                  <td style="padding: 0 8px;">
                    <a href="${siteUrl}" style="color: #64748b; text-decoration: none; font-size: 12px; border-bottom: 1px solid rgba(100, 116, 139, 0.3); transition: all 0.3s ease;">Visit Blog</a>
                  </td>
                  <td style="color: #64748b; font-size: 12px; padding: 0 8px;">•</td>
                  <td style="padding: 0 8px;">
                    <a href="mailto:hello@shivambajaj.com" style="color: #64748b; text-decoration: none; font-size: 12px; border-bottom: 1px solid rgba(100, 116, 139, 0.3); transition: all 0.3s ease;">Contact</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 16px 0 0 0; color: #475569; font-size: 11px; letter-spacing: 0.05em;">
                © ${new Date().getFullYear()} Shivam Bajaj. All rights reserved.
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
SHIVAM'S NEWSLETTER
===================

${post.title}

Published: ${publishDate}
${tags.length > 0 ? `Tags: ${tags.join(', ')}` : ''}

${excerpt}

Read the full article:
${postUrl}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONNECT WITH ME:
🌐 Blog: ${siteUrl}
🐦 Twitter: https://twitter.com/shivz2cool
💼 LinkedIn: https://linkedin.com/in/shivbajaj

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You're receiving this newsletter because you subscribed to updates from Shivam's blog.
Thanks for being part of our growing community of tech enthusiasts! 🚀

Unsubscribe: ${unsubscribeUrl}${subscriberEmail ? `?email=${encodeURIComponent(subscriberEmail)}` : ''}
Visit Blog: ${siteUrl}
Contact: hello@shivambajaj.com

© ${new Date().getFullYear()} Shivam Bajaj. All rights reserved.
`;

  return { html, text };
}