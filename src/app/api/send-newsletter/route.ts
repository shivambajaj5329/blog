// app/api/send-newsletter/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generateNewsletterTemplate } from '@/lib/email-template';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Your domain for the newsletter
const SITE_URL = process.env.NODE_ENV === 'production'
  ? 'https://shivambajaj.com'
  : 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const { post, subscribers, environment } = await request.json();

    if (!post || !subscribers || !Array.isArray(subscribers)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: 'No subscribers provided' },
        { status: 400 }
      );
    }

    // Create URLs
    const postUrl = `${SITE_URL}/blog/${post.slug}`;
    const unsubscribeUrl = `${SITE_URL}/unsubscribe`;

    console.log(`📧 Sending newsletter to ${subscribers.length} subscribers...`);

    // Send emails using Resend
    const emailPromises = subscribers.map(async (email: string) => {
      try {
        // Generate personalized email template
        const { html: emailHtml, text: emailText } = generateNewsletterTemplate({
          post,
          postUrl,
          unsubscribeUrl,
          siteUrl: SITE_URL,
          subscriberEmail: email
        });

        const result = await resend.emails.send({
          from: process.env.NEWSLETTER_FROM_EMAIL || 'Shivam <newsletter@shivambajaj.com>',
          to: email,
          subject: `📝 New Post: ${post.title}`,
          html: emailHtml,
          text: emailText,
          headers: {
            'List-Unsubscribe': `<${unsubscribeUrl}?email=${encodeURIComponent(email)}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
          tags: [
            {
              name: 'campaign',
              value: 'newsletter'
            },
            {
              name: 'environment',
              value: environment
            },
            {
              name: 'post_slug',
              value: post.slug
            }
          ]
        });

        return { email, status: 'sent', id: result.data?.id };
      } catch (error) {
        console.error(`Failed to send to ${email}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { email, status: 'failed', error: errorMessage };
      }
    });

    // Send all emails
    const results = await Promise.allSettled(emailPromises);

    const successful = results.filter(r =>
      r.status === 'fulfilled' && r.value.status === 'sent'
    ).length;

    const failed = results.filter(r =>
      r.status === 'rejected' || (r.status === 'fulfilled' && r.value.status === 'failed')
    ).length;

    console.log(`✅ Newsletter sending complete: ${successful} sent, ${failed} failed`);

    return NextResponse.json({
      success: true,
      sent: successful,
      failed: failed,
      total: subscribers.length,
      details: results.map(r =>
        r.status === 'fulfilled' ? r.value : { status: 'failed', error: 'Promise rejected' }
      )
    });

  } catch (error) {
    console.error('Newsletter API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to send newsletter: ${errorMessage}` },
      { status: 500 }
    );
  }
}