# Backup Procedures

## Overview

This document provides comprehensive backup and recovery procedures for Backlog Pro - Agile Suite. Since the application stores all data in browser localStorage, proper backup procedures are essential to prevent data loss from browser issues, accidental deletion, or device failure.

## Prerequisites

Readers should understand:
- How localStorage works in web browsers
- Basic JavaScript/TypeScript for running backup scripts
- JSON data format
- File system operations for their operating system

## Backup Strategy

### What Data Needs Backing Up

**localStorage Keys**:
- `tasks` - All task data
- `userStories` - User story data
- `sprints` - Sprint information
- `teamMembers` - Team member profiles
- `risks` - Risk matrix data
- `profitShares` - Profit sharing calculations
- `kpiMetrics` - KPI and performance metrics

**Data Characteristics**:
- All data stored as JSON strings in localStorage
- Total size typically under 5MB
- No binary files or attachments
- Self-contained data structure with relationships via IDs

### Backup Frequency Recommendations

**Recommended Schedule**:
- **Daily**: For active development teams (automated)
- **Weekly**: For stable projects with less frequent changes
- **Before Major Changes**: Always backup before bulk operations
- **Before Browser Updates**: Backup before updating browser
- **Before Device Maintenance**: Backup before OS updates or repairs

**Critical Backup Triggers**:
- Before clearing browser cache/data
- Before uninstalling/reinstalling browser
- Before device factory reset
- Before migrating to new device
- After significant data entry sessions

### Backup Retention Policy

**Recommended Retention**:
- **Daily backups**: Keep last 7 days
- **Weekly backups**: Keep last 4 weeks
- **Monthly backups**: Keep last 12 months
- **Major milestones**: Keep indefinitely

**Storage Locations**:
- Primary: Local file system (Documents/Backups/)
- Secondary: Cloud storage (Google Drive, Dropbox, OneDrive)
- Tertiary: External drive or network storage

## Data Export Procedures

### Manual Export via Browser Console

**Step 1: Open Browser Developer Tools**
- Chrome/Edge: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- Firefox: Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
- Safari: Enable Developer menu, then press `Cmd+Option+C`

**Step 2: Navigate to Console Tab**
- Click on the "Console" tab in Developer Tools

**Step 3: Export All Data**

```javascript
// Export all localStorage data
const backupData = {
  timestamp: new Date().toISOString(),
  version: '1.0',
  data: {
    tasks: localStorage.getItem('tasks'),
    userStories: localStorage.getItem('userStories'),
    sprints: localStorage.getItem('sprints'),
    teamMembers: localStorage.getItem('teamMembers'),
    risks: localStorage.getItem('risks'),
    profitShares: localStorage.getItem('profitShares'),
    kpiMetrics: localStorage.getItem('kpiMetrics')
  }
};

// Convert to JSON string
const backupJSON = JSON.stringify(backupData, null, 2);

// Create downloadable file
const blob = new Blob([backupJSON], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `backlog-pro-backup-${new Date().toISOString().split('T')[0]}.json`;
a.click();
URL.revokeObjectURL(url);

console.log('Backup downloaded successfully!');
```

**Step 4: Verify Download**
- Check your Downloads folder
- File should be named: `backlog-pro-backup-YYYY-MM-DD.json`
- Open file in text editor to verify it contains data

### Manual Export via Application UI (Future Enhancement)

**Planned Feature**:
A dedicated "Export Data" button in the application settings that:
1. Gathers all localStorage data
2. Formats as JSON with metadata
3. Triggers browser download
4. Confirms successful export

**Current Workaround**:
Use the browser console method above until UI feature is implemented.

### Automated Export Script

**Create Backup Script** (`scripts/backup-data.js`):

