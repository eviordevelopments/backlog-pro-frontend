# Screenshots Directory

This directory contains screenshots referenced in the End User Guide documentation.

## Screenshot Requirements

### Technical Specifications

- **Resolution**: 1920x1080 (Full HD)
- **Format**: PNG with transparency where applicable
- **File Size**: Optimize to < 500KB per image
- **Browser**: Capture in Chrome or Firefox for consistency
- **Zoom Level**: 100% browser zoom

### Capture Guidelines

1. **Clean State**: Use representative sample data, not production data
2. **Consistent Theme**: Ensure glassmorphic theme is properly rendered
3. **No Personal Data**: Avoid any PII or sensitive information
4. **Highlight Key Elements**: Use subtle annotations if needed (arrows, boxes)
5. **Consistent Timing**: Capture all screenshots in the same session for visual consistency

## Required Screenshots

### Getting Started Walkthrough

| Filename | Description | Key Elements to Show |
|----------|-------------|---------------------|
| `01-launch-screen.png` | Application launch screen | Dashboard on initial load, sidebar visible |
| `02-dashboard-overview.png` | Complete dashboard view | All KPI cards, charts, team panel |
| `03-tasks-page.png` | Tasks page interface | Task list, filters, New Task button |
| `04-create-task-dialog.png` | Task creation form | All form fields visible and labeled |
| `05-task-created.png` | Task list with new task | Newly created task highlighted in list |
| `06-kanban-board.png` | Kanban board view | All four columns with tasks |
| `07-kanban-drag-drop.png` | Drag and drop action | Task being dragged between columns |
| `08-create-sprint-dialog.png` | Sprint creation form | All sprint fields and date pickers |
| `09-sprint-created.png` | Sprint list view | Newly created sprint card |
| `10-assign-task-sprint.png` | Task assignment to sprint | Edit dialog with Sprint dropdown highlighted |
| `11-team-profiles.png` | Team profiles page | All four team member cards with KPIs |
| `12-devops-metrics.png` | DevOps metrics dashboard | All DORA metric cards and charts |

### Additional Feature Screenshots (Optional)

These screenshots can enhance other sections of the documentation:

| Filename | Description | Section |
|----------|-------------|---------|
| `13-user-stories-page.png` | User Stories interface | User Stories section |
| `14-create-story-dialog.png` | Story creation form | User Stories section |
| `15-risk-matrix.png` | 5x5 Risk matrix view | Risk Management section |
| `16-add-risk-dialog.png` | Risk creation form | Risk Management section |
| `17-profit-sharing.png` | Profit sharing calculator | Profit Sharing section |
| `18-sprint-burndown.png` | Sprint burndown chart | Sprint Planning section |
| `19-task-filters.png` | Task filtering in action | Task Management section |
| `20-kanban-status-change.png` | Status change on Kanban | Kanban Board section |

## Capturing Screenshots

### Using Browser DevTools

1. Open Backlog Pro in your browser
2. Press F12 to open DevTools
3. Press Ctrl+Shift+P (Cmd+Shift+P on Mac) to open command palette
4. Type "screenshot" and select "Capture full size screenshot"
5. Save with the appropriate filename

### Using Screenshot Tools

**Windows:**
- Use Snipping Tool or Snip & Sketch (Win + Shift + S)
- Capture the application window or specific area

**macOS:**
- Use Cmd + Shift + 4 for area selection
- Use Cmd + Shift + 4 + Space for window capture

**Linux:**
- Use GNOME Screenshot or Flameshot
- Capture window or area as needed

### Post-Processing

1. **Crop**: Remove unnecessary browser chrome (address bar, bookmarks)
2. **Resize**: Ensure consistent dimensions across all screenshots
3. **Optimize**: Use tools like TinyPNG or ImageOptim to reduce file size
4. **Annotate** (if needed): Add subtle arrows or boxes to highlight key elements
5. **Verify**: Check that all text is readable and UI elements are clear

## Updating Screenshots

Screenshots should be updated when:

- UI design changes significantly
- New features are added to existing pages
- Layout or component structure changes
- Color scheme or theme is modified
- Sample data needs to be refreshed

### Update Checklist

- [ ] Identify which screenshots need updating
- [ ] Prepare application with clean, representative data
- [ ] Capture all affected screenshots in one session
- [ ] Verify consistency across all new screenshots
- [ ] Optimize file sizes
- [ ] Update documentation references if filenames change
- [ ] Commit screenshots with descriptive commit message

## Best Practices

1. **Consistency**: Capture all screenshots in the same session with the same data
2. **Clarity**: Ensure text is readable and UI elements are clearly visible
3. **Context**: Show enough context to orient the user
4. **Focus**: Highlight the specific feature being documented
5. **Timeliness**: Update screenshots promptly when UI changes
6. **Version Control**: Commit screenshots to Git for version tracking
7. **Documentation**: Update this README when adding new screenshot requirements

## File Naming Convention

Use the following pattern for screenshot filenames:

```
[number]-[feature-name]-[description].png
```

Examples:
- `01-launch-screen.png`
- `03-tasks-page.png`
- `06-kanban-board.png`

**Rules:**
- Use lowercase letters
- Use hyphens to separate words
- Use sequential numbering for walkthrough screenshots
- Use descriptive names that match documentation references

## Placeholder Images

Until actual screenshots are captured, the documentation references placeholder paths. To add screenshots:

1. Capture the screenshot following the guidelines above
2. Save it to this directory with the correct filename
3. Verify the path in the documentation matches the filename
4. Commit both the screenshot and any documentation updates

---

**Last Updated**: 2025-11-19  
**Maintained By**: Documentation Team
