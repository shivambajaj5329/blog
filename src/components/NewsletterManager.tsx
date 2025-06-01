// components/NewsletterManager.tsx - Admin interface for sending newsletters
"use client";

import { useState, useEffect } from "react";
import { getClientByEnv } from "@/lib/supabase";
import EmailPreview from "./EmailPreview";

interface NewsletterManagerProps {
  currentEnv: "dev" | "prod";
  showMessage: (text: string, type: "success" | "error" | "info") => void;
}

export default function NewsletterManager({ currentEnv, showMessage }: NewsletterManagerProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingNewsletter, setSendingNewsletter] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [newsletterHistory, setNewsletterHistory] = useState<any[]>([]);
  const [setupStatus, setSetupStatus] = useState({
    subscribersTable: false,
    sendsTable: false,
    checking: true
  });
  const [previewPost, setPreviewPost] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [currentEnv]);

  const loadData = async () => {
    setLoading(true);
    setSetupStatus(prev => ({ ...prev, checking: true }));

    try {
      const client = getClientByEnv(currentEnv);

      // Load published posts
      const { data: postsData, error: postsError } = await client
        .from("posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(10);

      if (postsError) throw postsError;

      // Debug: Log the first post to see what fields we have
      if (postsData && postsData.length > 0) {
        console.log("First post fields:", Object.keys(postsData[0]));
        console.log("First post data:", postsData[0]);
      }

      setPosts(postsData || []);

      // Load newsletter subscribers (always from prod)
      const prodClient = getClientByEnv("prod");

      // Check if subscribers table exists
      try {
        const { data: subscribersData, error: subscribersError } = await prodClient
          .from("newsletter_subscribers")
          .select("*")
          .eq("is_active", true)
          .order("subscribed_at", { ascending: false });

        if (subscribersError) {
          if (subscribersError.code === 'PGRST116') {
            // Table exists but no data
            setSetupStatus(prev => ({ ...prev, subscribersTable: true }));
            setSubscribers([]);
          } else {
            // Table doesn't exist or other error
            setSetupStatus(prev => ({ ...prev, subscribersTable: false }));
            throw subscribersError;
          }
        } else {
          setSetupStatus(prev => ({ ...prev, subscribersTable: true }));
          setSubscribers(subscribersData || []);
        }
      } catch (subscribersErr) {
        console.error("Subscribers table error:", subscribersErr);
        setSetupStatus(prev => ({ ...prev, subscribersTable: false }));
        setSubscribers([]);
      }

      // Check if newsletter sends table exists
      try {
        const { data: historyData, error: historyError } = await prodClient
          .from("newsletter_sends")
          .select("*")
          .order("sent_at", { ascending: false })
          .limit(5);

        if (historyError) {
          if (historyError.code === 'PGRST116') {
            // Table exists but no data
            setSetupStatus(prev => ({ ...prev, sendsTable: true }));
            setNewsletterHistory([]);
          } else {
            // Table doesn't exist or other error
            setSetupStatus(prev => ({ ...prev, sendsTable: false }));
            throw historyError;
          }
        } else {
          setSetupStatus(prev => ({ ...prev, sendsTable: true }));
          setNewsletterHistory(historyData || []);
        }
      } catch (historyErr) {
        console.error("Newsletter history table error:", historyErr);
        setSetupStatus(prev => ({ ...prev, sendsTable: false }));
        setNewsletterHistory([]);
      }

    } catch (error) {
      console.error("Failed to load newsletter data:", error);
      showMessage("❌ Failed to load newsletter data", "error");
    } finally {
      setLoading(false);
      setSetupStatus(prev => ({ ...prev, checking: false }));
    }
  };

  const sendNewsletter = async (post: any) => {
    if (!post) return;

    if (subscribers.length === 0) {
      showMessage("❌ No subscribers found", "error");
      return;
    }

    const confirmed = confirm(
      `Send newsletter for "${post.title}" to ${subscribers.length} subscribers?`
    );

    if (!confirmed) return;

    setSendingNewsletter(true);
    setSelectedPost(post);

    try {
      // Call your email sending API endpoint
      const response = await fetch('/api/send-newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post: {
            id: post.id,
            title: post.title,
            slug: post.slug,
            content: post.content,
            image_url: post.image_url,
            created_at: post.created_at
          },
          subscribers: subscribers.map(s => s.email),
          environment: currentEnv
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send newsletter');
      }

      const result = await response.json();

      // Record the newsletter send (only if table exists)
      if (setupStatus.sendsTable) {
        try {
          const prodClient = getClientByEnv("prod");
          await prodClient
            .from("newsletter_sends")
            .insert({
              post_id: post.id,
              post_title: post.title,
              post_slug: post.slug,
              subscriber_count: subscribers.length,
              sent_at: new Date().toISOString(),
              environment: currentEnv,
              status: 'sent'
            });
        } catch (recordError) {
          console.error("Failed to record newsletter send:", recordError);
          // Don't fail the whole operation if recording fails
        }
      }

      showMessage(`🚀 Newsletter sent to ${subscribers.length} subscribers!`, "success");
      loadData(); // Refresh data

    } catch (error) {
      console.error("Newsletter send error:", error);
      showMessage(`❌ Failed to send newsletter: ${error}`, "error");
    } finally {
      setSendingNewsletter(false);
      setSelectedPost(null);
    }
  };

  const exportSubscribers = () => {
    const csv = [
      'Email,Subscribed Date,Source',
      ...subscribers.map(s =>
        `${s.email},${new Date(s.subscribed_at).toLocaleDateString()},${s.source || 'website'}`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const closePreview = () => {
    setPreviewPost(null);
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-2 text-gray-300">Loading newsletter data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Setup Status */}
      {(!setupStatus.subscribersTable || !setupStatus.sendsTable) && !setupStatus.checking && (
        <div className="bg-yellow-600/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30">
          <h3 className="text-lg font-bold text-yellow-200 mb-4 flex items-center gap-2">
            ⚠️ Newsletter Setup Required
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${setupStatus.subscribersTable ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-gray-300">Newsletter Subscribers Table</span>
              {!setupStatus.subscribersTable && (
                <span className="text-red-300 text-sm">Missing</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${setupStatus.sendsTable ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-gray-300">Newsletter Sends Table</span>
              {!setupStatus.sendsTable && (
                <span className="text-red-300 text-sm">Missing</span>
              )}
            </div>
          </div>
          <div className="mt-4 p-4 bg-yellow-500/10 rounded-lg">
            <p className="text-sm text-yellow-200 mb-2">
              <strong>To set up the newsletter system:</strong>
            </p>
            <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
              <li>Go to your Supabase project dashboard</li>
              <li>Navigate to the SQL Editor</li>
              <li>Run the newsletter setup SQL from the setup guide</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </div>
      )}

      {/* Newsletter Stats */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          📧 Newsletter Manager
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-purple-600/20 rounded-lg p-4 border border-purple-500/30">
            <div className="text-2xl font-bold text-purple-200">{subscribers.length}</div>
            <div className="text-sm text-gray-300">Active Subscribers</div>
          </div>

          <div className="bg-green-600/20 rounded-lg p-4 border border-green-500/30">
            <div className="text-2xl font-bold text-green-200">{newsletterHistory.length}</div>
            <div className="text-sm text-gray-300">Newsletters Sent</div>
          </div>

          <div className="bg-blue-600/20 rounded-lg p-4 border border-blue-500/30">
            <div className="text-2xl font-bold text-blue-200">{posts.length}</div>
            <div className="text-sm text-gray-300">Available Posts</div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={exportSubscribers}
            className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-sm text-blue-200 transition-all duration-300"
            disabled={subscribers.length === 0}
          >
            📥 Export Subscribers
          </button>

          <button
            onClick={loadData}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm text-gray-300 transition-all duration-300"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* Recent Subscribers */}
      {subscribers.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">📝 Recent Subscribers</h3>
          <div className="space-y-2">
            {subscribers.slice(0, 5).map((subscriber, index) => (
              <div key={subscriber.id || index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">{subscriber.email}</span>
                <span className="text-sm text-gray-400">
                  {new Date(subscriber.subscribed_at).toLocaleDateString()}
                </span>
              </div>
            ))}
            {subscribers.length > 5 && (
              <div className="text-center text-gray-400 text-sm">
                + {subscribers.length - 5} more subscribers
              </div>
            )}
          </div>
        </div>
      )}

      {/* Send Newsletter */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-4">🚀 Send Newsletter</h3>

        {posts.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-2">📝</div>
            <p>No published posts available to send</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate">{post.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    <span className="text-blue-400">🏷️ {post.tags}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      console.log("🔍 Preview button clicked for post:", post);
                      console.log("🔍 Post keys:", post ? Object.keys(post) : "Post is null/undefined");
                      setPreviewPost(post);
                    }}
                    className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-sm text-blue-200 transition-all duration-300"
                    title="Preview email"
                  >
                    👁️ Preview
                  </button>
                  <button
                    onClick={() => sendNewsletter(post)}
                    disabled={sendingNewsletter || subscribers.length === 0}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      sendingNewsletter && selectedPost?.id === post.id
                        ? 'bg-yellow-600/20 border border-yellow-500/30 text-yellow-200'
                        : 'bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {sendingNewsletter && selectedPost?.id === post.id ?
                      '📤 Sending...' :
                      `📧 Send to ${subscribers.length}`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Newsletter History */}
      {newsletterHistory.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">📊 Newsletter History</h3>
          <div className="space-y-2">
            {newsletterHistory.map((send, index) => (
              <div key={send.id || index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <div>
                  <div className="text-white font-medium">{send.post_title}</div>
                  <div className="text-sm text-gray-400">
                    Sent to {send.subscriber_count} subscribers
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">
                    {new Date(send.sent_at).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-green-400">✅ {send.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Email Preview Modal with Debug Info */}
      {previewPost && (
        <div>


          <EmailPreview
            post={previewPost}
            onClose={closePreview}
          />
        </div>
      )}
    </div>
  );
}