```javascript
// Run this script in browser console or as bookmarklet
(function() {
  'use strict';
  
  // Configuration
  const BACKUP_KEYS = [
    'tasks',
    'userStories',
    'sprints',
    'teamMembers',
    'risks',
    'profitShares',
    'kpiMetrics'
  ];
  
  // Gather all data
  const backupData = {
    timestamp: new Date().toISOString(),
    version: '1.0',
    appVersion: '1.0.0', // Update with actual app version
    data: {}
  };
  
  // Collect each key
  BACKUP_KEYS.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      backupData.data[key] = value;
    }
  });
  
  // Calculate backup size
  const backupJSON = JSON.stringify(backupData, null, 2);
  const sizeKB = (new Blob([backupJSON]).size / 1024).toFixed(2);
  
  // Create download
  const blob = new Blob([backupJSON], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const filename = `backlog-pro-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  // Log success
  console.log(`✅ Backup created successfully!`);
  console.log(`📁 Filename: ${filename}`);
  console.log(`📊 Size: ${sizeKB} KB`);
  console.log(`📅 Timestamp: ${backupData.timestamp}`);
  console.log(`🔢 Keys backed up: ${Object.keys(backupData.data).length}`);
  
  return backupData;
})();
```

**Usage**:
1. Copy the entire script
2. Open browser console on Backlog Pro application
3. Paste and press Enter
4. Backup file downloads automatically

### Creating a Bookmarklet for Quick Backups

**Step 1: Create Bookmarklet**

Create a browser bookmark with this URL:

```javascript
javascript:(function(){const BACKUP_KEYS=['tasks','userStories','sprints','teamMembers','risks','profitShares','kpiMetrics'];const backupData={timestamp:new Date().toISOString(),version:'1.0',data:{}};BACKUP_KEYS.forEach(key=>{const value=localStorage.getItem(key);if(value){backupData.data[key]=value;}});const backupJSON=JSON.stringify(backupData,null,2);const blob=new Blob([backupJSON],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`backlog-pro-backup-${new Date().toISOString().split('T')[0]}.json`;a.click();URL.revokeObjectURL(url);alert('Backup downloaded!');})();
```

**Step 2: Use Bookmarklet**
1. Navigate to Backlog Pro application
2. Click the bookmarklet in your bookmarks bar
3. Backup downloads automatically

## Data Import and Recovery Procedures

### Verify Backup Integrity

**Before Restoring**:
1. Open backup file in text editor
2. Verify JSON is valid (use JSONLint.com if unsure)
3. Check timestamp is correct
4. Verify all expected keys are present
5. Check data arrays have expected entries

**Validation Script**:

```javascript
// Paste backup JSON here
const backupData = /* paste your backup JSON */;

// Validate structure
console.log('Backup Validation:');
console.log('✓ Timestamp:', backupData.timestamp);
console.log('✓ Version:', backupData.version);
console.log('✓ Keys found:', Object.keys(backupData.data));

// Validate each key
Object.entries(backupData.data).forEach(([key, value]) => {
  try {
    const parsed = JSON.parse(value);
    console.log(`✓ ${key}: ${Array.isArray(parsed) ? parsed.length : 'object'} items`);
  } catch (e) {
    console.error(`✗ ${key}: Invalid JSON`);
  }
});
```

### Full Data Restoration

**⚠️ WARNING**: This will overwrite all current data. Backup current data first!

**Step 1: Backup Current Data**
- Use export procedure above to backup current state
- This allows rollback if restoration fails

**Step 2: Open Browser Console**
- Navigate to Backlog Pro application
- Open Developer Tools Console

**Step 3: Load Backup File**

```javascript
// Method 1: Paste backup data directly
const backupData = {
  // Paste your backup JSON here
};

// Method 2: Upload file (requires file input)
// See file upload script below
```

**Step 4: Restore Data**

```javascript
// Restore all data from backup
function restoreBackup(backupData) {
  console.log('Starting restoration...');
  
  // Validate backup structure
  if (!backupData.data) {
    console.error('Invalid backup format');
    return false;
  }
  
  // Restore each key
  let restoredCount = 0;
  Object.entries(backupData.data).forEach(([key, value]) => {
    if (value) {
      localStorage.setItem(key, value);
      restoredCount++;
      console.log(`✓ Restored: ${key}`);
    }
  });
  
  console.log(`✅ Restoration complete! ${restoredCount} keys restored.`);
  console.log('🔄 Please refresh the page to see restored data.');
  
  return true;
}

// Execute restoration
restoreBackup(backupData);
```

**Step 5: Refresh Application**
- Press `F5` or `Ctrl+R` (Windows) / `Cmd+R` (Mac)
- Verify data appears correctly
- Check all pages and features

### Partial Data Restoration

**Restore Specific Entity Types**:

```javascript
// Restore only tasks
const backupData = /* your backup */;
if (backupData.data.tasks) {
  localStorage.setItem('tasks', backupData.data.tasks);
  console.log('✓ Tasks restored');
  location.reload();
}

// Restore only sprints
if (backupData.data.sprints) {
  localStorage.setItem('sprints', backupData.data.sprints);
  console.log('✓ Sprints restored');
  location.reload();
}

// Restore multiple specific keys
const keysToRestore = ['tasks', 'userStories', 'sprints'];
keysToRestore.forEach(key => {
  if (backupData.data[key]) {
    localStorage.setItem(key, backupData.data[key]);
    console.log(`✓ ${key} restored`);
  }
});
location.reload();
```

### File Upload Restoration Script

**Complete Restoration Tool**:

```javascript
// Create file input for backup upload
function createRestoreUI() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backupData = JSON.parse(event.target.result);
        
        // Confirm restoration
        const confirmed = confirm(
          `Restore backup from ${backupData.timestamp}?\n\n` +
          `This will overwrite all current data!\n\n` +
          `Keys to restore: ${Object.keys(backupData.data).join(', ')}`
        );
        
        if (!confirmed) {
          console.log('Restoration cancelled');
          return;
        }
        
        // Restore data
        Object.entries(backupData.data).forEach(([key, value]) => {
          if (value) {
            localStorage.setItem(key, value);
          }
        });
        
        alert('Restoration complete! Page will reload.');
        location.reload();
        
      } catch (error) {
        console.error('Failed to restore backup:', error);
        alert('Failed to restore backup. Check console for details.');
      }
    };
    
    reader.readAsText(file);
  };
  
  input.click();
}

