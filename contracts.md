# API Contracts & Backend Integration Plan

## Overview
This document outlines the API contracts and integration plan for replacing mock data with real backend functionality.

## Current Mock Data to Replace

### 1. User Authentication (mockUser in mock.js)
```javascript
mockUser = {
  id: '1',
  name: 'John Doe', 
  email: 'john@example.com',
  createdAt: '2025-01-01',
  theme: 'light'
}
```

### 2. Habits Data (mockHabits in mock.js)
```javascript
mockHabits = [{
  id: '1',
  name: 'Drink 8 glasses of water',
  description: 'Stay hydrated throughout the day',
  color: '#3B82F6',
  icon: 'droplets',
  createdAt: '2025-01-01',
  targetDays: 30,
  currentStreak: 7,
  longestStreak: 12,
  completedDates: ['2025-01-15', '2025-01-16', ...]
}]
```

## API Endpoints to Implement

### Authentication Endpoints
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
```

### Habit Management Endpoints
```
GET /api/habits - Get user's habits
POST /api/habits - Create new habit
PUT /api/habits/:id - Update habit
DELETE /api/habits/:id - Delete habit
```

### Habit Completion Endpoints
```
POST /api/habits/:id/complete - Mark habit as completed for date
DELETE /api/habits/:id/complete - Unmark habit completion for date
GET /api/habits/:id/completions - Get completion history
```

### Stats Endpoints
```
GET /api/stats/overview - Get user's overall stats
GET /api/stats/calendar/:month/:year - Get calendar data for month
```

## Database Models

### User Model
```python
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    password_hash: str
    theme: str = "light"
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

### Habit Model
```python
class Habit(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    description: str = ""
    color: str = "#3B82F6"
    icon: str = "brain"
    target_days: int = 30
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

### HabitCompletion Model
```python
class HabitCompletion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    habit_id: str
    user_id: str
    completion_date: str  # YYYY-MM-DD format
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

## Frontend Integration Points

### 1. AuthContext.js Changes
- Replace `login()` mock with real API call to `/api/auth/login`
- Replace `signup()` mock with real API call to `/api/auth/register`
- Add JWT token handling and storage
- Replace localStorage user with JWT token validation

### 2. Mock Data Removal
- Remove `mock.js` file completely
- Replace all mock function calls in components with real API calls
- Add proper error handling for API failures

### 3. Components to Update

#### HabitsList.js
- Replace `mockHabits` with API call to `GET /api/habits`
- Replace `mockToggleHabit()` with API calls to complete/uncomplete endpoints
- Add loading states and error handling

#### CalendarView.js
- Replace habit data with API call to `GET /api/habits`
- Replace completion data with API call to `GET /api/stats/calendar`

#### StatsOverview.js
- Replace all mock calculations with API call to `GET /api/stats/overview`

#### AddHabitDialog.js
- Replace mock habit creation with real API call to `POST /api/habits`
- Add proper form validation and error handling

## Implementation Strategy

### Phase 1: Backend Core
1. Set up JWT authentication system
2. Create User, Habit, and HabitCompletion models
3. Implement authentication endpoints
4. Add user registration/login functionality

### Phase 2: Habit Management
1. Implement CRUD operations for habits
2. Add habit completion tracking endpoints
3. Calculate streaks and statistics in backend

### Phase 3: Frontend Integration
1. Create an API service layer for HTTP calls
2. Update AuthContext with real authentication
3. Replace mock data calls with real API calls
4. Add loading states and error handling
5. Test all user flows end-to-end

### Phase 4: Data Migration
1. Ensure all mock functionality is replaced
2. Test streak calculations and statistics
3. Verify calendar view with real data
4. Complete integration testing

## Security Considerations
- JWT token expiration and refresh
- Password hashing with bcrypt
- Input validation and sanitization
- User data isolation (users can only access their own habits)
- CORS configuration for frontend-backend communication

## Error Handling Strategy
- Consistent error response format
- Frontend toast notifications for user feedback
- Graceful degradation for network failures
- Proper HTTP status codes
- Validation error messages