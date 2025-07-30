// Mock data for habit tracker app

export const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  createdAt: '2025-01-01',
  theme: 'light'
};

export const mockHabits = [
  {
    id: '1',
    name: 'Drink 8 glasses of water',
    description: 'Stay hydrated throughout the day',
    color: '#3B82F6', // Blue
    icon: 'droplets',
    createdAt: '2025-01-01',
    targetDays: 30,
    currentStreak: 7,
    longestStreak: 12,
    completedDates: [
      '2025-01-15', '2025-01-16', '2025-01-17', '2025-01-18', 
      '2025-01-19', '2025-01-20', '2025-01-21'
    ]
  },
  {
    id: '2',
    name: 'Morning meditation',
    description: '10 minutes of mindfulness',
    color: '#10B981', // Emerald
    icon: 'brain',
    createdAt: '2025-01-05',
    targetDays: 21,
    currentStreak: 4,
    longestStreak: 8,
    completedDates: [
      '2025-01-18', '2025-01-19', '2025-01-20', '2025-01-21'
    ]
  },
  {
    id: '3',
    name: 'Read for 30 minutes',
    description: 'Daily reading habit',
    color: '#F59E0B', // Amber
    icon: 'book-open',
    createdAt: '2025-01-10',
    targetDays: 365,
    currentStreak: 2,
    longestStreak: 5,
    completedDates: [
      '2025-01-20', '2025-01-21'
    ]
  },
  {
    id: '4',
    name: 'Exercise',
    description: 'At least 30 minutes of physical activity',
    color: '#EF4444', // Red
    icon: 'dumbbell',
    createdAt: '2025-01-12',
    targetDays: 90,
    currentStreak: 0,
    longestStreak: 3,
    completedDates: [
      '2025-01-17', '2025-01-18', '2025-01-19'
    ]
  }
];

// Helper functions for mock data
export const getTodayCompletion = (habitId) => {
  const today = new Date().toISOString().split('T')[0];
  const habit = mockHabits.find(h => h.id === habitId);
  return habit?.completedDates.includes(today) || false;
};

export const getHabitProgress = (habitId) => {
  const habit = mockHabits.find(h => h.id === habitId);
  if (!habit) return 0;
  return Math.round((habit.completedDates.length / habit.targetDays) * 100);
};

export const mockToggleHabit = (habitId) => {
  const today = new Date().toISOString().split('T')[0];
  const habit = mockHabits.find(h => h.id === habitId);
  
  if (habit) {
    const isCompleted = habit.completedDates.includes(today);
    if (isCompleted) {
      // Remove today from completed dates
      const index = habit.completedDates.indexOf(today);
      habit.completedDates.splice(index, 1);
      habit.currentStreak = Math.max(0, habit.currentStreak - 1);
    } else {
      // Add today to completed dates
      habit.completedDates.push(today);
      habit.currentStreak++;
      if (habit.currentStreak > habit.longestStreak) {
        habit.longestStreak = habit.currentStreak;
      }
    }
  }
  
  return habit;
};