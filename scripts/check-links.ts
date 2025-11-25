#!/usr/bin/env node
/**
 * Documentation Link Checker
 * 
 * This script validates all internal links in markdown documentation files.
 * It checks:
 * - Relative links to other markdown files
 * - Relative links to code files
 * - Anchor links within documents
 * 
 * Usage:
 *   npm run check:links
 *   node scripts/check-links.ts
 * 
 * Exit codes:
 *   0 - All links are valid
 *   1 - Broken links found or error occurred
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
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

interface BrokenLink {
  file: string;
  line: number;
  link: string;
  reason: string;
}

function log(message: string, color: string = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(60));
  log(title, COLORS.bright + COLORS.cyan);
  console.log('='.repeat(60) + '\n');
}

/**
 * Recursively find all markdown files in a directory
 */
function findMarkdownFiles(dir: string, fileList: string[] = []): string[] {
  if (!existsSync(dir)) {
    return fileList;
  }
  
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and .git directories
      if (file !== 'node_modules' && file !== '.git') {
        findMarkdownFiles(filePath, fileList);
      }
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Extract all markdown links from content
 * Matches: [text](link) and [text](link "title")
 */
function extractLinks(content: string): Array<{ link: string; line: number }> {
  const links: Array<{ link: string; line: number }> = [];
  const lines = content.split('\n');
  
  // Regex to match markdown links: [text](url) or [text](url "title")
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  
  lines.forEach((line, index) => {
    let match;
    while ((match = linkRegex.exec(line)) !== null) {
      const link = match[2].split(' ')[0]; // Remove title if present
      links.push({
        link: link.trim(),
        line: index + 1,
      });
    }
  });
  
  return links;
}

/**
 * Check if a link is external (http/https)
 */
function isExternalLink(link: string): boolean {
  return link.startsWith('http://') || link.startsWith('https://');
}

/**
 * Check if a link is an anchor (starts with #)
 */
function isAnchorLink(link: string): boolean {
  return link.startsWith('#');
}

/**
 * Validate a relative file link
 */
function validateFileLink(
  sourceFile: string,
  link: string,
  rootDir: string
): { valid: boolean; reason?: string } {
  // Remove anchor if present
  const [filePath, anchor] = link.split('#');
  
  // Resolve the link relative to the source file's directory
  const sourceDir = path.dirname(sourceFile);
  const targetPath = path.resolve(sourceDir, filePath);
  
  // Check if file exists
  if (!existsSync(targetPath)) {
    return {
      valid: false,
      reason: `File not found: ${path.relative(rootDir, targetPath)}`,
    };
  }
  
  // If there's an anchor, we could validate it exists in the target file
  // For now, we'll just check the file exists
  if (anchor) {
    // TODO: Validate anchor exists in target file
  }
  
  return { valid: true };
}

/**
 * Validate anchor link within the same document
 */
function validateAnchorLink(
  content: string,
  anchor: string
): { valid: boolean; reason?: string } {
  // Convert anchor to heading format
  // GitHub-style anchors: lowercase, spaces to hyphens, remove special chars
  const headingRegex = /^#+\s+(.+)$/gm;
  const headings: string[] = [];
  
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const heading = match[1]
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    headings.push(heading);
  }
  
  const targetAnchor = anchor.substring(1); // Remove leading #
  
  if (!headings.includes(targetAnchor)) {
    return {
      valid: false,
      reason: `Anchor not found: ${anchor}`,
    };
  }
  
  return { valid: true };
}

/**
 * Check all links in a markdown file
 */
function checkFileLinks(
  filePath: string,
  rootDir: string
): BrokenLink[] {
  const brokenLinks: BrokenLink[] = [];
  const content = readFileSync(filePath, 'utf-8');
  const links = extractLinks(content);
  
  links.forEach(({ link, line }) => {
    // Skip external links (we don't validate those)
    if (isExternalLink(link)) {
      return;
    }
    
    // Check anchor links
    if (isAnchorLink(link)) {
      const result = validateAnchorLink(content, link);
      if (!result.valid) {
        brokenLinks.push({
          file: path.relative(rootDir, filePath),
          line,
          link,
          reason: result.reason || 'Invalid anchor',
        });
      }
      return;
    }
    
    // Check relative file links
    const result = validateFileLink(filePath, link, rootDir);
    if (!result.valid) {
      brokenLinks.push({
        file: path.relative(rootDir, filePath),
        line,
        link,
        reason: result.reason || 'Invalid link',
      });
    }
  });
  
  return brokenLinks;
}

/**
 * Main function
 */
async function main() {
  log('Documentation Link Checker', COLORS.bright + COLORS.cyan);
  log('Backlog Pro - Agile Suite', COLORS.cyan);
  
  const rootDir = process.cwd();
  const docsDir = path.join(rootDir, 'docs');
  
  logSection('Finding Markdown Files');
  
  // Find all markdown files in docs directory
  const markdownFiles = findMarkdownFiles(docsDir);
  
  // Also check README files in root
  const rootReadme = path.join(rootDir, 'README.md');
  if (existsSync(rootReadme)) {
    markdownFiles.push(rootReadme);
  }
  
  if (markdownFiles.length === 0) {
    log('⚠️  No markdown files found', COLORS.yellow);
    process.exit(0);
  }
  
  log(`Found ${markdownFiles.length} markdown file(s)`, COLORS.blue);
  markdownFiles.forEach(file => {
    log(`  - ${path.relative(rootDir, file)}`, COLORS.reset);
  });
  
  logSection('Checking Links');
  
  const allBrokenLinks: BrokenLink[] = [];
  let totalLinks = 0;
  
  markdownFiles.forEach(file => {
    const content = readFileSync(file, 'utf-8');
    const links = extractLinks(content);
    totalLinks += links.length;
    
    const brokenLinks = checkFileLinks(file, rootDir);
    allBrokenLinks.push(...brokenLinks);
  });
  
  log(`Checked ${totalLinks} link(s) across ${markdownFiles.length} file(s)`, COLORS.blue);
  
  logSection('Results');
  
  if (allBrokenLinks.length === 0) {
    log('✓ All links are valid!', COLORS.bright + COLORS.green);
    log(`No broken links found in ${markdownFiles.length} file(s)`, COLORS.green);
    process.exit(0);
  } else {
    log(`✗ Found ${allBrokenLinks.length} broken link(s)`, COLORS.bright + COLORS.red);
    console.log('');
    
    // Group by file
    const byFile = new Map<string, BrokenLink[]>();
    allBrokenLinks.forEach(link => {
      if (!byFile.has(link.file)) {
        byFile.set(link.file, []);
      }
      byFile.get(link.file)!.push(link);
    });
    
    // Print broken links grouped by file
    byFile.forEach((links, file) => {
      log(`${file}:`, COLORS.yellow);
      links.forEach(link => {
        log(`  Line ${link.line}: ${link.link}`, COLORS.red);
        log(`    → ${link.reason}`, COLORS.reset);
      });
      console.log('');
    });
    
    log('Please fix the broken links above', COLORS.yellow);
    process.exit(1);
  }
}

main().catch((error) => {
  log(`\n❌ Unexpected error: ${error.message}`, COLORS.red);
  console.error(error);
  process.exit(1);
});
