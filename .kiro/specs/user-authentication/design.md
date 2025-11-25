# Design Document: User Authentication

## Overview

The user authentication system will provide secure login, registration, and session management for Backlog Pro - Agile Suite. The design leverages the existing Supabase integration for backend authentication services while maintaining the current localStorage-based data persistence model. The authentication layer will be implemented as a React Context that wraps the existing AppContext, providing seamless integration with the current application architecture.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     React Application                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │           AuthProvider (New)                      │  │
│  │  - User state management                          │  │
│  │  - Session persistence                            │  │
│  │  - Authentication methods                         │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │         AppProvider (Existing)              │ │  │
│  │  │  - Project data                             │ │  │
│  │  │  - Tasks, Sprints, etc.                     │ │  │
│  │  │  - User-specific data filtering             │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Supabase Backend                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Auth Service                         │  │
│  │  - User authentication                            │  │
│  │  - Password hashing (bcrypt)                      │  │
│  │  - Session token management                       │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Database Tables                      │  │
│  │  - team_members (persistent user records)         │  │
│  │  - User profile storage                           │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App.tsx
├── AuthProvider (new)
│   ├── Login Page (new)
│   ├── Register Page (new)
│   └── ProtectedRoute (new)
│       └── AppProvider (existing)
│           └── AppLayout
│               └── [All existing pages]
```

## Components and Interfaces

### 1. AuthContext

**Purpose**: Manages authentication state and provides authentication methods throughout the application.

**Interface**:
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}
```

**Responsibilities**:
- Store current user state
- Provide login/register/logout methods
- Manage session persistence via localStorage
- Handle authentication errors
- Restore session on app load

### 2. Login Page

**Purpose**: Provides UI for users to authenticate with email and password.

**Features**:
- Email input field with validation
- Password input field with visibility toggle
- Submit button with loading state
- Error message display
- Link to registration page
- "Remember me" checkbox (optional)

**Validation Rules**:
- Email: Must be valid email format
- Password: Minimum 8 characters
- Both fields required

### 3. Register Page

**Purpose**: Allows new users to create accounts.

**Features**:
- Name input field
- Email input field with validation
- Password input field with strength indicator
- Confirm password field
- Submit button with loading state
- Error message display
- Link to login page

**Validation Rules**:
- Name: Required, minimum 2 characters
- Email: Valid format, unique
- Password: Minimum 8 characters, must match confirmation
- All fields required

### 4. ProtectedRoute Component

**Purpose**: Wraps routes that require authentication, redirecting unauthenticated users to login.

**Interface**:
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
}
```

**Behavior**:
- Check authentication status
- If authenticated: render children
- If not authenticated: redirect to /login
- Store intended destination for post-login redirect

### 5. Modified AppContext

**Purpose**: Integrate user-specific data filtering with authentication.

**Changes**:
- Add `userId` field to all data entities (Task, UserStory, Sprint, etc.)
- Filter data by current user ID
- Associate new data with authenticated user
- Clear data on logout

## Data Models

### User Model (Supabase Auth)

```typescript
interface User {
  id: string;              // UUID generated by Supabase
  email: string;           // Unique, validated email
  name: string;            // Display name
  password_hash: string;   // Bcrypt hashed password (stored in Supabase)
  created_at: string;      // ISO timestamp
  updated_at: string;      // ISO timestamp
}
```

### TeamMember Model (Supabase Database)

```typescript
interface TeamMember {
  id: string;              // UUID, matches Supabase Auth user ID
  name: string;            // Display name
  email: string;           // User email
  role: string;            // User role (e.g., "Developer", "Scrum Master")
  avatar?: string;         // Optional avatar URL
  created_at: string;      // ISO timestamp
  updated_at: string;      // ISO timestamp
}
```

**Database Table**: `team_members`
- Primary Key: `id` (references auth.users.id)
- Indexes: `email` (unique)
- Row Level Security: Enabled (users can read all team members, only admins can delete)

### Session Model (localStorage)

```typescript
interface Session {
  user: {
    id: string;
    email: string;
    name: string;
  };
  accessToken: string;     // Supabase JWT token
  expiresAt: number;       // Unix timestamp
}
```

### Modified Existing Models

All existing data models (Task, UserStory, Sprint, Risk, etc.) will be extended with:

```typescript
interface BaseEntity {
  userId: string;          // References User.id
  // ... existing fields
}
```

## Data Flow

### Login Flow

```
1. User enters credentials in Login Form
2. Form validates input (email format, password length)
3. On submit, AuthContext.login() is called
4. Supabase Auth API verifies credentials
5. If valid:
   - Supabase returns user object and access token
   - AuthContext stores session in localStorage
   - AuthContext updates user state
   - User is redirected to dashboard (or intended route)
