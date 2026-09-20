'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ReaderAuthModal } from './ReaderAuthModal';

export const AccountDropdown: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string; name?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    const fetchSession = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          const u = data.user;
          setUser({
            id: u.id,
            email: u.email,
            name: (u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0]) as string,
          });

          // Check admin status from profiles or email
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
      } catch {
        setUser(null);
        setIsAdmin(false);
      }
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: (session.user.user_metadata?.full_name || session.user.email?.split('@')[0]) as string,
        });
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      setIsAdmin(false);
      setIsDropdownOpen(false);
      router.refresh();
    } catch {
      // ignore
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {user ? (
        <button
          type="button"
          id="account-menu-button"
          aria-label="User Account Menu"
          aria-expanded={isDropdownOpen}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-1.5 p-1 hover:text-accent-orange transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange rounded cursor-pointer"
        >
          <span className="w-6 h-6 rounded-full bg-accent-orange text-white text-[11px] font-bold flex items-center justify-center shrink-0">
            {getInitials(user.name, user.email)}
          </span>
          <span className="material-symbols-outlined text-[16px] text-secondary">
            {isDropdownOpen ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      ) : (
        <button
          type="button"
          id="reader-signin-button"
          aria-label="Sign In or Register"
          onClick={() => {
            setAuthModalMode('signin');
            setIsAuthModalOpen(true);
          }}
          className="p-1 hover:text-accent-orange transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange rounded cursor-pointer"
          title="Sign in to save stories"
        >
          <svg
            className="w-4 h-4 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      )}

      {/* Popover Dropdown Menu */}
      {isDropdownOpen && user && (
        <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-xl py-2 z-50 text-xs text-on-surface animate-in fade-in zoom-in-95 duration-100">
          <div className="px-4 py-2 border-b border-outline-variant/20">
            <div className="font-bold truncate">{user.name || 'Reader'}</div>
            <div className="text-[11px] text-secondary truncate">{user.email}</div>
          </div>

          <div className="py-1">
            <Link
              href="/bookmarks"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 hover:bg-surface-container hover:text-accent-orange transition-colors font-medium"
            >
              <span className="material-symbols-outlined text-[18px] text-accent-orange">
                bookmark
              </span>
              <span>My Bookmarks</span>
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 hover:bg-surface-container hover:text-accent-orange transition-colors font-medium"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  admin_panel_settings
                </span>
                <span>Admin Dashboard</span>
              </Link>
            )}
          </div>

          <div className="border-t border-outline-variant/20 pt-1">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors font-medium cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <ReaderAuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
};
