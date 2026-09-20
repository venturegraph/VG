'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ReaderAuthModal } from './auth/ReaderAuthModal';

interface BookmarkButtonProps {
  postId: string;
  postTitle?: string;
  slug?: string;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({ postId }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    const checkBookmarkStatus = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          if (isMounted) {
            setUserId(null);
            setIsLoading(false);
          }
          return;
        }

        const currentUserId = userData.user.id;
        if (isMounted) setUserId(currentUserId);

        const { data, error } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', currentUserId)
          .eq('post_id', postId)
          .maybeSingle();

        if (error) {
          // Table may not exist yet or offline fallback
          try {
            const local = JSON.parse(localStorage.getItem(`vg_bm_${currentUserId}`) || '[]');
            if (isMounted) setIsBookmarked(local.includes(postId));
          } catch {
            // ignore
          }
        } else if (isMounted) {
          setIsBookmarked(!!data);
        }
      } catch {
        // ignore
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    checkBookmarkStatus();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        checkBookmarkStatus();
      } else {
        setUserId(null);
        setIsBookmarked(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [postId]);

  const toggleBookmark = async () => {
    if (!userId) {
      setIsAuthModalOpen(true);
      return;
    }

    const nextState = !isBookmarked;
    setIsBookmarked(nextState);

    try {
      const supabase = createClient();

      if (nextState) {
        const { error } = await supabase
          .from('bookmarks')
          .insert([{ user_id: userId, post_id: postId }]);

        if (error) {
          // Fallback to local storage if table hasn't been migrated yet
          const local = JSON.parse(localStorage.getItem(`vg_bm_${userId}`) || '[]');
          if (!local.includes(postId)) {
            local.push(postId);
            localStorage.setItem(`vg_bm_${userId}`, JSON.stringify(local));
          }
        }
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('post_id', postId);

        if (error) {
          const local = JSON.parse(localStorage.getItem(`vg_bm_${userId}`) || '[]');
          const filtered = local.filter((id: string) => id !== postId);
          localStorage.setItem(`vg_bm_${userId}`, JSON.stringify(filtered));
        }
      }
    } catch {
      // rollback state if error
      setIsBookmarked(!nextState);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark story'}
        title={isBookmarked ? 'Saved to bookmarks' : 'Save to bookmarks'}
        onClick={toggleBookmark}
        disabled={isLoading}
        className={`p-1.5 rounded transition-all duration-200 cursor-pointer flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange ${
          isBookmarked
            ? 'text-accent-orange bg-accent-orange/10 hover:bg-accent-orange/20'
            : 'hover:bg-surface-container hover:text-on-surface text-secondary'
        }`}
      >
        <span className="material-symbols-outlined text-[18px]">
          {isBookmarked ? 'bookmark' : 'bookmark_border'}
        </span>
      </button>

      <ReaderAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="signin"
        onSuccess={() => {
          setIsAuthModalOpen(false);
          toggleBookmark();
        }}
      />
    </>
  );
};
