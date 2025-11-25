# Documentation Templates

This directory contains templates for creating consistent, high-quality documentation across the Backlog Pro project.

## Available Templates

### 1. API Entity Template (`api-entity.md`)

**Purpose**: Document data models, TypeScript interfaces, and entities used in the application.

**When to use**:
- Adding a new data model to the system
- Documenting existing entities in the API reference
- Explaining CRUD operations for a specific entity type

**Key sections**:
- Interface definition with TypeScript types
- Field descriptions and validation rules
- Relationship documentation
- CRUD operation examples
- Common usage patterns

**Example usage**: Document the `Task`, `UserStory`, `Sprint`, or any other entity type.

### 2. Feature Guide Template (`feature-guide.md`)

**Purpose**: Create user-facing documentation for application features and functionality.

**When to use**:
- Documenting a new feature for end users
- Creating tutorials or how-to guides
- Explaining complex workflows

**Key sections**:
- Getting started guide
- Step-by-step instructions
- UI reference
- Examples and use cases
- Troubleshooting
- Best practices

**Example usage**: Document features like "Kanban Board", "Sprint Planning", "Risk Matrix", etc.

### 3. Procedure Template (`procedure.md`)

**Purpose**: Document operational procedures, maintenance tasks, and administrative processes.

**When to use**:
- Creating security procedures
- Documenting backup and recovery processes
- Writing deployment procedures
- Defining maintenance tasks

**Key sections**:
- Prerequisites and requirements
- Step-by-step procedure with verification
- Safety warnings and precautions
- Rollback procedures
- Troubleshooting guide
- Automation scripts

**Example usage**: Document procedures like "Backup Procedures", "Security Incident Response", "Deployment Process", etc.

## How to Use These Templates

### Step 1: Choose the Right Template

Select the template that best matches your documentation needs:
- **API Entity**: For technical data model documentation
- **Feature Guide**: For user-facing feature documentation
- **Procedure**: For operational and administrative procedures

### Step 2: Copy the Template

Copy the appropriate template file to your target location:

```bash
# Example: Creating new API entity documentation
cp docs/templates/api-entity.md docs/api/my-new-entity.md

# Example: Creating new feature guide
cp docs/templates/feature-guide.md docs/user-guides/my-feature.md

# Example: Creating new procedure
cp docs/templates/procedure.md docs/security/my-procedure.md
```

### Step 3: Fill in the Template

Replace all placeholder text (indicated by `[brackets]`) with actual content:
- `[Entity Name]` → Actual entity name
- `[Description]` → Real description
- `[Step 1]` → Actual step instructions
- etc.

### Step 4: Remove Unused Sections

Delete any sections that don't apply to your documentation. Not every document needs every section.

### Step 5: Follow Documentation Standards

Ensure your documentation follows these standards:
- Use kebab-case for filenames (e.g., `my-feature-guide.md`)
- Use proper heading hierarchy (single h1, no skipped levels)
- Include relative links to related documentation
- Add code examples where appropriate
- Include a changelog at the bottom

### Step 6: Review and Validate

Before committing:
- Run the documentation validation script: `npm run validate:docs`
- Check for broken links: `npm run check:links`
- Review for completeness and clarity
- Ensure all required sections are present

## Template Customization

These templates are starting points. Feel free to:
- Add sections specific to your needs
- Remove sections that don't apply
- Adjust the structure for your use case
- Maintain consistency with existing documentation

## Documentation Standards

All documentation should follow these standards:

### File Naming
- Use kebab-case: `my-document-name.md`
- Be descriptive: `sprint-planning-guide.md` not `guide.md`
- Use `.md` extension for Markdown files

### Heading Hierarchy
- One h1 (`#`) per document (the title)
- Use h2 (`##`) for main sections
- Use h3 (`###`) for subsections
- Don't skip heading levels

### Code Blocks
- Always specify the language: ` ```typescript ` or ` ```bash `
- Include comments in code examples
- Keep examples concise and focused

### Links
- Use relative paths for internal links: `[Link](../api/api-reference.md)`
- Use descriptive link text: `[API Reference](../api/api-reference.md)` not `[click here](../api/api-reference.md)`
- Verify all links work before committing

### Formatting
- Use **bold** for UI elements and important terms
- Use `code` formatting for code, commands, and file names
- Use bullet points for lists
- Use tables for structured data

## Examples

### Example 1: Creating API Entity Documentation

```bash
# Copy template
cp docs/templates/api-entity.md docs/api/task-entity.md

# Edit the file and replace:
# [Entity Name] → Task
# [field1] → title, description, status, etc.
# Add actual TypeScript interface
# Add real CRUD examples
```

### Example 2: Creating Feature Guide

```bash
# Copy template
cp docs/templates/feature-guide.md docs/user-guides/kanban-board-guide.md

# Edit the file and replace:
# [Feature Name] → Kanban Board
# Add screenshots
# Add step-by-step instructions
# Add troubleshooting tips
```

### Example 3: Creating Procedure Documentation

```bash
# Copy template
cp docs/templates/procedure.md docs/security/data-backup-procedure.md

# Edit the file and replace:
# [Procedure Name] → Data Backup Procedure
# Add actual backup commands
# Add verification steps
# Add rollback procedure
```

## Validation

After creating documentation, validate it:

```bash
# Run all documentation tests
npm run validate:docs

# Check for broken links
npm run check:links

# Run specific test suite
npm run test:docs
```

## Getting Help

If you need help with documentation:
1. Review existing documentation for examples
2. Check the [System Architecture](../architecture/system-architecture.md) for technical context
3. Refer to the [API Reference](../api/api-reference.md) for data model details
4. Ask the team for review and feedback

## Contributing

When contributing documentation:
1. Use the appropriate template
2. Follow the documentation standards
3. Include examples and code snippets
4. Add links to related documentation
5. Run validation before committing
6. Request review from team members

## Related Documentation

- [System Architecture](../architecture/system-architecture.md)
- [API Reference](../api/api-reference.md)
- [Admin Guide](../user-guides/admin-guide.md)
- [End User Guide](../user-guides/end-user-guide.md)

## Changelog

- 2024-11-19: Initial templates created
  - Added API entity template
  - Added feature guide template
  - Added procedure template
  - Added template usage guide