6. If invalid:
   - Error message is displayed
   - Form remains on login page
```

### Registration Flow

```
1. User enters registration data in Register Form
2. Form validates all inputs
3. On submit, AuthContext.register() is called
4. Supabase Auth API creates new user
5. If successful:
   - Password is hashed by Supabase (bcrypt)
   - User record is created in auth.users
   - TeamMember record is created in team_members table
   - User is automatically logged in
   - Session is stored in localStorage
   - Redirected to dashboard
6. If email exists:
   - Error message displayed
   - User remains on registration page
7. If TeamMember creation fails:
   - Rollback auth user creation (if possible)
   - Display error message
   - User remains on registration page
```

### Session Restoration Flow

```
1. App loads, AuthProvider initializes
2. Check localStorage for session data
3. If session exists:
   - Validate token expiration
   - If valid: restore user state
   - If expired: clear session, redirect to login
4. If no session:
   - User state remains null
   - Protected routes redirect to login
```

### Logout Flow

```
1. User clicks logout button
2. AuthContext.logout() is called
3. Clear session from localStorage
4. Clear user state in AuthContext
5. Clear all user data from AppContext
6. Redirect to login page
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several redundancies were identified:
- Property 7.4 (logged-out user redirect) is redundant with Property 3.1 (unauthenticated user redirect) - they test the same behavior
- Properties 2.4 and 7.3 both test localStorage clearing on logout - these can be combined
- Properties 1.2 and 2.1 both test session creation - these can be combined into a single comprehensive property

The following properties represent the unique, non-redundant set of correctness guarantees:

### Authentication Properties

**Property 1: Valid credentials authenticate successfully**
*For any* valid user credentials (email and password), when submitted to the login function, the authentication system should verify the credentials and return a successful authentication result.
**Validates: Requirements 1.1**

**Property 2: Session creation on successful authentication**
*For any* successful authentication, the system should create a session object and store it in browser localStorage with the user profile and access token.
**Validates: Requirements 1.2, 2.1**

**Property 3: Dashboard redirect after authentication**
*For any* successful authentication, the system should trigger navigation to the dashboard page (or originally requested URL if stored).
**Validates: Requirements 1.3**

**Property 4: Invalid credentials rejected**
*For any* invalid credentials (wrong password, non-existent email, or malformed input), the authentication system should reject the login attempt and return an error message.
**Validates: Requirements 1.4**

### Session Management Properties

**Property 5: Session restoration on app load**
*For any* valid session data in localStorage, when the application initializes, the authentication context should restore the user state from the session data.
**Validates: Requirements 2.2**

**Property 6: Valid session grants access**
*For any* valid session, when accessing protected routes, the system should allow access without requiring re-authentication.
**Validates: Requirements 2.3**

**Property 7: Logout clears all session data**
*For any* logout operation, the system should clear all session data from localStorage, clear user state from context, and clear all user-specific data from application state.
**Validates: Requirements 2.4, 7.1, 7.3, 7.5**

**Property 8: Invalid session triggers redirect**
*For any* invalid or expired session data, when the application loads or when accessing protected routes, the system should redirect to the login page.
**Validates: Requirements 2.5**

### Protected Route Properties

**Property 9: Unauthenticated users redirected to login**
*For any* protected route, when accessed by an unauthenticated user, the system should redirect to the login page.
**Validates: Requirements 3.1, 7.4**

**Property 10: Authenticated users access protected routes**
*For any* protected route, when accessed by an authenticated user with a valid session, the system should render the requested page content.
**Validates: Requirements 3.2**

**Property 11: Intended URL preservation during redirect**
*For any* protected route access that triggers a redirect to login, the system should store the originally requested URL and navigate to it after successful authentication.
**Validates: Requirements 3.3, 3.4**

### Form Validation Properties

**Property 12: Invalid email format rejected**
*For any* string that does not match valid email format (missing @, invalid domain, etc.), the login form validation should reject it and display an error message.
**Validates: Requirements 4.2**

**Property 13: Valid form data enables submission**
*For any* form state where all fields contain valid data (valid email format, password meets minimum length), the submit button should be enabled.
**Validates: Requirements 4.4**

**Property 14: Loading state disables submission**
*For any* authentication request in progress, the form should disable the submit button and display a loading indicator.
**Validates: Requirements 4.5**

### Registration Properties

