/**
 * Integration Tests for Complete Authentication Flows
 * Feature: user-authentication
 * 
 * These tests verify end-to-end authentication scenarios including
 * login, registration, logout, and session persistence.
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import React from 'react';

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
      insert: vi.fn(() => Promise.resolve({ error: null })),
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  },
}));

describe('Complete Authentication Flows', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    
    // Default mock for getSession
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as any);
  });

  /**
   * Integration Test: Complete login flow
   * Validates: Requirements 1.1, 1.2, 1.3
   * 
   * Test user enters credentials, submits form, gets redirected to dashboard.
   * Verify session is created and persisted.
   */
  test('Complete login flow - user logs in successfully', async () => {
    const testUser = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    // Mock successful login
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: {
        user: {
          id: 'test-user-id',
          email: testUser.email,
          user_metadata: { name: testUser.name },
          created_at: new Date().toISOString(),
        } as any,
        session: {
          access_token: 'valid-token',
          expires_at: Math.floor((Date.now() + 3600000) / 1000),
        } as any,
      },
      error: null,
    } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for initial loading
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Perform login
    await result.current.login(testUser.email, testUser.password);

    // Wait for login to complete
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Verify: User is authenticated
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.email).toBe(testUser.email);
    expect(result.current.user?.name).toBe(testUser.name);

    // Verify: Session is stored in localStorage
    const storedSession = localStorage.getItem('auth_session');
    expect(storedSession).not.toBeNull();
    
    const session = JSON.parse(storedSession!);
    expect(session.user.email).toBe(testUser.email);
    expect(session.accessToken).toBe('valid-token');
    expect(session.expiresAt).toBeGreaterThan(Date.now());
  });

  /**
   * Integration Test: Complete registration flow
   * Validates: Requirements 5.2, 5.4
   * 
   * Test user enters registration data, submits form, gets auto-logged in.
   * Verify account is created and user is redirected.
   */
  test('Complete registration flow - user registers and auto-logs in', async () => {
    const testUser = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
    };

    // Mock successful registration
    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
      data: {
        user: {
          id: 'new-user-id',
          email: testUser.email,
          user_metadata: { name: testUser.name },
          created_at: new Date().toISOString(),
        } as any,
        session: {
          access_token: 'new-user-token',
          expires_at: Math.floor((Date.now() + 3600000) / 1000),
        } as any,
      },
      error: null,
    } as any);

    // Mock TeamMember creation
    const mockInsert = vi.fn().mockResolvedValueOnce({ error: null });
    vi.mocked(supabase.from).mockReturnValueOnce({
      insert: mockInsert,
    } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for initial loading
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Perform registration
    await result.current.register(testUser.email, testUser.password, testUser.name);

    // Wait for registration to complete
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Verify: User is auto-logged in
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.email).toBe(testUser.email);
    expect(result.current.user?.name).toBe(testUser.name);

    // Verify: TeamMember record was created
    expect(mockInsert).toHaveBeenCalledWith({
      id: 'new-user-id',
      name: testUser.name,
      email: testUser.email,
      role: 'Developer',
    });

    // Verify: Session is stored
    const storedSession = localStorage.getItem('auth_session');
    expect(storedSession).not.toBeNull();
  });

  /**
   * Integration Test: Complete logout flow
   * Validates: Requirements 7.1, 7.2, 7.3
   * 
   * Test user clicks logout, session is cleared, redirected to login.
   * Verify protected routes are no longer accessible.
   */
  test('Complete logout flow - user logs out successfully', async () => {
    // Setup: User is logged in
    const testUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date().toISOString(),
    };

    const session = {
      user: testUser,
      accessToken: 'valid-token',
      expiresAt: Date.now() + 3600000,
    };
    localStorage.setItem('auth_session', JSON.stringify(session));

    // Mock Supabase session
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: {
        session: {
          user: {
            id: testUser.id,
            email: testUser.email,
            user_metadata: { name: testUser.name },
            created_at: testUser.createdAt,
          } as any,
          access_token: 'valid-token',
          expires_at: Math.floor((Date.now() + 3600000) / 1000),
        } as any,
      },
      error: null,
    } as any);

    // Mock successful logout
    vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({
      error: null,
    } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for session restoration
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Verify: User is initially authenticated
    expect(result.current.isAuthenticated).toBe(true);

    // Perform logout
    await result.current.logout();

    // Wait for logout to complete
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Verify: User is no longer authenticated
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();

    // Verify: Session is cleared from localStorage
    const storedSession = localStorage.getItem('auth_session');
    expect(storedSession).toBeNull();
  });

  /**
   * Integration Test: Session persistence
   * Validates: Requirements 2.2, 2.3
   * 
   * Test user logs in, refreshes page, remains authenticated.
   * Verify session is restored from localStorage.
   */
  test('Session persistence - user remains authenticated after page refresh', async () => {
    const testUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date().toISOString(),
    };

    // Setup: Valid session in localStorage
    const session = {
      user: testUser,
      accessToken: 'valid-token',
      expiresAt: Date.now() + 3600000,
    };
    localStorage.setItem('auth_session', JSON.stringify(session));

    // Mock Supabase to return valid session
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: {
        session: {
          user: {
            id: testUser.id,
            email: testUser.email,
            user_metadata: { name: testUser.name },
            created_at: testUser.createdAt,
          } as any,
          access_token: 'valid-token',
          expires_at: Math.floor((Date.now() + 3600000) / 1000),
        } as any,
      },
      error: null,
    } as any);

    // Simulate page refresh by creating new AuthProvider
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for session restoration
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Verify: User is authenticated without re-login
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.email).toBe(testUser.email);
    expect(result.current.user?.name).toBe(testUser.name);
  });

  /**
   * Integration Test: Invalid credentials handling
   * Validates: Requirements 1.4
   * 
   * Test user enters invalid credentials, receives error message.
   */
  test('Invalid credentials - login fails with error message', async () => {
    const testUser = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    // Mock failed login
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials', name: 'AuthError', status: 400 },
    } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for initial loading
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Attempt login with invalid credentials
    let errorThrown = false;
    try {
      await result.current.login(testUser.email, testUser.password);
    } catch (error) {
      errorThrown = true;
    }

    // Wait for error to be set
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Verify: Login failed
    expect(errorThrown).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.error).not.toBeNull();
  });

  /**
   * Integration Test: Expired session handling
   * Validates: Requirements 2.5
   * 
   * Test expired session is detected and cleared on app load.
   */
  test('Expired session - user is logged out on app load', async () => {
    // Setup: Expired session in localStorage
    const expiredSession = {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date().toISOString(),
      },
      accessToken: 'expired-token',
      expiresAt: Date.now() - 3600000, // 1 hour ago
    };
    localStorage.setItem('auth_session', JSON.stringify(expiredSession));

    // Mock Supabase to return no session
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: null },
      error: null,
    } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for session check
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Verify: User is not authenticated
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();

    // Verify: Session is cleared
    const storedSession = localStorage.getItem('auth_session');
    expect(storedSession).toBeNull();

    // Verify: Error is set
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.code).toBe('AUTH_SESSION_EXPIRED');
  });
});
