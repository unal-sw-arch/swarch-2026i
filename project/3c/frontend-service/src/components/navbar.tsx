'use client';

import React, { useEffect, useState, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, Heart, LogIn, UserPlus, LogOut, Menu, Loader2, TrendingUp } from 'lucide-react';

import { logout, type AuthUser } from '@/lib/api';
import { userStore } from '@/lib/user-store';
import { emitRouteLoadingStart } from '@/components/route-progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Logo — warm magnifying glass with compass mark
// ---------------------------------------------------------------------------

function GameSeekerLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        'flex items-center gap-2.5 select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/50 rounded-xl',
        className,
      )}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="transition-transform duration-300 group-hover:scale-110"
      >
        <defs>
          <linearGradient id="sunsetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff9a5d" />
            <stop offset="100%" stopColor="#f9873e" />
          </linearGradient>
          <radialGradient id="lensGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff9a5d" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ff9a5d" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Lens glow */}
        <circle cx="13" cy="13" r="11" fill="url(#lensGlow)" />
        {/* Magnifying glass ring */}
        <circle cx="13" cy="13" r="8.5" stroke="url(#sunsetGrad)" strokeWidth="2" fill="none" />
        {/* Compass cardinal dots */}
        <circle cx="13" cy="7" r="1.2" fill="url(#sunsetGrad)" />
        <circle cx="13" cy="19" r="1.2" fill="url(#sunsetGrad)" />
        <circle cx="7" cy="13" r="1.2" fill="url(#sunsetGrad)" />
        <circle cx="19" cy="13" r="1.2" fill="url(#sunsetGrad)" />
        {/* Center dot */}
        <circle cx="13" cy="13" r="2" fill="url(#sunsetGrad)" />
        {/* Handle */}
        <line x1="19.5" y1="19.5" x2="26" y2="26" stroke="url(#sunsetGrad)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      <span className="font-headline font-bold text-lg text-on-surface tracking-tight leading-none">
        Game<span className="text-gradient-sunset">Seeker</span>
      </span>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Search bar
// ---------------------------------------------------------------------------

interface SearchBarProps {
  className?: string;
  onSubmit?: () => void;
}

function SearchBar({ className, onSubmit }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (pathname === '/search') {
      setQuery(searchParams.get('q') ?? '');
    }
  }, [pathname, searchParams]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    startTransition(() => {
      emitRouteLoadingStart();
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      onSubmit?.();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('relative flex items-center', className)}
    >
      <Search
        className="absolute left-3 h-4 w-4 text-on-surface-variant/60 pointer-events-none"
        aria-hidden="true"
      />
      <Input
        type="search"
        placeholder="Search games..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-9 pr-10 w-full bg-surface-container-low/80 border-outline-variant/20 focus:border-primary-container/40 focus:ring-primary-container/20 rounded-xl transition-all"
        aria-label="Search games"
        aria-busy={isPending}
      />
      {isPending && (
        <Loader2
          className="absolute right-3 h-4 w-4 animate-spin text-primary-container pointer-events-none"
          aria-hidden="true"
        />
      )}
    </form>
  );
}

// ---------------------------------------------------------------------------
// Auth section
// ---------------------------------------------------------------------------

interface AuthSectionProps {
  user: AuthUser | null;
  onLogout: () => void;
}

function AuthSection({ user, onLogout }: AuthSectionProps) {
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="text-on-surface-variant hover:text-on-surface">
          <Link href="/auth/login" className="flex items-center gap-1.5">
            <LogIn className="h-4 w-4" />
            <span>Log in</span>
          </Link>
        </Button>
        <Button size="sm" asChild className="btn-sunset rounded-xl font-headline font-semibold text-xs px-4">
          <Link href="/auth/signup" className="flex items-center gap-1.5">
            <UserPlus className="h-4 w-4" />
            <span>Sign up</span>
          </Link>
        </Button>
      </div>
    );
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="text-on-surface-variant hover:text-primary-container transition-colors"
      >
        <Link href="/wishlist" className="flex items-center gap-1.5">
          <Heart className="h-4 w-4" />
          <span className="hidden sm:inline text-xs font-body">Wishlist</span>
        </Link>
      </Button>

      <div className="flex items-center gap-2">
        <Avatar className="h-7 w-7 ring-2 ring-primary-container/30">
          {user.image && (
            <AvatarImage src={user.image} alt={user.name} />
          )}
          <AvatarFallback className="bg-surface-container-high text-on-surface-variant text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="hidden md:block text-xs text-on-surface-variant truncate max-w-[100px] font-body">
          {user.name}
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onLogout}
        aria-label="Sign out"
        className="h-7 w-7 text-on-surface-variant/50 hover:text-on-surface-variant transition-colors"
      >
        <LogOut className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mobile nav content
