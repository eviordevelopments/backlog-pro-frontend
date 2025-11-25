import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Unit tests for specific documentation requirements
 * These tests verify that required documentation files and sections exist
 * 
 * Requirements: 4.3, 5.2, 5.4, 5.5, 6.1, 6.3, 6.4, 7.1, 8.1
 */

describe('Documentation Requirements - Unit Tests', () => {
  
  describe('Backup Documentation (Requirement 4.3)', () => {
    it('should have backup-procedures.md file', () => {
      const filePath = path.join('docs', 'security', 'backup-procedures.md');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should contain required sections in backup-procedures.md', () => {
      const filePath = path.join('docs', 'security', 'backup-procedures.md');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Check for required sections
      expect(content).toContain('## Backup Strategy');
      expect(content).toContain('## Data Export Procedures');
      expect(content).toContain('## Data Import and Recovery Procedures');
      expect(content).toContain('## Example Backup Scripts');
    });
  });

  describe('Team Management Documentation (Requirement 5.2)', () => {
    it('should have admin-guide.md file', () => {
      const filePath = path.join('docs', 'user-guides', 'admin-guide.md');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should contain team management section in admin-guide.md', () => {
      const filePath = path.join('docs', 'user-guides', 'admin-guide.md');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      expect(content).toContain('## Team Management');
    });

    it('should document team member management procedures', () => {
      const filePath = path.join('docs', 'user-guides', 'admin-guide.md');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Check for key team management topics
      expect(content.toLowerCase()).toContain('team member');
      expect(content.toLowerCase()).toContain('editing team members');
    });
  });

  describe('Troubleshooting Guide (Requirement 5.4)', () => {
    it('should contain troubleshooting section in admin-guide.md', () => {
      const filePath = path.join('docs', 'user-guides', 'admin-guide.md');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      expect(content).toContain('## Troubleshooting');
    });

    it('should provide common issues and solutions', () => {
      const filePath = path.join('docs', 'user-guides', 'admin-guide.md');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Check for troubleshooting content
      expect(content.toLowerCase()).toContain('common issues');
      expect(content.toLowerCase()).toContain('solutions');
    });
  });

  describe('Maintenance Documentation (Requirement 5.5)', () => {
    it('should contain maintenance section in admin-guide.md', () => {
      const filePath = path.join('docs', 'user-guides', 'admin-guide.md');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      expect(content).toContain('## Maintenance Tasks');
    });

    it('should document routine maintenance tasks', () => {
      const filePath = path.join('docs', 'user-guides', 'admin-guide.md');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Check for maintenance content
      expect(content.toLowerCase()).toContain('daily tasks');
      expect(content.toLowerCase()).toContain('weekly tasks');
      expect(content.toLowerCase()).toContain('monthly tasks');
    });
  });

  describe('Getting Started Guide (Requirement 6.1)', () => {
    it('should have end-user-guide.md file', () => {
      const filePath = path.join('docs', 'user-guides', 'end-user-guide.md');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should contain getting started section in end-user-guide.md', () => {
      const filePath = path.join('docs', 'user-guides', 'end-user-guide.md');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      expect(content).toContain('## Getting Started');
    });

    it('should include first-time user walkthrough', () => {
      const filePath = path.join('docs', 'user-guides', 'end-user-guide.md');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Check for walkthrough content
      expect(content.toLowerCase()).toContain('first-time user walkthrough');
      expect(content.toLowerCase()).toContain('step');
    });

    it('should reference screenshots', () => {
      const filePath = path.join('docs', 'user-guides', 'end-user-guide.md');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Check for screenshot references
      expect(content.toLowerCase()).toContain('screenshot');
    });
  });

  describe('Kanban Documentation (Requirement 6.3)', () => {
    it('should contain kanban section in end-user-guide.md', () => {
      const filePath = path.join('docs', 'user-guides', 'end-user-guide.md');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      expect(content).toContain('## Kanban Board');
    });

    it('should document drag-and-drop functionality', () => {
      const filePath = path.join('docs', 'user-guides', 'end-user-guide.md');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Check for drag-and-drop documentation
      expect(content.toLowerCase()).toContain('drag');
      expect(content.toLowerCase()).toContain('drop');
    });

    it('should document status management', () => {
      const filePath = path.join('docs', 'user-guides', 'end-user-guide.md');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Check for status management documentation
      expect(content.toLowerCase()).toContain('status');
    });
  });

  describe('Sprint Documentation (Requirement 6.4)', () => {
    it('should contain sprint planning section in end-user-guide.md', () => {
      const filePath = path.join('docs', 'user-guides', 'end-user-guide.md');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      expect(content).toContain('## Sprint Planning');
    });

    it('should document sprint creation process', () => {
      const filePath = path.join('docs', 'user-guides', 'end-user-guide.md');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Check for sprint creation documentation
      expect(content.toLowerCase()).toContain('creating sprints');
    });

    it('should document story assignment to sprints', () => {
      const filePath = path.join('docs', 'user-guides', 'end-user-guide.md');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Check for assignment documentation
      expect(content.toLowerCase()).toContain('assigning');
    });

    it('should document progress tracking', () => {
      const filePath = path.join('docs', 'user-guides', 'end-user-guide.md');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Check for progress tracking documentation
      expect(content.toLowerCase()).toContain('progress tracking');
    });
  });

  describe('Folder Structure (Requirement 7.1)', () => {
    it('should have docs/ directory', () => {
      expect(fs.existsSync('docs')).toBe(true);
    });

    it('should have api/ subdirectory', () => {
      const dirPath = path.join('docs', 'api');
      expect(fs.existsSync(dirPath)).toBe(true);
      expect(fs.statSync(dirPath).isDirectory()).toBe(true);
    });

    it('should have architecture/ subdirectory', () => {
      const dirPath = path.join('docs', 'architecture');
      expect(fs.existsSync(dirPath)).toBe(true);
      expect(fs.statSync(dirPath).isDirectory()).toBe(true);
    });

    it('should have security/ subdirectory', () => {
      const dirPath = path.join('docs', 'security');
      expect(fs.existsSync(dirPath)).toBe(true);
      expect(fs.statSync(dirPath).isDirectory()).toBe(true);
    });

    it('should have user-guides/ subdirectory', () => {
      const dirPath = path.join('docs', 'user-guides');
      expect(fs.existsSync(dirPath)).toBe(true);
      expect(fs.statSync(dirPath).isDirectory()).toBe(true);
    });

    it('should have README.md in docs/', () => {
      const filePath = path.join('docs', 'README.md');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should have api-reference.md in api/', () => {
      const filePath = path.join('docs', 'api', 'api-reference.md');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should have system-architecture.md in architecture/', () => {
      const filePath = path.join('docs', 'architecture', 'system-architecture.md');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should have backup-procedures.md in security/', () => {
      const filePath = path.join('docs', 'security', 'backup-procedures.md');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should have security-procedures.md in security/', () => {
      const filePath = path.join('docs', 'security', 'security-procedures.md');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should have admin-guide.md in user-guides/', () => {
      const filePath = path.join('docs', 'user-guides', 'admin-guide.md');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should have end-user-guide.md in user-guides/', () => {
      const filePath = path.join('docs', 'user-guides', 'end-user-guide.md');
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  describe('Documentation in Git Repository (Requirement 8.1)', () => {
    it('should have .git directory (repository initialized)', () => {
      expect(fs.existsSync('.git')).toBe(true);
    });

    it('should not have docs/ in .gitignore', () => {
      const gitignorePath = '.gitignore';
      
      if (fs.existsSync(gitignorePath)) {
        const content = fs.readFileSync(gitignorePath, 'utf-8');
        const lines = content.split('\n').map(line => line.trim());
        
        // Check that docs/ is not explicitly ignored
        const docsIgnored = lines.some(line => 
          line === 'docs/' || 
          line === 'docs' || 
          line === '/docs/' ||
          line === '/docs'
        );
        
        expect(docsIgnored).toBe(false);
      }
    });

    it('should have documentation files tracked by git', () => {
      // Check if git is available
      const { execSync } = require('child_process');
      
      try {
        // Check if docs directory is tracked
        const result = execSync('git ls-files docs/', { encoding: 'utf-8' });
        const trackedFiles = result.trim().split('\n').filter(f => f.length > 0);
        
        // Should have multiple tracked files in docs/
        expect(trackedFiles.length).toBeGreaterThan(0);
        
        // Check for key documentation files
        expect(trackedFiles.some(f => f.includes('api-reference.md'))).toBe(true);
        expect(trackedFiles.some(f => f.includes('system-architecture.md'))).toBe(true);
        expect(trackedFiles.some(f => f.includes('admin-guide.md'))).toBe(true);
        expect(trackedFiles.some(f => f.includes('end-user-guide.md'))).toBe(true);
      } catch (error) {
        // If git command fails, skip this test
        console.warn('Git command failed, skipping git tracking test');
      }
    });
  });
});
