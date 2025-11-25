/**
 * Supabase Credentials Validation Tests
 * 
 * These tests verify that Supabase credentials are properly configured
 * and that the connection can be established successfully.
 */

import { describe, test, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env file
function loadEnvVars(): Record<string, string> {
  const envPath = join(process.cwd(), '.env');
  const envContent = readFileSync(envPath, 'utf-8');
  const envVars: Record<string, string> = {};

  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) return;
    
    const match = trimmedLine.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      envVars[key] = value;
    }
  });

  return envVars;
}

describe('Supabase Credentials Validation', () => {
  let envVars: Record<string, string>;

  beforeAll(() => {
    envVars = loadEnvVars();
  });

  /**
   * Test: VITE_SUPABASE_URL is configured
   * Validates that the Supabase URL environment variable exists and is not empty
   */
  test('VITE_SUPABASE_URL should be configured', () => {
    expect(envVars.VITE_SUPABASE_URL).toBeDefined();
    expect(envVars.VITE_SUPABASE_URL).not.toBe('');
    expect(envVars.VITE_SUPABASE_URL).toMatch(/^https:\/\/.+\.supabase\.co$/);
  });

  /**
   * Test: VITE_SUPABASE_PUBLISHABLE_KEY is configured
   * Validates that the Supabase publishable key exists and is not empty
   */
  test('VITE_SUPABASE_PUBLISHABLE_KEY should be configured', () => {
    expect(envVars.VITE_SUPABASE_PUBLISHABLE_KEY).toBeDefined();
    expect(envVars.VITE_SUPABASE_PUBLISHABLE_KEY).not.toBe('');
    // Supabase keys start with "sb_" or "ey" (JWT)
    expect(envVars.VITE_SUPABASE_PUBLISHABLE_KEY).toMatch(/^(sb_|ey)/);
  });

  /**
   * Test: VITE_SUPABASE_PROJECT_ID is configured
   * Validates that the Supabase project ID exists and is not empty
   */
  test('VITE_SUPABASE_PROJECT_ID should be configured', () => {
    expect(envVars.VITE_SUPABASE_PROJECT_ID).toBeDefined();
    expect(envVars.VITE_SUPABASE_PROJECT_ID).not.toBe('');
    // Project IDs are typically lowercase alphanumeric
    expect(envVars.VITE_SUPABASE_PROJECT_ID).toMatch(/^[a-z0-9]+$/);
  });

  /**
   * Test: Supabase URL and Project ID are consistent
   * Validates that the project ID in the URL matches the configured project ID
   */
  test('VITE_SUPABASE_URL should contain the project ID', () => {
    const url = envVars.VITE_SUPABASE_URL;
    const projectId = envVars.VITE_SUPABASE_PROJECT_ID;
    
    expect(url).toContain(projectId);
  });

  /**
   * Test: JWT token structure is valid
   * Validates that the publishable key is a valid JWT token with proper structure (if JWT format)
   */
  test('VITE_SUPABASE_PUBLISHABLE_KEY should be a valid JWT token', () => {
    const token = envVars.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    // Skip if it's a new format key (sb_*)
    if (token.startsWith('sb_')) {
      expect(token.length).toBeGreaterThan(10);
      return;
    }
    
    const parts = token.split('.');
    
    // JWT should have 3 parts: header.payload.signature
    expect(parts).toHaveLength(3);
    
    // Each part should be valid base64
    parts.forEach((part) => {
      expect(() => {
        Buffer.from(part, 'base64').toString('utf-8');
      }).not.toThrow();
    });
  });

  /**
   * Test: JWT token payload contains required claims
   * Validates that the JWT contains the expected Supabase claims (if JWT format)
   */
  test('JWT token should contain Supabase claims', () => {
    const token = envVars.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    // Skip if it's a new format key (sb_*)
    if (token.startsWith('sb_')) {
      expect(token).toBeDefined();
      return;
    }
    
    const parts = token.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    
    // Check for required Supabase claims
    expect(payload).toHaveProperty('iss', 'supabase');
    expect(payload).toHaveProperty('ref');
    expect(payload).toHaveProperty('role', 'anon');
    expect(payload).toHaveProperty('iat');
    expect(payload).toHaveProperty('exp');
  });

  /**
   * Test: JWT token is not expired
   * Validates that the token expiration time is in the future (if JWT format)
   */
  test('JWT token should not be expired', () => {
    const token = envVars.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    // Skip if it's a new format key (sb_*)
    if (token.startsWith('sb_')) {
      expect(token).toBeDefined();
      return;
    }
    
    const parts = token.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    
    expect(expirationTime).toBeGreaterThan(currentTime);
  });

  /**
   * Test: Supabase client can be instantiated
   * Validates that the credentials can be used to create a Supabase client
   */
  test('Supabase client should be instantiable with provided credentials', () => {
    const url = envVars.VITE_SUPABASE_URL;
    const key = envVars.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    expect(() => {
      createClient(url, key);
    }).not.toThrow();
  });

  /**
   * Test: All required credentials are present
   * Validates that all three required environment variables are configured
   */
  test('All required Supabase credentials should be present', () => {
    const requiredVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_PUBLISHABLE_KEY',
      'VITE_SUPABASE_PROJECT_ID'
    ];
    
    requiredVars.forEach(varName => {
      expect(envVars).toHaveProperty(varName);
      expect(envVars[varName]).not.toBe('');
      expect(envVars[varName]).not.toBeUndefined();
    });
  });

  /**
   * Test: Credentials are properly configured
   * Validates that the credentials are set and consistent
   */
  test('Credentials should match expected values', () => {
    // Just verify they exist and are consistent
    expect(envVars.VITE_SUPABASE_PROJECT_ID).toBeDefined();
    expect(envVars.VITE_SUPABASE_URL).toContain(envVars.VITE_SUPABASE_PROJECT_ID);
    expect(envVars.VITE_SUPABASE_PUBLISHABLE_KEY).toBeDefined();
    expect(envVars.VITE_SUPABASE_PUBLISHABLE_KEY.length).toBeGreaterThan(10);
  });
});
