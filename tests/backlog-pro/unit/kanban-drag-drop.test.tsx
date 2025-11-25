import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import Kanban from '@/pages/Kanban';

describe('Kanban Drag and Drop', () => {
  it('should render kanban board with all status columns', () => {
    render(
      <AuthProvider>
        <AppProvider>
          <Kanban />
        </AppProvider>
      </AuthProvider>
    );

    // Verify all columns are rendered (Requirements 3.1)
    expect(screen.getByText('To Do')).toBeDefined();
    expect(screen.getByText('In Progress')).toBeDefined();
    expect(screen.getByText('Review')).toBeDefined();
    expect(screen.getByText('Done')).toBeDefined();
  });

  it('should have drag and drop context configured', () => {
    const { container } = render(
      <AuthProvider>
        <AppProvider>
          <Kanban />
        </AppProvider>
      </AuthProvider>
    );

    // Verify DragDropContext is present by checking for droppable areas
    const droppableAreas = container.querySelectorAll('[data-rfd-droppable-id]');
    
    // Should have 4 droppable areas (one for each status column)
    expect(droppableAreas.length).toBe(4);
    
    // Verify each status has a droppable area
    const droppableIds = Array.from(droppableAreas).map(el => el.getAttribute('data-rfd-droppable-id'));
    expect(droppableIds).toContain('todo');
    expect(droppableIds).toContain('in-progress');
    expect(droppableIds).toContain('review');
    expect(droppableIds).toContain('done');
  });
});
