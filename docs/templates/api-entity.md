# [Entity Name]

## Overview

[Brief description of what this entity represents in the system and its primary purpose]

## Interface Definition

```typescript
export interface EntityName {
  id: string;                    // Unique identifier
  field1: string;                // Description of field1
  field2: number;                // Description of field2
  field3?: boolean;              // Optional field description
  relatedEntityId?: string;      // Foreign key reference to RelatedEntity
  createdAt: Date;               // Timestamp of creation
  updatedAt: Date;               // Timestamp of last update
}
```

## Fields

### Required Fields

- **`id`** (string): Unique identifier for the entity. Auto-generated using UUID.
- **`field1`** (string): [Detailed description including validation rules, constraints, and purpose]
- **`field2`** (number): [Detailed description including valid ranges, units, and purpose]

### Optional Fields

- **`field3`** (boolean): [Description of when this field is used and its default behavior]
- **`relatedEntityId`** (string): Foreign key reference to [RelatedEntity]. [Explain the relationship]

### System Fields

- **`createdAt`** (Date): Automatically set when the entity is created
- **`updatedAt`** (Date): Automatically updated when the entity is modified

## Validation Rules

- `field1`: Must be non-empty string, maximum length [X] characters
- `field2`: Must be positive number between [min] and [max]
- `field3`: Defaults to `false` if not provided
- `relatedEntityId`: Must reference an existing [RelatedEntity] if provided

## Relationships

### References

- **[RelatedEntity]**: This entity references [RelatedEntity] through the `relatedEntityId` field
  - Relationship type: [One-to-many | Many-to-one | One-to-one]
  - Cascade behavior: [What happens when related entity is deleted]

### Referenced By

- **[OtherEntity]**: [OtherEntity] references this entity through its `entityNameId` field
  - Used for: [Purpose of this relationship]

## CRUD Operations

### Create

```typescript
// Add new entity
const newEntity: EntityName = {
  id: crypto.randomUUID(),
  field1: "example value",
  field2: 42,
  field3: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

context.addEntityName(newEntity);
```

### Read

```typescript
// Access all entities
const entities = context.entityNames;

// Find specific entity
const entity = context.entityNames.find(e => e.id === entityId);

// Filter entities
const filtered = context.entityNames.filter(e => e.field2 > 10);
```

### Update

```typescript
// Update entity
context.updateEntityName(entityId, {
  field1: "updated value",
  field2: 100
});
```

### Delete

```typescript
// Delete entity
context.deleteEntityName(entityId);
```

## Usage Examples

### Example 1: Creating a New Entity

```typescript
import { useApp } from '@/context/AppContext';

function MyComponent() {
  const { addEntityName } = useApp();

  const handleCreate = () => {
    const entity: EntityName = {
      id: crypto.randomUUID(),
      field1: "Sample",
      field2: 50,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    addEntityName(entity);
  };

  return <button onClick={handleCreate}>Create Entity</button>;
}
```

### Example 2: Updating an Entity

```typescript
import { useApp } from '@/context/AppContext';

function EditComponent({ entityId }: { entityId: string }) {
  const { updateEntityName } = useApp();

  const handleUpdate = () => {
    updateEntityName(entityId, {
      field1: "Updated value",
      updatedAt: new Date()
    });
  };

  return <button onClick={handleUpdate}>Update</button>;
}
```

### Example 3: Working with Relationships

```typescript
import { useApp } from '@/context/AppContext';

function RelatedComponent() {
  const { entityNames, relatedEntities } = useApp();

  // Get entity with its related data
  const entityWithRelated = entityNames.map(entity => ({
    ...entity,
    relatedData: relatedEntities.find(r => r.id === entity.relatedEntityId)
  }));

  return (
    <div>
      {entityWithRelated.map(item => (
        <div key={item.id}>
          <h3>{item.field1}</h3>
          <p>Related: {item.relatedData?.name}</p>
        </div>
      ))}
    </div>
  );
}
```

## Common Patterns

### Filtering and Sorting

```typescript
// Filter by criteria
const activeEntities = entityNames.filter(e => e.field3 === true);

// Sort by field
const sortedEntities = [...entityNames].sort((a, b) => 
  a.field2 - b.field2
);

// Complex filtering
const complexFilter = entityNames.filter(e => 
  e.field2 > 10 && e.field1.includes("search")
);
```

### Aggregations

```typescript
// Count entities
const totalCount = entityNames.length;

// Sum numeric field
const totalField2 = entityNames.reduce((sum, e) => sum + e.field2, 0);

// Group by criteria
const grouped = entityNames.reduce((acc, e) => {
  const key = e.field3 ? 'active' : 'inactive';
  acc[key] = acc[key] || [];
  acc[key].push(e);
  return acc;
}, {} as Record<string, EntityName[]>);
```

## Best Practices

1. **Always validate input**: Check required fields before calling add/update methods
2. **Handle relationships carefully**: Ensure referenced entities exist before creating relationships
3. **Use TypeScript types**: Leverage the interface for type safety
4. **Update timestamps**: Always update `updatedAt` when modifying entities
5. **Avoid direct mutation**: Use the provided CRUD methods instead of modifying context state directly

## Troubleshooting

### Common Issues

**Issue**: Entity not appearing after creation
- **Cause**: Missing required fields or validation failure
- **Solution**: Verify all required fields are provided and meet validation rules

**Issue**: Update not persisting
- **Cause**: Incorrect entity ID or localStorage quota exceeded
- **Solution**: Verify the ID exists and check browser console for storage errors

**Issue**: Relationship data not loading
- **Cause**: Referenced entity doesn't exist or ID mismatch
- **Solution**: Verify the related entity exists before creating the relationship

## Related Documentation

- [System Architecture](../architecture/system-architecture.md) - Overall system design
- [API Reference](../api/api-reference.md) - Complete API reference
- [Admin Guide](../user-guides/admin-guide.md) - Configuration and maintenance

## Changelog

- YYYY-MM-DD: Initial documentation created
- YYYY-MM-DD: Added validation rules section
- YYYY-MM-DD: Updated examples with TypeScript types
