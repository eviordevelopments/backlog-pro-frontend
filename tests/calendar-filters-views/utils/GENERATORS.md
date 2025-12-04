# Calendar Filters and Views - Test Generators

This directory contains test utilities and generators for the calendar filters and views feature.

## Generators

### `generateTeamMember()`
Generates a random team member with id and name.

### `generateTeamMembers(minLength, maxLength)`
Generates an array of random team members.

### `generateCalendarEvent(teamMembers)`
Generates a random calendar event with optional team member assignment.

### `generateCalendarEvents(teamMembers, minLength, maxLength)`
Generates an array of random calendar events.

### `generateFilterState(teamMembers)`
Generates a random filter state with category and team member filters.

## Helper Functions

### `getDefaultFilterState(teamMembers)`
Returns the default filter state (all categories and team members enabled, month view).

### `filterEventsByCategory(events, categoryFilters)`
Filters events based on category filter state.

### `filterEventsByTeamMembers(events, selectedMembers)`
Filters events based on selected team members.

### `applyAllFilters(events, filterState)`
Applies all filters (category and team member) to events.

## Test Helpers

### Date Functions
- `getWeekDays(startDate)` - Returns 7 consecutive days starting from the week containing startDate
- `getMonthDays(date)` - Returns all days in the month (42 days including padding)
- `isSameDay(date1, date2)` - Checks if two dates are the same day
- `getEventsForDay(events, day)` - Gets all events for a specific day
- `getEventsForWeek(events, weekStart)` - Gets all events in a week
- `getEventsForMonth(events, date)` - Gets all events in a month

### Filter State Functions
- `serializeFilterState(state)` - Converts filter state to JSON string
- `deserializeFilterState(json)` - Converts JSON string back to filter state
- `areFilterStatesEqual(state1, state2)` - Compares two filter states for equality

### Display Functions
- `getDistinctColors(events)` - Returns set of distinct colors used by events
- `hasEventInfo(event, rendered)` - Checks if rendered output contains event title and assignee
- `getEventCountForDay(events, day)` - Returns count of events for a specific day
