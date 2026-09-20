'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ReaderAuthModal } from '../auth/ReaderAuthModal';

interface CommentItem {
  id: string;
  user_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

interface CommentSectionProps {
  postId: string;
  postTitle?: string;
}

// Basic profanity and spam blocklist
const SPAM_PATTERNS = [
  /viagra/i,
  /casino/i,
  /crypto\s*airdrop/i,
  /telegram.*@/i,
  /whatsapp.*[0-9]{8,}/i,
  /free\s*bitcoin/i,
  /\b(fuck|shit|bitch|asshole|cunt)\b/i,
];

export const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [user, setUser] = useState<{ id: string; email?: string; name?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Submission state
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  // Auth modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const fetchComments = async () => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      // 1. Current user
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const u = userData.user;
        setUser({
          id: u.id,
          email: u.email,
          name: (u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0]) as string,
        });

        // Admin check
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', u.id)
          .maybeSingle();

        if (profile?.role === 'admin' || u.email === 'bazighchohan@gmail.com') {
          setIsAdmin(true);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }

      // 2. Fetch comments for post
      const { data, error } = await supabase
        .from('comments')
        .select('id, user_id, author_name, content, created_at')
        .eq('post_id', postId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      if (error) {
        // Fallback to local storage if comments table has not been migrated yet
        try {
          const local = JSON.parse(localStorage.getItem(`vg_comments_${postId}`) || '[]');
          setComments(local);
        } catch {
          setComments([]);
        }
      } else if (data) {
        setComments(data as CommentItem[]);
      }
    } catch {
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchComments();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [postId]);

