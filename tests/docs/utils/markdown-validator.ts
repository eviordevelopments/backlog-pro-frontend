import * as fs from 'fs';
import * as path from 'path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import type { Root, Heading, Link } from 'mdast';

export interface MarkdownValidationResult {
  filePath: string;
  isKebabCase: boolean;
  hasOneH1: boolean;
  hasProperHeadingHierarchy: boolean;
  hasRequiredSections: boolean;
  usesRelativePaths: boolean;
  errors: string[];
}

/**
 * Check if filename is in kebab-case
 * README.md files are exempt from this rule as they follow standard conventions
 */
export function isKebabCase(filename: string): boolean {
  const nameWithoutExt = path.basename(filename, path.extname(filename));
  
  // README files are exempt from kebab-case requirement
  if (nameWithoutExt === 'README') {
    return true;
  }
  
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(nameWithoutExt);
}

/**
 * Parse markdown file and validate structure
 */
export async function validateMarkdownFile(filePath: string): Promise<MarkdownValidationResult> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const filename = path.basename(filePath);
  
  const result: MarkdownValidationResult = {
    filePath,
    isKebabCase: isKebabCase(filename),
    hasOneH1: false,
    hasProperHeadingHierarchy: true,
    hasRequiredSections: false,
    usesRelativePaths: true,
    errors: [],
  };

  // Parse markdown
  const tree = unified().use(remarkParse).parse(content) as Root;

  const headings: Heading[] = [];
  const links: Link[] = [];

  visit(tree, 'heading', (node: Heading) => {
    headings.push(node);
  });

  visit(tree, 'link', (node: Link) => {
    links.push(node);
  });

  // Check for exactly one H1
  const h1Count = headings.filter(h => h.depth === 1).length;
  result.hasOneH1 = h1Count === 1;
  
  if (h1Count === 0) {
    result.errors.push('Missing H1 heading');
  } else if (h1Count > 1) {
    result.errors.push(`Multiple H1 headings found (${h1Count})`);
  }

  // Check heading hierarchy (no skipped levels)
  let previousDepth = 0;
  for (const heading of headings) {
    if (heading.depth > previousDepth + 1 && previousDepth !== 0) {
      result.hasProperHeadingHierarchy = false;
      result.errors.push(`Skipped heading level: jumped from H${previousDepth} to H${heading.depth}`);
    }
    previousDepth = heading.depth;
  }

  // Check for required sections (Overview or Examples)
  // README files are exempt from this requirement as they have their own conventions
  const isReadme = path.basename(filePath, path.extname(filePath)) === 'README';
  
  if (!isReadme) {
    const headingTexts = headings.map(h => 
      h.children
        .filter((child): child is { type: 'text'; value: string } => child.type === 'text')
        .map(child => child.value)
        .join('')
        .toLowerCase()
    );
    
    const hasOverview = headingTexts.some(text => text.includes('overview'));
    const hasExamples = headingTexts.some(text => text.includes('example'));
    result.hasRequiredSections = hasOverview || hasExamples;

    if (!result.hasRequiredSections) {
      result.errors.push('Missing required sections (Overview or Examples)');
    }
  } else {
    // README files automatically pass this check
    result.hasRequiredSections = true;
  }

  // Check that internal links use relative paths
  for (const link of links) {
    const url = link.url;
    
    // Check if it's an internal markdown link
    if (url.endsWith('.md') && (url.startsWith('http://') || url.startsWith('https://'))) {
      result.usesRelativePaths = false;
      result.errors.push(`Absolute URL used for internal link: ${url}`);
    }
  }

  // Check kebab-case (README files are already exempt in isKebabCase function)
  if (!result.isKebabCase) {
    result.errors.push(`Filename is not in kebab-case: ${filename}`);
  }

  return result;
}

/**
 * Validate all markdown files in a directory
 */
export async function validateMarkdownDirectory(dirPath: string): Promise<MarkdownValidationResult[]> {
  const results: MarkdownValidationResult[] = [];

  async function walkDir(dir: string) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        await walkDir(filePath);
      } else if (file.endsWith('.md')) {
        const result = await validateMarkdownFile(filePath);
        results.push(result);
      }
    }
  }

  await walkDir(dirPath);
  
  return results;
}

/**
 * Check if documentation content contains a specific term
 */
export function documentationContains(filePath: string, searchTerm: string): boolean {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.toLowerCase().includes(searchTerm.toLowerCase());
}
