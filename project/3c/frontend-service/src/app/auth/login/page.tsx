'use client';

/**
 * Login page — client component (needs form state and redirect).
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

import { login, type ApiError } from '@/lib/api';
import { userStore } from '@/lib/user-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

// ---------------------------------------------------------------------------
// Field-level validation helpers
// ---------------------------------------------------------------------------

function validateEmail(email: string): string | null {
  if (!email) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return 'Password is required.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return null;
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  function validate(): boolean {
    const errors: typeof fieldErrors = {};
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    if (emailErr) errors.email = emailErr;
    if (passwordErr) errors.password = passwordErr;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      const user = await login(email.trim().toLowerCase(), password);
      userStore.set(user);
      router.push('/');
      router.refresh();
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 401 || apiErr.status === 403) {
        setGlobalError('Invalid email or password. Please try again.');
      } else {
        setGlobalError('Something went wrong. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      {/* Card */}
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-high shadow-glow-primary">
            <LogIn className="h-5 w-5 text-primary-container" aria-hidden="true" />
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Sign in to access your wishlist and price alerts.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-xl bg-surface-container ghost-border p-6 sm:p-8">
          {/* Global error */}
          {globalError && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-lg bg-error-container/15 border border-error/20 px-4 py-3"
            >
              <AlertCircle className="h-4 w-4 text-error shrink-0 mt-0.5" />
              <p className="text-sm text-error">{globalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {/* Email */}
            <FormItem>
              <FormLabel htmlFor="email">Email address</FormLabel>
              <FormControl>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
                  }}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  aria-invalid={Boolean(fieldErrors.email)}
                />
              </FormControl>
              <FormMessage id="email-error">{fieldErrors.email}</FormMessage>
            </FormItem>

            {/* Password */}
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel htmlFor="password">Password</FormLabel>
                <Link
                  href="#"
                  className="text-xs text-primary-fixed-dim hover:text-primary-container transition-colors"
                  tabIndex={0}
                >
                  Forgot password?
                </Link>
              </div>
              <FormControl>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
                    }}
                    className="pr-10"
                    aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                    aria-invalid={Boolean(fieldErrors.password)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage id="password-error">{fieldErrors.password}</FormMessage>
            </FormItem>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              className="w-full mt-1"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="mr-2 h-4 w-4 rounded-full border-2 border-primary-on-container/30 border-t-primary-on-container animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-1" />
                  Sign in
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Switch to sign up */}
        <p className="mt-5 text-center text-sm text-on-surface-variant">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/signup"
            className="font-medium text-primary-fixed-dim hover:text-primary-container transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