  // Rate limiter cooldown countdown timer
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  const validateComment = (text: string): string | null => {
    const trimmed = text.trim();
    if (trimmed.length < 10) {
      return 'Comments must be at least 10 characters long.';
    }
    if (trimmed.length > 1000) {
      return 'Comments cannot exceed 1,000 characters.';
    }
    for (const pattern of SPAM_PATTERNS) {
      if (pattern.test(trimmed)) {
        return 'Your comment contains prohibited spam or inappropriate phrasing.';
      }
    }
    return null;
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    // Rate limiting: 30-second cooldown per user
    const lastTimestamp = parseInt(localStorage.getItem(`vg_last_comment_${user.id}`) || '0', 10);
    const now = Date.now();
    const timeSinceLast = (now - lastTimestamp) / 1000;
    if (timeSinceLast < 30) {
      const remaining = Math.ceil(30 - timeSinceLast);
      setCooldownRemaining(remaining);
      setErrorMessage(`Please wait ${remaining} seconds before submitting another comment.`);
      return;
    }

    const validationError = validateComment(newComment);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const authorName = user.name || user.email?.split('@')[0] || 'Reader';
    const cleanContent = newComment.trim();

    try {
      const supabase = createClient();
      const payload = {
        post_id: postId,
        user_id: user.id,
        author_name: authorName,
        content: cleanContent,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase.from('comments').insert([payload]).select().single();

      if (error) {
        // Fallback: save to localStorage if table not yet migrated
        const localComment: CommentItem = {
          id: `local-${Date.now()}`,
          user_id: user.id,
          author_name: authorName,
          content: cleanContent,
          created_at: new Date().toISOString(),
        };
        const local = JSON.parse(localStorage.getItem(`vg_comments_${postId}`) || '[]');
        local.push(localComment);
        localStorage.setItem(`vg_comments_${postId}`, JSON.stringify(local));
        setComments(local);
      } else if (data) {
        setComments((prev) => [...prev, data as CommentItem]);
      }

      // Record rate limit timestamp
      localStorage.setItem(`vg_last_comment_${user.id}`, Date.now().toString());
      setCooldownRemaining(30);

      setNewComment('');
      setSuccessMessage('Comment published successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setErrorMessage('Failed to publish comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    // Optimistic removal
    setComments((prev) => prev.filter((c) => c.id !== commentId));

    try {
      const supabase = createClient();
      await supabase
        .from('comments')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', commentId);

      // Local storage fallback
      const local = JSON.parse(localStorage.getItem(`vg_comments_${postId}`) || '[]');
      const filtered = local.filter((c: CommentItem) => c.id !== commentId);
      localStorage.setItem(`vg_comments_${postId}`, JSON.stringify(filtered));
    } catch {
      // ignore
    }
  };

  return (
    <section className="mt-14 pt-10 border-t border-outline-variant/30" id="comments-section">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-[11px] font-black uppercase tracking-[0.08em] text-accent-orange block mb-1 font-label-sm">
            Reader Discussion
          </span>
          <h2 className="font-headline-md text-2xl sm:text-3xl font-bold text-on-surface">
            Editorial Perspectives &amp; Discourse ({comments.length})
          </h2>
        </div>
      </div>

      {/* Submission Box */}
      <div className="mb-10 p-6 rounded-2xl bg-surface-container-low border border-outline-variant/40">
        {user ? (
          <form onSubmit={handlePostComment} className="space-y-3">
            <div className="flex items-center justify-between text-xs text-secondary">
              <span>
                Commenting as <strong className="text-on-surface">{user.name || user.email}</strong>
              </span>
              <span className={newComment.length > 900 ? 'text-amber-500 font-bold' : ''}>
                {newComment.length}/1,000 characters
              </span>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {successMessage}
              </div>
            )}

            <label htmlFor="comment-content" className="sr-only">
              Add your comment
            </label>
            <textarea
              id="comment-content"
              name="comment"
              rows={3}
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Add your verified insight, post-mortem analysis, or operational feedback..."
              className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/50 rounded-xl text-xs text-on-surface placeholder:text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-secondary">
                {cooldownRemaining > 0 && `Rate limit active: ${cooldownRemaining}s cooldown`}
              </span>
              <button
                type="submit"
                disabled={isSubmitting || cooldownRemaining > 0 || newComment.trim().length < 10}
                className="px-5 py-2.5 bg-accent-orange text-white text-xs font-extrabold uppercase tracking-wider rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Transmitting...</span>
                  </>
                ) : (
                  <span>Post Perspective</span>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4 space-y-2">
            <h3 className="font-bold text-sm text-on-surface">
              Join the Verified Founder &amp; Investor Discussion
            </h3>
            <p className="text-xs text-secondary max-w-md mx-auto">
              Sign in or create a reader account to share post-mortem commentary and engage with the startup community.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="px-5 py-2 bg-accent-orange text-white text-xs font-extrabold uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
              >
                Sign In to Comment
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="py-8 text-center text-xs text-secondary">
          Loading discussion...
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-outline-variant/40 rounded-2xl p-6 text-xs text-secondary space-y-1">
          <p className="font-semibold text-on-surface">No comments on this story yet.</p>
          <p>Be the first founder or investor to contribute an analysis.</p>
        </div>
      ) : (
        <div className="space-y-4 divide-y divide-outline-variant/20">
          {comments.map((comment) => {
            const isOwner = user && (user.id === comment.user_id || isAdmin);
            const initial = comment.author_name ? comment.author_name.charAt(0).toUpperCase() : 'U';

            return (
              <div key={comment.id} className="pt-4 first:pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold text-accent-orange border border-outline-variant/30">
                      {initial}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-on-surface">
                        {comment.author_name}
                      </div>
                      <div className="text-[10px] text-secondary">
                        {new Date(comment.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>

                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                      aria-label="Delete comment"
                      className="text-secondary hover:text-red-500 p-1 text-[11px] font-semibold transition-colors flex items-center gap-0.5 cursor-pointer"
                      title="Delete your comment"
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                      <span>Delete</span>
                    </button>
                  )}
                </div>

                <p className="text-xs text-on-surface-variant leading-relaxed pl-9 whitespace-pre-line">
                  {comment.content}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Auth Modal */}
      <ReaderAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="signin"
        onSuccess={() => {
          setIsAuthModalOpen(false);
          fetchComments();
        }}
      />
    </section>
  );
};