// Run this to start restoration
createRestoreUI();
```

## Example Backup Scripts

### Daily Automated Backup (Node.js)

**Setup** (`scripts/daily-backup.js`):

```javascript
const fs = require('fs');
const path = require('path');

// This script would need to be adapted to run in a browser context
// or use a headless browser like Puppeteer

const puppeteer = require('puppeteer');

async function performBackup() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Navigate to your application
  await page.goto('http://localhost:8080');
  
  // Extract localStorage data
  const backupData = await page.evaluate(() => {
    const BACKUP_KEYS = [
      'tasks', 'userStories', 'sprints', 
      'teamMembers', 'risks', 'profitShares', 'kpiMetrics'
    ];
    
    const data = {};
    BACKUP_KEYS.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) data[key] = value;
    });
    
    return {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data
    };
  });
  
  // Save to file
  const backupDir = path.join(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const filename = `backup-${new Date().toISOString().split('T')[0]}.json`;
  const filepath = path.join(backupDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
  console.log(`✅ Backup saved: ${filepath}`);
  
  await browser.close();
}

performBackup().catch(console.error);
```

### Backup Rotation Script

**Cleanup Old Backups** (`scripts/rotate-backups.js`):

```javascript
const fs = require('fs');
const path = require('path');

function rotateBackups(backupDir, retentionDays = 7) {
  const files = fs.readdirSync(backupDir);
  const now = Date.now();
  const maxAge = retentionDays * 24 * 60 * 60 * 1000;
  
  files.forEach(file => {
    const filepath = path.join(backupDir, file);
    const stats = fs.statSync(filepath);
    const age = now - stats.mtimeMs;
    
    if (age > maxAge) {
      fs.unlinkSync(filepath);
      console.log(`🗑️  Deleted old backup: ${file}`);
    }
  });
}

const backupDir = path.join(__dirname, '../backups');
rotateBackups(backupDir, 7); // Keep last 7 days
```

### Cross-Browser Backup Script

**Universal Backup** (works in all browsers):

```javascript
// Save this as a bookmarklet or run in console
(function() {
  const backup = {
    timestamp: new Date().toISOString(),
    browser: navigator.userAgent,
    data: {}
  };
  
  // Get all localStorage keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    backup.data[key] = localStorage.getItem(key);
  }
  
  // Download
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `full-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
})();
```

## Troubleshooting

### Common Backup Issues

**Issue 1: Backup File is Empty**
- **Cause**: No data in localStorage
- **Solution**: Verify application has data before backing up
- **Check**: Open console and run `console.log(localStorage)`

**Issue 2: Backup Download Fails**
- **Cause**: Browser blocking downloads
- **Solution**: Check browser download settings and permissions
- **Alternative**: Copy JSON from console and save manually

**Issue 3: Backup File Too Large**
- **Cause**: Excessive data in localStorage
- **Solution**: Clean up old data before backing up
- **Limit**: Most browsers limit localStorage to 5-10MB

**Issue 4: Cannot Parse Backup File**
- **Cause**: Corrupted JSON or encoding issues
- **Solution**: Use JSON validator to identify syntax errors
- **Prevention**: Always verify backup immediately after creation

### Common Restoration Issues

**Issue 1: Restoration Doesn't Take Effect**
- **Cause**: Page not refreshed after restoration
- **Solution**: Hard refresh with `Ctrl+F5` or `Cmd+Shift+R`

**Issue 2: Partial Data After Restoration**
- **Cause**: Backup file incomplete or corrupted
- **Solution**: Try older backup file
- **Prevention**: Validate backups regularly

**Issue 3: Data Conflicts After Restoration**
- **Cause**: Restoring old backup over newer data
- **Solution**: Check timestamps before restoring
- **Prevention**: Always backup current data first

**Issue 4: localStorage Quota Exceeded**
- **Cause**: Backup data exceeds browser storage limit
- **Solution**: Clear unnecessary data before restoring
- **Check**: Run `console.log(JSON.stringify(localStorage).length)` to see size

## Best Practices

### Backup Best Practices

1. **Regular Schedule**: Set up automated daily backups
2. **Multiple Locations**: Store backups in at least 2 locations
3. **Verify Backups**: Periodically test restoration process
4. **Label Clearly**: Use descriptive filenames with dates
5. **Document Changes**: Note major changes in backup logs
6. **Test Restoration**: Practice restoration before you need it
7. **Secure Storage**: Protect backups with encryption if needed
8. **Version Control**: Keep multiple backup versions

### Recovery Best Practices

1. **Backup First**: Always backup current state before restoring
2. **Verify Integrity**: Check backup file before restoring
3. **Test Environment**: Test restoration in development first if possible
4. **Incremental Restore**: Restore one entity type at a time if unsure
5. **Document Process**: Keep notes during recovery
6. **Verify Results**: Check all data after restoration
7. **Monitor**: Watch for issues after restoration

## Related Documentation

- [Security Procedures](./security-procedures.md) - Security best practices
- [Admin Guide](../user-guides/admin-guide.md) - System administration
- [System Architecture](../architecture/system-architecture.md) - Technical details

## Changelog

- 2025-11-19: Initial backup procedures document created