**Property 15: Valid registration creates account**
*For any* valid registration data (unique email, valid password, name), the system should create a new user account with a hashed password.
**Validates: Requirements 5.2**

**Property 16: Duplicate email registration rejected**
*For any* registration attempt with an email that already exists in the system, the registration should fail and return an error message.
**Validates: Requirements 5.3**

**Property 17: Successful registration auto-login**
*For any* successful registration, the system should automatically authenticate the user and redirect to the dashboard.
**Validates: Requirements 5.4**

**Property 18: Mismatched passwords rejected**
*For any* registration form where password and confirm password fields contain different values, the validation should fail and display an error message.
**Validates: Requirements 5.5**

### Password Security Properties

**Property 19: Password hashing on storage**
*For any* password provided during registration or password update, the stored password should be a hash (not plain text) generated by a secure hashing algorithm.
**Validates: Requirements 6.1, 6.4**

**Property 20: Password verification uses hash comparison**
*For any* login attempt, the system should verify the provided password by comparing it against the stored hash, not by comparing plain text.
**Validates: Requirements 6.3**

### User Context Integration Properties

**Property 21: User profile stored in context on login**
*For any* successful login, the user profile (id, email, name) should be stored in the application context and accessible throughout the application.
**Validates: Requirements 8.1**

**Property 22: Data association with authenticated user**
*For any* create or update operation on application data (tasks, projects, sprints, etc.), the created or modified entity should have a userId field matching the authenticated user's ID.
**Validates: Requirements 8.3**

**Property 23: Data filtering by authenticated user**
*For any* data query operation, the returned data should only include entities where the userId matches the authenticated user's ID.
**Validates: Requirements 8.4**

**Property 24: Data reload on account switch**
*For any* logout followed by login as a different user, all application data should be reloaded to show only the new user's data.
**Validates: Requirements 8.5**

### Team Member Persistence Properties

**Property 25: TeamMember creation on registration**
*For any* successful user registration, a corresponding TeamMember record should be created in the Supabase database with matching user ID, name, and email.
**Validates: Requirements 9.1, 9.2**

**Property 26: TeamMember verification on login**
*For any* successful login, the system should verify that a TeamMember record exists in the database for the authenticated user.
**Validates: Requirements 9.3**

**Property 27: Team members loaded from database**
*For any* request to display the team page, all team member data should be loaded from the Supabase database, not from localStorage.
**Validates: Requirements 9.4, 9.5**

## Error Handling

### Authentication Errors

1. **Invalid Credentials**
   - Error Code: `AUTH_INVALID_CREDENTIALS`
   - Message: "Invalid email or password"
   - Action: Display error message, keep user on login page

2. **Network Errors**
   - Error Code: `AUTH_NETWORK_ERROR`
   - Message: "Unable to connect. Please check your internet connection."
   - Action: Display error message, allow retry

3. **Session Expired**
   - Error Code: `AUTH_SESSION_EXPIRED`
   - Message: "Your session has expired. Please log in again."
   - Action: Clear session, redirect to login

4. **Email Already Exists**
   - Error Code: `AUTH_EMAIL_EXISTS`
   - Message: "An account with this email already exists"
   - Action: Display error message on registration form

### Validation Errors

1. **Invalid Email Format**
   - Display inline error: "Please enter a valid email address"
   - Prevent form submission

2. **Password Too Short**
   - Display inline error: "Password must be at least 8 characters"
   - Prevent form submission

3. **Passwords Don't Match**
   - Display inline error: "Passwords do not match"
   - Prevent form submission

4. **Required Field Empty**
   - Display inline error: "This field is required"
   - Prevent form submission

### Error Recovery

- All errors should be user-friendly and actionable
- Network errors should allow retry without losing form data
- Validation errors should be cleared when user corrects input
- Authentication errors should not reveal whether email exists (security)

## Testing Strategy

### Unit Testing

The authentication system will use **Vitest** (already configured in the project) for unit testing. Unit tests will cover:

1. **AuthContext Tests**
   - Login function with valid credentials
   - Login function with invalid credentials
   - Register function with valid data
   - Register function with duplicate email
   - Logout function clears state
   - Session restoration from localStorage

2. **Form Validation Tests**
   - Email validation with various invalid formats
   - Password length validation
   - Password match validation
   - Required field validation

3. **ProtectedRoute Tests**
   - Redirect when not authenticated
   - Render children when authenticated
   - Store intended URL on redirect

4. **Integration Tests**
   - Complete login flow
   - Complete registration flow
   - Complete logout flow
   - Session persistence across page refresh

### Property-Based Testing

The authentication system will use **fast-check** (already available in the project) for property-based testing. Each property-based test will:

- Run a minimum of 100 iterations
- Be tagged with a comment referencing the design document property
- Use the format: `**Feature: user-authentication, Property {number}: {property_text}**`

**Property Test Generators**:

1. **Valid User Generator**
   ```typescript
   // Generates valid user objects with email, password, name
   fc.record({
     email: fc.emailAddress(),
     password: fc.string({ minLength: 8, maxLength: 50 }),
     name: fc.string({ minLength: 2, maxLength: 50 })
   })
   ```

2. **Invalid Email Generator**
   ```typescript
   // Generates strings that are not valid emails
   fc.oneof(
     fc.string().filter(s => !s.includes('@')),
     fc.string().map(s => s + '@'),
     fc.string().map(s => '@' + s)
   )
   ```

3. **Invalid Password Generator**
   ```typescript
   // Generates passwords that don't meet requirements
   fc.string({ maxLength: 7 }) // Too short
   ```

4. **Session Data Generator**
   ```typescript
   // Generates valid session objects
   fc.record({
     user: validUserGenerator,
     accessToken: fc.uuid(),
     expiresAt: fc.integer({ min: Date.now() })
   })
   ```

**Property Test Implementation**:

Each correctness property will be implemented as a single property-based test. For example:

```typescript
// Property 1: Valid credentials authenticate successfully
test('Property 1: Valid credentials authenticate successfully', async () => {
  await fc.assert(
    fc.asyncProperty(validUserGenerator, async (user) => {
      // Setup: Create user in system
      await registerUser(user);
      
      // Test: Login with valid credentials
      const result = await login(user.email, user.password);
      
      // Verify: Authentication succeeds
      expect(result.success).toBe(true);
      expect(result.user.email).toBe(user.email);
    }),
    { numRuns: 100 }
  );
});
```

### Test Coverage Goals

- Unit test coverage: 80% minimum
- All 27 correctness properties must have passing property-based tests
- All error handling paths must be tested
- All form validation rules must be tested

### Testing Approach

Following implementation-first development:
1. Implement authentication features
2. Write unit tests for specific examples and edge cases
3. Write property-based tests for universal properties
4. Ensure all tests pass before considering feature complete

## Security Considerations

### Password Security

- Passwords hashed using bcrypt (handled by Supabase)
- Minimum password length: 8 characters
- No password complexity requirements (research shows length is more important)
- Passwords never logged or displayed

### Session Security

- JWT tokens used for session management
- Tokens stored in localStorage (acceptable for this application type)
- Token expiration enforced
- Automatic logout on token expiration

### Data Privacy

- User data isolated by userId
- No cross-user data access
- All queries filtered by authenticated user
- Logout clears all cached user data

### Input Validation

- All user inputs validated on client side
- Email format validation
- Password length validation
- XSS prevention through React's built-in escaping

## Implementation Notes

### Supabase Integration

The application already has Supabase configured. We will use:

**Auth API:**
- `supabase.auth.signUp()` for registration
- `supabase.auth.signInWithPassword()` for login
- `supabase.auth.signOut()` for logout
- `supabase.auth.getSession()` for session restoration
- `supabase.auth.onAuthStateChange()` for session monitoring

**Database API:**
- `supabase.from('team_members').insert()` to create team member records
- `supabase.from('team_members').select()` to load team members
- `supabase.from('team_members').update()` to update team member profiles
- `supabase.from('team_members').delete()` to remove team members (admin only)

### Database Schema

The following table needs to be created in Supabase:

```sql
-- Create team_members table
CREATE TABLE team_members (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'Developer',
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read team members
CREATE POLICY "Team members are viewable by authenticated users"
  ON team_members FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users can insert their own team member record
CREATE POLICY "Users can insert their own team member record"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own team member record
CREATE POLICY "Users can update their own team member record"
  ON team_members FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Migration Strategy

To add userId to existing data:

1. Add `userId` field to all entity types
2. On first login after update, associate all existing data with that user
3. For new installations, userId is added from the start

### Backward Compatibility

- Existing localStorage data will be migrated to include userId
- If no userId exists on data, it will be associated with the first logged-in user
- This ensures existing users don't lose their data

## Performance Considerations

- Session check is synchronous (reads from memory)
- Authentication API calls are async but cached
- Protected route checks add minimal overhead
- Data filtering by userId uses indexed queries (when backend is added)

## Future Enhancements

- Password reset functionality
- Email verification
- Two-factor authentication
- OAuth providers (Google, GitHub)
- Remember me functionality
- Session timeout warnings
- Password strength meter
- Account deletion
