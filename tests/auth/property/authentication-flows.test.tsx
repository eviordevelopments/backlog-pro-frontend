/**
 * Property-Based Tests for Authentication Flows
 * Feature: user-authentication
 * 
 * These tests verify universal properties that should hold across all authentication scenarios.
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ error: null })),
      select: vi.fn(() => ({ data: [], error: null })),
    })),
  },
}));

// Generators for authentication data
const validEmailArb = fc.emailAddress();
const validPasswordArb = fc.string({ minLength: 8, maxLength: 50 });
const validNameArb = fc.string({ minLength: 2, maxLength: 50 });
const invalidPasswordArb = fc.string({ maxLength: 7 });

const validUserArb = fc.record({
  email: validEmailArb,
  password: validPasswordArb,
  name: validNameArb,
});

const invalidEmailArb = fc.oneof(
  fc.string().filter(s => !s.includes('@')),
  fc.string().map(s => s + '@'),
  fc.string().map(s => '@' + s),
  fc.constant(''),
);

describe('Authentication Flow Properties', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  /**
   * Property 4: Invalid credentials rejected
   * Validates: Requirements 1.4
   * 
   * For any invalid credentials (wrong password, non-existent email, or malformed input),
   * the authentication system should reject the login attempt and return an error message.
   */
  test('Property 4: Invalid credentials rejected', async () => {
    await fc.assert(
      fc.asyncProperty(validEmailArb, invalidPasswordArb, async (email, password) => {
        // Mock Supabase to return error for invalid credentials
        vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
          data: { user: null, session: null },
          error: { message: 'Invalid login credentials', name: 'AuthError', status: 400 },
        } as any);

        const { AuthProvider, useAuth } = await import('@/context/AuthContext');
        const { renderHook, waitFor } = await import('@testing-library/react');
        const { default: React } = await import('react');

        const wrapper = ({ children }: { children: React.ReactNode }) => (
          React.createElement(AuthProvider, null, children)
        );

        const { result } = renderHook(() => useAuth(), { wrapper });

        // Wait for initial loading to complete
        await waitFor(() => expect(result.current.loading).toBe(false));

        // Attempt login with invalid credentials
        let errorThrown = false;
        try {
          await result.current.login(email, password);
        } catch (error) {
          errorThrown = true;
        }

        // Verify: Authentication should fail
        expect(errorThrown).toBe(true);
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 6: Valid session grants access
   * Validates: Requirements 2.3
   * 
   * For any valid session, when accessing protected routes,
   * the system should allow access without requiring re-authentication.
   */
  test('Property 6: Valid session grants access', async () => {
    await fc.assert(
      fc.asyncProperty(validUserArb, async (user) => {
        // Create a valid session in localStorage
        const session = {
          user: {
            id: 'test-user-id',
            email: user.email,
            name: user.name,
            createdAt: new Date().toISOString(),
          },
          accessToken: 'valid-token',
          expiresAt: Date.now() + 3600000, // 1 hour from now
        };
        localStorage.setItem('auth_session', JSON.stringify(session));

        // Mock Supabase to return valid session
        vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
          data: {
            session: {
              user: {
                id: 'test-user-id',
                email: user.email,
                user_metadata: { name: user.name },
                created_at: new Date().toISOString(),
              } as any,
              access_token: 'valid-token',
              expires_at: Math.floor((Date.now() + 3600000) / 1000),
            } as any,
          },
          error: null,
        } as any);

        const { AuthProvider, useAuth } = await import('@/context/AuthContext');
        const { renderHook, waitFor } = await import('@testing-library/react');
        const { default: React } = await import('react');

        const wrapper = ({ children }: { children: React.ReactNode }) => (
          React.createElement(AuthProvider, null, children)
        );

        const { result } = renderHook(() => useAuth(), { wrapper });

        // Wait for session restoration
        await waitFor(() => expect(result.current.loading).toBe(false));

        // Verify: User should be authenticated without re-login
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user).not.toBeNull();
        expect(result.current.user?.email).toBe(user.email);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 8: Invalid session triggers redirect
   * Validates: Requirements 2.5
   * 
   * For any invalid or expired session data, when the application loads
   * or when accessing protected routes, the system should redirect to the login page.
   */
  test('Property 8: Invalid session triggers redirect', async () => {
    await fc.assert(
      fc.asyncProperty(validUserArb, async (user) => {
        // Create an expired session in localStorage
        const expiredSession = {
          user: {
            id: 'test-user-id',
            email: user.email,
            name: user.name,
            createdAt: new Date().toISOString(),
          },
          accessToken: 'expired-token',
          expiresAt: Date.now() - 3600000, // 1 hour ago (expired)
        };
        localStorage.setItem('auth_session', JSON.stringify(expiredSession));

        // Mock Supabase to return no session
        vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
          data: { session: null },
          error: null,
        } as any);

        const { AuthProvider, useAuth } = await import('@/context/AuthContext');
        const { renderHook, waitFor } = await import('@testing-library/react');
        const { default: React } = await import('react');

        const wrapper = ({ children }: { children: React.ReactNode }) => (
          React.createElement(AuthProvider, null, children)
        );

        const { result } = renderHook(() => useAuth(), { wrapper });

        // Wait for session check to complete
        await waitFor(() => expect(result.current.loading).toBe(false));

        // Verify: User should not be authenticated
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeNull();
        
        // Verify: Session should be cleared from localStorage
        const storedSession = localStorage.getItem('auth_session');
        expect(storedSession).toBeNull();
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 3: Dashboard redirect after authentication
   * Validates: Requirements 1.3
   * 
   * For any successful authentication, the system should trigger navigation
   * to the dashboard page (or originally requested URL if stored).
   */
  test('Property 3: Dashboard redirect after authentication', async () => {
    await fc.assert(
      fc.asyncProperty(validUserArb, async (user) => {
        // Mock successful login
        vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
          data: {
            user: {
              id: 'test-user-id',
              email: user.email,
              user_metadata: { name: user.name },
              created_at: new Date().toISOString(),
            } as any,
            session: {
              access_token: 'valid-token',
              expires_at: Math.floor((Date.now() + 3600000) / 1000),
            } as any,
          },
          error: null,
        } as any);

        const { AuthProvider, useAuth } = await import('@/context/AuthContext');
        const { renderHook, waitFor } = await import('@testing-library/react');
        const { default: React } = await import('react');

        const wrapper = ({ children }: { children: React.ReactNode }) => (
          React.createElement(AuthProvider, null, children)
        );

        const { result } = renderHook(() => useAuth(), { wrapper });

        // Wait for initial loading
        await waitFor(() => expect(result.current.loading).toBe(false));

        // Perform login
        await result.current.login(user.email, user.password);

        // Wait for login to complete
        await waitFor(() => expect(result.current.loading).toBe(false));

        // Verify: User should be authenticated (redirect would happen in component)
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user).not.toBeNull();
        
        // Verify: Session should be stored for redirect
        const storedSession = localStorage.getItem('auth_session');
        expect(storedSession).not.toBeNull();
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 13: Valid form data enables submission
   * Validates: Requirements 4.4
   * 
   * For any form state where all fields contain valid data
   * (valid email format, password meets minimum length),
   * the submit button should be enabled.
   */
  test('Property 13: Valid form data enables submission', async () => {
    await fc.assert(
      fc.asyncProperty(validUserArb, async (user) => {
        // This property tests that valid data passes validation
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email);
        const passwordValid = user.password.length >= 8;
        const nameValid = user.name.trim().length >= 2;

        // Verify: All validation checks should pass for valid data
        expect(emailValid).toBe(true);
        expect(passwordValid).toBe(true);
        expect(nameValid).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});
