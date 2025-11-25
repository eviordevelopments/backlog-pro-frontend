import { describe, it, expect } from 'vitest';
import { parseTypeScriptFile } from './typescript-parser';
import { parseAppContext } from './context-parser';
import { parseRoutes } from './routing-parser';
import { parsePackageScripts } from './package-parser';
import { parseWorkflowFiles } from './workflow-parser';
import { isKebabCase } from './markdown-validator';
import { extractEnvVariables } from './env-parser';

describe('Documentation Validation Utilities - Smoke Tests', () => {
  it('should parse TypeScript interfaces', () => {
    const result = parseTypeScriptFile('src/types/index.ts');
    expect(result.interfaces).toBeDefined();
    expect(result.interfaces.length).toBeGreaterThan(0);
    expect(result.interfaces.some(i => i.name === 'Task')).toBe(true);
  });

  it('should parse AppContext CRUD methods', () => {
    const methods = parseAppContext('src/context/AppContext.tsx');
    expect(methods).toBeDefined();
    expect(methods.length).toBeGreaterThan(0);
    expect(methods.some(m => m.name === 'addTask')).toBe(true);
    expect(methods.some(m => m.name === 'updateTask')).toBe(true);
    expect(methods.some(m => m.name === 'deleteTask')).toBe(true);
  });

  it('should parse routes from App.tsx', () => {
    const routes = parseRoutes('src/App.tsx');
    expect(routes).toBeDefined();
    expect(routes.length).toBeGreaterThan(0);
    expect(routes.some(r => r.path === '/')).toBe(true);
    expect(routes.some(r => r.path === '/tasks')).toBe(true);
  });

  it('should parse package.json scripts', () => {
    const scripts = parsePackageScripts('package.json');
    expect(scripts).toBeDefined();
    expect(scripts.length).toBeGreaterThan(0);
    expect(scripts.some(s => s.name === 'dev')).toBe(true);
    expect(scripts.some(s => s.name === 'build')).toBe(true);
  });

  it('should parse workflow files', () => {
    const workflows = parseWorkflowFiles('.github/workflows');
    expect(workflows).toBeDefined();
    // Workflows may or may not exist, so just check it returns an array
    expect(Array.isArray(workflows)).toBe(true);
  });

  it('should validate kebab-case filenames', () => {
    expect(isKebabCase('api-reference.md')).toBe(true);
    expect(isKebabCase('system-architecture.md')).toBe(true);
    expect(isKebabCase('ApiReference.md')).toBe(false);
    expect(isKebabCase('api_reference.md')).toBe(false);
  });

  it('should extract environment variables', () => {
    const envVars = extractEnvVariables('src');
    expect(envVars).toBeDefined();
    expect(Array.isArray(envVars)).toBe(true);
    // May or may not have env vars, just check it works
  });
});
