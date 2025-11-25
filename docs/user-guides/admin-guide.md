# Admin Guide

## Overview

This guide provides comprehensive instructions for system administrators to install, configure, maintain, and troubleshoot Backlog Pro - Agile Suite. It covers environment setup, team management, data operations, performance monitoring, and routine maintenance tasks.

**Target Audience**: System administrators, DevOps engineers, and technical leads responsible for deploying and maintaining the application.

## Installation & Setup

### Prerequisites

Before installing Backlog Pro, ensure your system meets the following requirements:

**Required Software**:
- **Node.js**: Version 18.x or higher (LTS recommended)
- **npm**: Version 9.x or higher (comes with Node.js)
- **Git**: For version control and deployment
- **Modern Web Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+

**System Requirements**:
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: Minimum 4GB (8GB recommended for development)
- **Disk Space**: 500MB for application and dependencies
- **Network**: Internet connection for initial setup and dependency installation

### Installation Steps

**1. Clone the Repository**

```bash
git clone <repository-url>
cd backlog-pro
```

**2. Install Dependencies**

```bash
npm install
```

This will install all required packages including:
- React 18.3 and React DOM
- Vite 5.4 (build tool)
- TypeScript 5.8
- Tailwind CSS 3.4
- shadcn/ui components (Radix UI primitives)
- Additional libraries (see package.json for complete list)

**3. Configure Environment Variables**

Create a `.env` file in the project root (see Configuration section below for details):

```bash
cp .env.example .env
# Edit .env with your configuration
```

**4. Verify Installation**

Run the development server to verify installation:

```bash
npm run dev
```

The application should start on `http://localhost:8080`. Open this URL in your browser to confirm the application loads correctly.

**5. Build for Production**

To create a production build:

```bash
npm run build
```

The optimized build will be created in the `dist/` directory.

## Configuration

### Environment Variables

Backlog Pro uses environment variables for configuration. All variables must be prefixed with `VITE_` to be accessible in the application.

**Required Environment Variables**:

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL (optional backend) | `https://xxxxx.supabase.co` | No |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anonymous/public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | No |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project identifier | `ffmwvhiwpedzoboylcgc` | No |

**Configuration Instructions**:

1. **Supabase Configuration (Optional)**:
   - The application currently uses localStorage for data persistence
   - Supabase integration is configured but not actively used
   - If you plan to use Supabase as a backend:
     - Create a Supabase project at https://supabase.com
     - Copy your project URL to `VITE_SUPABASE_URL`
     - Copy your anonymous key to `VITE_SUPABASE_PUBLISHABLE_KEY`
     - Copy your project ID to `VITE_SUPABASE_PROJECT_ID`