// ---------------------------------------------------------------------------

interface MobileNavProps {
  user: AuthUser | null;
  onLogout: () => void;
  onSearch: () => void;
}

function MobileNavContent({ user, onLogout, onSearch }: MobileNavProps) {
  return (
    <div className="flex flex-col gap-6 pt-4">
      <SearchBar className="w-full" onSubmit={onSearch} />

      <nav className="flex flex-col gap-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface hover:bg-surface-container-high transition-colors"
        >
          Home
        </Link>
        <Link
          href="/ranking"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface hover:bg-surface-container-high transition-colors"
        >
          <TrendingUp className="h-4 w-4 text-primary-container" />
          Ranking
        </Link>
        {user && (
          <Link
            href="/wishlist"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <Heart className="h-4 w-4 text-primary-container" />
            Wishlist
          </Link>
        )}
      </nav>

      <div className="pt-4 border-t border-outline-variant/10">
        {user ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 px-3">
              <Avatar className="h-9 w-9 ring-2 ring-primary-container/30">
                {user.image && (
                  <AvatarImage src={user.image} alt={user.name} />
                )}
                <AvatarFallback className="bg-surface-container-high text-on-surface-variant text-sm">
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-on-surface font-headline">
                  {user.name}
                </span>
                <span className="text-xs text-on-surface-variant font-body">
                  {user.email}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-on-surface-variant hover:text-on-surface"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Button variant="ghost" className="w-full border border-outline-variant/20 rounded-xl" asChild>
              <Link href="/auth/login">Log in</Link>
            </Button>
            <Button className="w-full btn-sunset rounded-xl font-headline" asChild>
              <Link href="/auth/signup">Sign up free</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Navbar — floating glassmorphic "hearth" bar
// ---------------------------------------------------------------------------

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setUser(userStore.get());
  }, [pathname]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } finally {
      userStore.clear();
      setUser(null);
      router.push('/');
      router.refresh();
    }
  }, [router]);

  return (
    /* Floating container — adds the outer padding so bar "floats" */
    <div className="sticky top-0 z-40 px-4 pt-3 pb-1 pointer-events-none">
      <header
        className={cn(
          'pointer-events-auto mx-auto max-w-6xl',
          'glass ghost-border rounded-2xl',
          'transition-all duration-300',
        )}
      >
        <div className="flex h-14 items-center gap-4 px-4 sm:px-5">
          {/* Logo */}
          <GameSeekerLogo className="shrink-0" />

          {/* Desktop search */}
          <div className="hidden md:flex flex-1 max-w-sm mx-auto">
            <SearchBar className="w-full" />
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-2 mr-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-on-surface-variant hover:text-primary-container transition-colors"
            >
              <Link href="/ranking" className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-body">Ranking</span>
              </Link>
            </Button>
          </div>

          {/* Spacer for mobile */}
          <div className="flex-1 md:hidden" />

          {/* Desktop auth */}
          <div className="hidden md:flex items-center">
            <AuthSection user={user} onLogout={handleLogout} />
          </div>

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8 text-on-surface-variant"
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-surface-container-low border-outline-variant/15">
              <SheetHeader>
                <SheetTitle>
                  <GameSeekerLogo />
                </SheetTitle>
              </SheetHeader>
              <MobileNavContent
                user={user}
                onLogout={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                onSearch={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </div>
  );
}
