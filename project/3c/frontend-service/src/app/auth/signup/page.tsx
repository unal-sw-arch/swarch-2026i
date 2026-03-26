'use client';

/**
 * Sign-up page — client component (needs form state and redirect).
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

import { signup, type ApiError } from '@/lib/api';
import { userStore } from '@/lib/user-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateName(name: string): string | null {
  if (!name.trim()) return 'Display name is required.';
  if (name.trim().length < 2) return 'Name must be at least 2 characters.';
  if (name.trim().length > 50) return 'Name must be 50 characters or fewer.';
  return null;
}

function validateEmail(email: string): string | null {
  if (!email) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  return null;
}

function validateConfirm(password: string, confirm: string): string | null {
  if (!confirm) return 'Please confirm your password.';
  if (password !== confirm) return 'Passwords do not match.';
  return null;
}

// ---------------------------------------------------------------------------
// Password strength indicator
// ---------------------------------------------------------------------------

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const checks = [
    { label: '8+ chars', pass: password.length >= 8 },
    { label: 'Uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /\d/.test(password) },
    { label: 'Symbol', pass: /[^a-zA-Z\d]/.test(password) },
  ];

  const score = checks.filter((c) => c.pass).length;

  const barColor =
    score <= 1 ? 'bg-error' : score === 2 ? 'bg-tertiary-container' : score === 3 ? 'bg-secondary-container' : 'bg-primary-container';

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1 h-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-colors duration-300 ${
              i <= score ? barColor : 'bg-surface-container-high'
            }`}
          />
        ))}
      </div>
      <div className="flex gap-3 flex-wrap">
        {checks.map((c) => (
          <span
            key={c.label}
            className={`flex items-center gap-1 text-[10px] transition-colors ${
              c.pass ? 'text-primary-fixed-dim' : 'text-on-surface-variant/50'
            }`}
          >
            <CheckCircle2 className="h-2.5 w-2.5" />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirm?: string;
  }>({});

  function validate(): boolean {
    const errors: typeof fieldErrors = {};
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const confirmErr = validateConfirm(password, confirm);
    if (nameErr) errors.name = nameErr;
    if (emailErr) errors.email = emailErr;
    if (passwordErr) errors.password = passwordErr;
    if (confirmErr) errors.confirm = confirmErr;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      const user = await signup(name.trim(), email.trim().toLowerCase(), password);
      userStore.set(user);
      router.push('/');
      router.refresh();
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 409) {
        setGlobalError('An account with this email already exists. Try logging in instead.');
      } else {
        setGlobalError('Could not create your account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  function clearError(field: keyof typeof fieldErrors) {
    setFieldErrors((p) => ({ ...p, [field]: undefined }));
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-high shadow-glow-primary">
            <UserPlus className="h-5 w-5 text-primary-container" aria-hidden="true" />
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Track prices and build your wishlist.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-xl bg-surface-container ghost-border p-6 sm:p-8">
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
            {/* Display name */}
            <FormItem>
              <FormLabel htmlFor="name">Display name</FormLabel>
              <FormControl>
                <Input
                  id="name"
                  type="text"
                  placeholder="Sergeant Pixels"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); clearError('name'); }}
                  aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                  aria-invalid={Boolean(fieldErrors.name)}
                />
              </FormControl>
              <FormMessage id="name-error">{fieldErrors.name}</FormMessage>
            </FormItem>

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
                  onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  aria-invalid={Boolean(fieldErrors.email)}
                />
              </FormControl>
              <FormMessage id="email-error">{fieldErrors.email}</FormMessage>
            </FormItem>

            {/* Password */}
            <FormItem>
              <FormLabel htmlFor="password">Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                    className="pr-10"
                    aria-describedby={fieldErrors.password ? 'password-error' : 'password-hint'}
                    aria-invalid={Boolean(fieldErrors.password)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <PasswordStrength password={password} />
              <FormMessage id="password-error">{fieldErrors.password}</FormMessage>
              {!fieldErrors.password && (
                <FormDescription id="password-hint">
                  Minimum 8 characters.
                </FormDescription>
              )}
            </FormItem>

            {/* Confirm password */}
            <FormItem>
              <FormLabel htmlFor="confirm">Confirm password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    id="confirm"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); clearError('confirm'); }}
                    className="pr-10"
                    aria-describedby={fieldErrors.confirm ? 'confirm-error' : undefined}
                    aria-invalid={Boolean(fieldErrors.confirm)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                    aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage id="confirm-error">{fieldErrors.confirm}</FormMessage>
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
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Create account
                </>
              )}
            </Button>

            <p className="text-center text-xs text-on-surface-variant">
              By creating an account you agree to our{' '}
              <Link href="#" className="text-primary-fixed-dim hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="#" className="text-primary-fixed-dim hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-on-surface-variant">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="font-medium text-primary-fixed-dim hover:text-primary-container transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