2. **Environment File Location**:
   - Place `.env` file in the project root directory
   - Never commit `.env` to version control (it's in `.gitignore`)
   - Use `.env.example` as a template for required variables

3. **Accessing Environment Variables in Code**:
   ```typescript
   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
   ```

### Build Configuration

**Available Build Commands**:

| Command | Purpose | Output Mode | Use Case |
|---------|---------|-------------|----------|
| `npm run dev` | Development server | Development | Local development with hot reload |
| `npm run build` | Production build | Production | Optimized build for deployment |
| `npm run build:dev` | Development build | Development | Build with development settings |
| `npm run preview` | Preview production build | Production | Test production build locally |
| `npm run lint` | Run ESLint | N/A | Code quality checks |

**Vite Configuration** (`vite.config.ts`):

```typescript
{
  server: {
    host: "::",      // Listen on all network interfaces
    port: 8080,      // Development server port
  },
  resolve: {
    alias: {
      "@": "./src",  // Path alias for imports
    },
  },
}
```

**Build Configuration Options**:

1. **Development Server Port**: Default is 8080. To change:
   ```bash
   npm run dev -- --port 3000
   ```

2. **Build Output Directory**: Default is `dist/`. Configured in `vite.config.ts`

3. **TypeScript Configuration** (`tsconfig.json`):
   - Path alias: `@/*` maps to `./src/*`
   - Relaxed settings: `noImplicitAny: false`, `strictNullChecks: false`
   - Skip lib check enabled for faster builds

4. **Production Optimizations**:
   - Code splitting and tree shaking enabled by default
   - CSS minification with Tailwind CSS
   - Asset optimization and compression
   - Source maps generated for debugging

## Team Management

Backlog Pro includes four default team members (Pedro, David, Morena, Franco). Administrators can update team member information through the application interface or by directly manipulating the data.

### Team Member Data Structure

Each team member has the following properties:

```typescript
{
  id: string;              // Unique identifier
  name: string;            // Team member name
  role: TeamRole;          // "Product Owner" | "Scrum Master" | "Developer" | "DevOps"
  skills: string[];        // Array of skills
  availability: number;    // Percentage (0-100)
  image: string;           // Avatar URL
  tasksCompleted: number;  // Total tasks completed
  averageCycleTime: number; // Average time to complete tasks (days)
  velocity: number;        // Story points per sprint
}
```

### Editing Team Members

**Through the Application UI**:

1. Navigate to the **Team** page from the sidebar
2. Click on a team member card to view their profile
3. Click the **Edit** button (if available in your implementation)
4. Update the following fields:
   - Name
   - Role (Product Owner, Scrum Master, Developer, DevOps)
   - Skills (add or remove skills)
   - Availability percentage
   - Avatar image URL
5. Save changes

**Programmatically via AppContext**:

```typescript
import { useApp } from '@/context/AppContext';

const { updateTeamMember } = useApp();

// Update a team member
updateTeamMember('1', {
  name: 'Pedro Silva',
  availability: 80,
  skills: ['Product Strategy', 'Stakeholder Management', 'UX', 'Analytics']
});
```

**Direct localStorage Manipulation** (Advanced):

Team members are stored in the application state but not persisted to localStorage by default. To add persistence:

1. Open browser DevTools (F12)
2. Go to Application > Local Storage
3. Note: Team members are initialized from `AppContext.tsx` and not currently saved to localStorage

### Adding New Team Members

Currently, team members are hardcoded in `AppContext.tsx`. To add new team members:

**Option 1: Modify Source Code**

Edit `src/context/AppContext.tsx` and add to the `initialTeamMembers` array:

```typescript
const initialTeamMembers: TeamMember[] = [
  // ... existing members
  {
    id: "5",
    name: "New Member",
    role: "Developer",
    skills: ["JavaScript", "React"],
    availability: 100,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=NewMember",
    tasksCompleted: 0,
    averageCycleTime: 0,
    velocity: 0,
  },
];
```

**Option 2: Implement Add Team Member Feature**

Add a new method to AppContext:

```typescript
const addTeamMember = (member: TeamMember) => {
  setTeamMembers([...teamMembers, member]);
};
```

Then create a UI form to add new team members through the application.

### Removing Team Members

Team members cannot currently be removed through the UI. To implement this:

1. Add a `deleteTeamMember` method to AppContext:
   ```typescript
   const deleteTeamMember = (id: string) => {
     setTeamMembers(teamMembers.filter(m => m.id !== id));
   };
   ```

2. Add the method to the context provider value
3. Create a delete button in the Team page UI

**Note**: Before removing a team member, ensure no tasks are assigned to them, or reassign those tasks to other team members.

## Data Management

Backlog Pro stores all application data in the browser's localStorage. This section covers bulk operations, data cleanup, and data management best practices.

### Understanding Data Storage

**localStorage Keys**:

| Key | Data Type | Description |
|-----|-----------|-------------|
| `tasks` | Task[] | All tasks in the system |
| `userStories` | UserStory[] | All user stories |
| `sprints` | Sprint[] | All sprints |
| `risks` | Risk[] | All risks in the risk matrix |
| `profitShares` | ProfitShare[] | Profit sharing calculations |
| `kpiMetrics` | KPIMetrics | Team KPI metrics |

**Data Persistence Flow**:
1. User performs action (create, update, delete)
2. AppContext updates React state
3. useEffect hook automatically saves to localStorage
4. Data persists across browser sessions

### Bulk Operations

**Exporting All Data**:

To export all application data for backup or migration:

```javascript
// Open browser console (F12) and run:
const exportData = {
  tasks: JSON.parse(localStorage.getItem('tasks') || '[]'),
  userStories: JSON.parse(localStorage.getItem('userStories') || '[]'),
  sprints: JSON.parse(localStorage.getItem('sprints') || '[]'),
  risks: JSON.parse(localStorage.getItem('risks') || '[]'),
  profitShares: JSON.parse(localStorage.getItem('profitShares') || '[]'),
  kpiMetrics: JSON.parse(localStorage.getItem('kpiMetrics') || '{}'),
  exportDate: new Date().toISOString()
};

// Download as JSON file
const dataStr = JSON.stringify(exportData, null, 2);
const dataBlob = new Blob([dataStr], { type: 'application/json' });
const url = URL.createObjectURL(dataBlob);
const link = document.createElement('a');
link.href = url;
link.download = `backlog-pro-export-${Date.now()}.json`;
link.click();
```

**Importing Data**:

To import previously exported data:

```javascript
// 1. Load your JSON file content into a variable
const importedData = { /* your exported data */ };

// 2. Restore to localStorage
localStorage.setItem('tasks', JSON.stringify(importedData.tasks));
localStorage.setItem('userStories', JSON.stringify(importedData.userStories));
localStorage.setItem('sprints', JSON.stringify(importedData.sprints));
localStorage.setItem('risks', JSON.stringify(importedData.risks));
localStorage.setItem('profitShares', JSON.stringify(importedData.profitShares));
localStorage.setItem('kpiMetrics', JSON.stringify(importedData.kpiMetrics));

// 3. Reload the page
location.reload();
```

**Bulk Delete Operations**:

To delete all tasks in a specific sprint:

```javascript
const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
const filteredTasks = tasks.filter(task => task.sprintId !== 'sprint-id-to-delete');
localStorage.setItem('tasks', JSON.stringify(filteredTasks));
location.reload();
```

To delete all completed tasks:

```javascript
const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
const activeTasks = tasks.filter(task => task.status !== 'done');
localStorage.setItem('tasks', JSON.stringify(activeTasks));
location.reload();
```

### Data Cleanup

**Removing Old Sprints**:

1. Navigate to the Sprints page
2. Identify completed sprints that are no longer needed
3. Use the delete function for each sprint
4. Note: Deleting a sprint does not automatically delete associated tasks or stories

**Cleaning Up Orphaned Data**:

Tasks and user stories may reference deleted sprints. To clean up:

```javascript
// Find tasks with invalid sprint references
const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
const sprints = JSON.parse(localStorage.getItem('sprints') || '[]');
const validSprintIds = sprints.map(s => s.id);

const cleanedTasks = tasks.map(task => {
  if (task.sprintId && !validSprintIds.includes(task.sprintId)) {
    return { ...task, sprintId: undefined };
  }
  return task;
});

localStorage.setItem('tasks', JSON.stringify(cleanedTasks));
```

**Resetting to Sample Data**:

To reset the application to initial sample data:

```javascript
// Clear all data
localStorage.clear();

// Reload the page - sample data will be reinitialized
location.reload();
```

**Data Size Management**:

Monitor localStorage usage to avoid hitting browser limits:

```javascript
// Check current localStorage size
let totalSize = 0;
for (let key in localStorage) {
  if (localStorage.hasOwnProperty(key)) {
    totalSize += localStorage[key].length + key.length;
  }
}
console.log(`localStorage size: ${(totalSize / 1024).toFixed(2)} KB`);
```

**Best Practices**:
- Regularly export data as backups (weekly recommended)
- Archive completed sprints older than 6 months
- Remove test data before production use
- Monitor localStorage size (keep under 5MB for optimal performance)
- Clean up orphaned references after bulk deletions

## Performance Monitoring

Backlog Pro provides comprehensive metrics to monitor team performance and system health. This section explains how to interpret and act on these metrics.

### KPI Metrics

The Dashboard displays key performance indicators (KPIs) that measure team effectiveness and project health.

**Available KPI Metrics**:

| Metric | Description | Good Range | Interpretation |
|--------|-------------|------------|----------------|
| **Velocity** | Average story points completed per sprint | 30-50 | Higher is better, but consistency matters more than raw numbers |
| **Cycle Time** | Average days to complete a task | 1-3 days | Lower is better; indicates efficient workflow |
| **Sprint Completion Rate** | Percentage of committed work completed | 80-95% | Higher is better; <70% indicates over-commitment |
| **Deployment Frequency** | Deployments per month | 10-30 | Higher indicates mature CI/CD; depends on team size |
| **Lead Time** | Days from commit to production | 1-5 days | Lower is better; measures delivery speed |
| **MTTR** (Mean Time To Recover) | Hours to recover from failure | <2 hours | Lower is better; measures incident response |
| **Change Failure Rate** | Percentage of deployments causing issues | <15% | Lower is better; measures quality |
| **Team Satisfaction** | Team happiness score (1-10) | 7-9 | Higher is better; monitor trends |

**Accessing KPI Metrics**:

1. Navigate to the **Dashboard** page
2. View the KPI cards at the top of the page
3. Each metric shows the current value and trend indicator
4. Charts below provide historical trends

**Interpreting KPI Trends**:

- **Velocity Declining**: May indicate team burnout, technical debt, or unclear requirements
- **Cycle Time Increasing**: Suggests bottlenecks in the workflow or complex tasks
- **Low Sprint Completion Rate**: Team is over-committing or facing unexpected blockers
- **High Change Failure Rate**: Quality issues; increase testing and code review rigor

**Updating KPI Metrics**:

KPI metrics are updated through the AppContext:

```typescript
import { useApp } from '@/context/AppContext';

const { updateKPIMetrics } = useApp();

updateKPIMetrics({
  velocity: 38,
  cycleTime: 2.3,
  sprintCompletionRate: 89,
  deploymentFrequency: 15,
  leadTime: 3.8,
  mttr: 1.1,
  changeFailureRate: 6,
  teamSatisfaction: 8.7
});
```

### DORA Metrics

DORA (DevOps Research and Assessment) metrics measure DevOps performance and maturity. These are displayed on the DevOps page.

**The Four Key DORA Metrics**:

**1. Deployment Frequency**
- **What it measures**: How often code is deployed to production
- **Elite**: Multiple deployments per day
- **High**: Once per day to once per week
- **Medium**: Once per week to once per month
- **Low**: Less than once per month
- **Current Value**: Displayed on DevOps dashboard

**2. Lead Time for Changes**
- **What it measures**: Time from code commit to production deployment
- **Elite**: Less than 1 day
- **High**: 1 day to 1 week
- **Medium**: 1 week to 1 month
- **Low**: More than 1 month
- **Current Value**: Displayed on DevOps dashboard

**3. Mean Time to Recover (MTTR)**
- **What it measures**: Time to recover from production failure
- **Elite**: Less than 1 hour
- **High**: Less than 1 day
- **Medium**: 1 day to 1 week
- **Low**: More than 1 week
- **Current Value**: Displayed on DevOps dashboard

**4. Change Failure Rate**
- **What it measures**: Percentage of deployments causing production issues
- **Elite**: 0-15%
- **High**: 16-30%
- **Medium**: 31-45%
- **Low**: More than 45%
- **Current Value**: Displayed on DevOps dashboard

**Improving DORA Metrics**:

- **Increase Deployment Frequency**: Automate CI/CD, reduce batch sizes, implement feature flags
- **Reduce Lead Time**: Streamline code review, automate testing, reduce work-in-progress
- **Reduce MTTR**: Improve monitoring, automate rollbacks, practice incident response
- **Reduce Change Failure Rate**: Increase test coverage, implement staging environments, improve code review

**Accessing DORA Metrics**:

1. Navigate to the **DevOps** page from the sidebar
2. View the four DORA metric cards
3. Each card shows current value and performance tier
4. Historical trends are displayed in charts below

### Individual Team Member Metrics

Each team member has individual performance metrics visible on the Team page:

- **Tasks Completed**: Total number of tasks finished
- **Average Cycle Time**: Average days to complete a task
- **Velocity**: Story points completed per sprint

**Using Individual Metrics**:
- Identify high performers for mentoring opportunities
- Spot team members who may need support
- Balance workload across the team
- Set realistic sprint commitments based on team capacity

## Troubleshooting

This section covers common issues and their solutions.

### Common Issues

#### Issue 1: Data Not Persisting

**Symptoms**:
- Changes are lost after page refresh
- Application resets to sample data

**Possible Causes**:
- Browser in private/incognito mode
- localStorage disabled or full
- Browser security settings blocking localStorage

**Solutions**:

1. **Check Browser Mode**:
   - Ensure you're not in private/incognito mode
   - localStorage is cleared when private browsing sessions end

2. **Check localStorage Availability**:
   ```javascript
   // Run in browser console
   try {
     localStorage.setItem('test', 'test');
     localStorage.removeItem('test');
     console.log('localStorage is available');
   } catch (e) {
     console.error('localStorage is not available:', e);
   }
   ```

3. **Clear localStorage Space**:
   - Export important data first
   - Clear old data: `localStorage.clear()`
   - Reload the application

4. **Check Browser Settings**:
   - Chrome: Settings > Privacy and security > Cookies and other site data
   - Firefox: Settings > Privacy & Security > Cookies and Site Data
   - Ensure "Block third-party cookies" doesn't affect localhost

#### Issue 2: Application Won't Start

**Symptoms**:
- `npm run dev` fails
- Build errors
- Blank page in browser

**Solutions**:

1. **Clear Node Modules and Reinstall**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check Node Version**:
   ```bash
   node --version  # Should be 18.x or higher
   npm --version   # Should be 9.x or higher
   ```

3. **Check for Port Conflicts**:
   ```bash
   # Port 8080 might be in use
   npm run dev -- --port 3000
   ```

4. **Clear Vite Cache**:
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

5. **Check Console for Errors**:
   - Open browser DevTools (F12)
   - Check Console tab for JavaScript errors
   - Check Network tab for failed requests

#### Issue 3: Slow Performance

**Symptoms**:
- Application feels sluggish
- Long load times
- Unresponsive UI

**Solutions**:

1. **Check localStorage Size**:
   ```javascript
   // Run in console
   let totalSize = 0;
   for (let key in localStorage) {
     if (localStorage.hasOwnProperty(key)) {
       totalSize += localStorage[key].length;
     }
   }
   console.log(`Size: ${(totalSize / 1024).toFixed(2)} KB`);
   ```
   - If over 5MB, consider archiving old data

2. **Clear Browser Cache**:
   - Chrome: Ctrl+Shift+Delete
   - Clear cached images and files
   - Keep cookies to preserve localStorage

3. **Reduce Data Volume**:
   - Archive completed sprints
   - Delete old tasks and user stories
   - Clean up orphaned data

4. **Check Browser Extensions**:
   - Disable extensions that might interfere
   - Try in a different browser

#### Issue 4: Drag and Drop Not Working (Kanban)

**Symptoms**:
- Cannot drag tasks between columns
- Tasks snap back to original position

**Solutions**:

1. **Check Browser Compatibility**:
   - Ensure using a modern browser (Chrome 90+, Firefox 88+)
   - Update browser to latest version

2. **Disable Conflicting Extensions**:
   - Some extensions interfere with drag events
   - Try in incognito mode without extensions

3. **Check Console for Errors**:
   - Open DevTools (F12)
   - Look for JavaScript errors during drag operation

4. **Refresh the Page**:
   - Sometimes state gets out of sync
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

#### Issue 5: Charts Not Displaying

**Symptoms**:
- Empty chart areas
- "No data available" messages

**Solutions**:

1. **Ensure Data Exists**:
   - Charts require data to display
   - Add tasks, sprints, or user stories as needed

2. **Check Date Ranges**:
   - Some charts filter by date
   - Ensure data falls within the displayed date range

3. **Verify Data Structure**:
   ```javascript
   // Check if data is properly formatted
   console.log(JSON.parse(localStorage.getItem('tasks')));
   ```

4. **Clear and Reinitialize**:
   - Export data first
   - Clear localStorage
   - Reload to get sample data
   - Import your data back

#### Issue 6: Build Fails in Production

**Symptoms**:
- `npm run build` fails
- TypeScript errors
- Missing dependencies

**Solutions**:

1. **Fix TypeScript Errors**:
   ```bash
   npm run lint
   # Fix reported errors
   ```

2. **Check for Missing Dependencies**:
   ```bash
   npm install
   ```

3. **Verify Environment Variables**:
   - Ensure `.env` file exists
   - Check all required variables are set

4. **Clean Build**:
   ```bash
   rm -rf dist
   npm run build
   ```

### Getting Help

If you encounter issues not covered in this guide:

1. **Check Browser Console**:
   - Press F12 to open DevTools
   - Look for error messages in the Console tab
   - Note the error message and stack trace

2. **Check Network Tab**:
   - Open DevTools > Network tab
   - Look for failed requests (red entries)
   - Check response codes and error messages

3. **Review Application Logs**:
   - Check terminal output where `npm run dev` is running
   - Look for build errors or warnings

4. **Export Your Data**:
   - Before troubleshooting, export your data (see Data Management section)
   - This prevents data loss during troubleshooting

5. **Contact Support**:
   - Provide error messages from console
   - Include browser version and operating system
   - Describe steps to reproduce the issue
   - Include screenshots if relevant

6. **Community Resources**:
   - Check project documentation
   - Review GitHub issues (if applicable)
   - Consult React, Vite, or Tailwind CSS documentation for framework-specific issues

## Maintenance Tasks

Regular maintenance ensures optimal performance and data integrity. This section outlines recommended maintenance schedules and procedures.

### Daily Tasks

**1. Monitor Application Health**
- Check that the application loads correctly
- Verify critical features are working (task creation, Kanban board, charts)
- Review browser console for errors (F12 > Console)

**2. Review Active Sprints**
- Check sprint progress on the Dashboard
- Ensure tasks are being updated regularly
- Monitor sprint completion rate

**3. Check Team Activity**
- Verify team members are updating their tasks
- Review task assignments and workload distribution
- Check for blocked or overdue tasks

**Time Required**: 5-10 minutes

### Weekly Tasks

**1. Data Backup**
- Export all application data (see Data Management > Bulk Operations)
- Save backup file with date stamp: `backlog-pro-backup-YYYY-MM-DD.json`
- Store in secure location (cloud storage, network drive)
- Verify backup file is valid JSON and not corrupted

**2. Performance Review**
- Check localStorage size (should be under 5MB)
- Review KPI metrics trends on Dashboard
- Compare current sprint velocity to historical average
- Check DORA metrics on DevOps page

**3. Data Cleanup**
- Archive completed sprints older than 30 days
- Remove test data or duplicate entries
- Clean up orphaned task references
- Verify data integrity (no broken references)

**4. Dependency Updates**
- Check for security updates: `npm audit`
- Review and update dependencies if needed
- Test application after updates

**Time Required**: 30-45 minutes

### Monthly Tasks

**1. Comprehensive Data Backup**
- Perform full data export
- Create multiple backup copies
- Test data restoration process
- Document backup location and access procedures

**2. Performance Analysis**
- Generate monthly KPI report
- Analyze velocity trends across sprints
- Review team member performance metrics
- Identify bottlenecks or improvement areas

**3. System Health Check**
- Review browser console for recurring errors
- Check localStorage usage trends
- Verify all features are functioning correctly
- Test on different browsers (Chrome, Firefox, Safari, Edge)

**4. Security Review**
- Review access logs (if implemented)
- Check for suspicious activity
- Update security procedures if needed
- Review and update environment variables

**5. Documentation Updates**
- Update admin guide with new procedures
- Document any configuration changes
- Update troubleshooting guide with new issues/solutions
- Review and update user guides

**6. Dependency Maintenance**
- Run `npm audit` to check for vulnerabilities
- Update dependencies to latest stable versions:
  ```bash
  npm update
  npm audit fix
  ```
- Test thoroughly after updates
- Update package.json and commit changes

**7. Archive Old Data**
- Export data for sprints older than 3 months
- Remove archived sprints from active system
- Store archived data in long-term storage
- Document archive location and retrieval process

**Time Required**: 2-3 hours

### Quarterly Tasks

**1. Major Version Updates**
- Review major dependency updates (React, Vite, TypeScript)
- Plan and test major upgrades in development environment
- Update documentation for breaking changes

**2. Capacity Planning**
- Review localStorage usage trends
- Plan for data archival strategy
- Consider backend migration if localStorage limits are reached

**3. User Training**
- Conduct refresher training for team members
- Review new features or changes
- Gather feedback for improvements

**Time Required**: 4-6 hours

### Maintenance Checklist

Use this checklist to track maintenance activities:

```markdown
## Weekly Maintenance - [Date]
- [ ] Data backup completed
- [ ] Backup file verified
- [ ] localStorage size checked: _____ KB
- [ ] KPI metrics reviewed
- [ ] Data cleanup performed
- [ ] Dependencies checked for updates

## Monthly Maintenance - [Date]
- [ ] Comprehensive backup completed
- [ ] Performance analysis completed
- [ ] System health check passed
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Dependencies updated
- [ ] Old data archived
```

## System Limits

Understanding system constraints helps prevent issues and plan for scaling.

### localStorage Limits

**Browser Storage Quotas**:

| Browser | localStorage Limit | Notes |
|---------|-------------------|-------|
| Chrome | 10 MB | Per origin (domain) |
| Firefox | 10 MB | Per origin |
| Safari | 5 MB | Per origin, may prompt user |
| Edge | 10 MB | Per origin |
| Mobile Browsers | 5-10 MB | Varies by browser and device |

**Practical Limits for Backlog Pro**:

- **Recommended Maximum**: 5 MB total data
- **Warning Threshold**: 7 MB (consider archiving)
- **Critical Threshold**: 9 MB (archive immediately)

**Estimating Data Size**:

Approximate size per entity:
- Task: ~500 bytes
- User Story: ~800 bytes
- Sprint: ~300 bytes
- Risk: ~400 bytes
- Team Member: ~200 bytes

**Example Capacity**:
- 5 MB can store approximately:
  - 10,000 tasks, OR
  - 6,000 user stories, OR
  - A realistic mix: 2,000 tasks + 1,000 stories + 100 sprints + 200 risks

**When to Archive**:
- Archive completed sprints older than 3-6 months
- Remove test data regularly
- Export and delete historical data not needed for current work

**Exceeding Limits**:

If localStorage quota is exceeded:
- Browser throws `QuotaExceededError`
- New data cannot be saved
- Application may become unstable

**Solutions**:
1. Export and archive old data
2. Delete unnecessary data
3. Implement data pagination
4. Consider migrating to backend storage (Supabase)

### Browser Compatibility

**Fully Supported Browsers**:

| Browser | Minimum Version | Recommended Version | Notes |
|---------|----------------|---------------------|-------|
| Chrome | 90+ | Latest | Best performance |
| Firefox | 88+ | Latest | Fully supported |
| Safari | 14+ | Latest | Some CSS differences |
| Edge | 90+ | Latest | Chromium-based |

**Mobile Browsers**:

| Browser | Support Level | Notes |
|---------|--------------|-------|
| Chrome Mobile | Full | Recommended for mobile |
| Safari iOS | Full | iOS 14+ required |
| Firefox Mobile | Full | Android only |
| Samsung Internet | Partial | May have minor issues |

**Known Compatibility Issues**:

1. **Internet Explorer**: Not supported (IE 11 and below)
   - Modern JavaScript features not available
   - CSS Grid and Flexbox issues
   - Recommend upgrading to Edge

2. **Older Safari Versions** (< 14):
   - CSS backdrop-filter may not work (glassmorphic effects)
   - Some ES6+ features not supported
   - localStorage may have stricter limits

3. **Mobile Safari Private Mode**:
   - localStorage disabled in private browsing
   - Data will not persist
   - Show warning to users

**Feature Detection**:

Check for required features:

```javascript
// Check localStorage support
const hasLocalStorage = (() => {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
})();

// Check for required CSS features
const hasBackdropFilter = CSS.supports('backdrop-filter', 'blur(10px)');
const hasGrid = CSS.supports('display', 'grid');
```

**Responsive Design Breakpoints**:

The application is responsive with the following breakpoints:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

**Testing Recommendations**:

1. **Primary Testing**: Chrome latest (desktop and mobile)
2. **Secondary Testing**: Firefox latest, Safari latest
3. **Minimum Testing**: Edge latest
4. **Mobile Testing**: iOS Safari, Chrome Mobile

**Accessibility**:

- Keyboard navigation supported
- ARIA labels on interactive elements
- Color contrast meets WCAG 2.1 AA standards
- Screen reader compatible (Radix UI primitives)

### Performance Considerations

**Optimal Performance**:
- Data size: < 5 MB
- Number of tasks: < 5,000
- Number of sprints: < 100
- Browser: Chrome or Firefox latest

**Performance Degradation**:
- Data size: > 7 MB (noticeable slowdown)
- Number of tasks: > 10,000 (filtering/searching slow)
- Older browsers: Slower rendering

**Optimization Tips**:
- Archive old data regularly
- Use filters to reduce displayed data
- Close unused browser tabs
- Clear browser cache periodically
- Use production build for deployment (`npm run build`)

## Related Documentation

- [System Architecture](../architecture/system-architecture.md) - Technical architecture and component design
- [Security Procedures](../security/security-procedures.md) - Security best practices and incident response
- [Backup Procedures](../security/backup-procedures.md) - Detailed backup and recovery procedures
- [API Reference](../api/api-reference.md) - Complete API documentation for developers
- [End User Guide](./end-user-guide.md) - User-facing feature documentation

## Changelog

- 2025-11-19: Initial admin guide created with installation, configuration, team management, data management, monitoring, troubleshooting, and maintenance sections
