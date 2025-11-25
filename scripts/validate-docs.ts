#!/usr/bin/env node
/**
 * Documentation Validation Script
 * 
 * This script runs all documentation tests to ensure completeness and correctness.
 * It validates:
 * - Property-based tests for universal documentation properties
 * - Unit tests for specific documentation requirements
 * 
 * Usage:
 *   npm run validate:docs
 *   node scripts/validate-docs.ts
 * 
 * Exit codes:
 *   0 - All tests passed
 *   1 - Tests failed or error occurred
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(60));
  log(title, COLORS.bright + COLORS.cyan);
  console.log('='.repeat(60) + '\n');
}

function checkPrerequisites(): boolean {
  logSection('Checking Prerequisites');
  
  // Check if vitest config exists
  const vitestConfig = path.join(process.cwd(), 'vitest.config.docs.ts');
  if (!existsSync(vitestConfig)) {
    log('❌ vitest.config.docs.ts not found', COLORS.red);
    return false;
  }
  log('✓ vitest.config.docs.ts found', COLORS.green);
  
  // Check if tests directory exists
  const testsDir = path.join(process.cwd(), 'tests', 'docs');
  if (!existsSync(testsDir)) {
    log('❌ tests/docs directory not found', COLORS.red);
    return false;
  }
  log('✓ tests/docs directory found', COLORS.green);
  
  // Check if docs directory exists
  const docsDir = path.join(process.cwd(), 'docs');
  if (!existsSync(docsDir)) {
    log('⚠️  docs directory not found - some tests may fail', COLORS.yellow);
  } else {
    log('✓ docs directory found', COLORS.green);
  }
  
  return true;
}

function runTests(): boolean {
  logSection('Running Documentation Tests');
  
  try {
    log('Running all documentation validation tests...', COLORS.blue);
    console.log('');
    
    // Run vitest with the docs configuration
    execSync('npm run test:docs', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    
    console.log('');
    log('✓ All documentation tests passed!', COLORS.bright + COLORS.green);
    return true;
  } catch (error) {
    console.log('');
    log('❌ Documentation tests failed', COLORS.bright + COLORS.red);
    log('Please review the test output above for details', COLORS.yellow);
    return false;
  }
}

function printSummary(success: boolean) {
  logSection('Validation Summary');
  
  if (success) {
    log('✓ Documentation validation completed successfully', COLORS.bright + COLORS.green);
    log('All documentation is complete and follows standards', COLORS.green);
  } else {
    log('✗ Documentation validation failed', COLORS.bright + COLORS.red);
    log('Please fix the issues reported above', COLORS.yellow);
    log('', COLORS.reset);
    log('Common fixes:', COLORS.cyan);
    log('  - Add missing documentation for code entities', COLORS.reset);
    log('  - Document all CRUD methods in API reference', COLORS.reset);
    log('  - Ensure all routes are documented', COLORS.reset);
    log('  - Fix markdown formatting issues', COLORS.reset);
    log('  - Document all environment variables', COLORS.reset);
  }
}

// Main execution
async function main() {
  log('Documentation Validation Tool', COLORS.bright + COLORS.cyan);
  log('Backlog Pro - Agile Suite', COLORS.cyan);
  console.log('');
  
  // Check prerequisites
  if (!checkPrerequisites()) {
    log('\n❌ Prerequisites check failed', COLORS.red);
    process.exit(1);
  }
  
  // Run tests
  const success = runTests();
  
  // Print summary
  printSummary(success);
  
  // Exit with appropriate code
  process.exit(success ? 0 : 1);
}

main().catch((error) => {
  log(`\n❌ Unexpected error: ${error.message}`, COLORS.red);
  process.exit(1);
});
