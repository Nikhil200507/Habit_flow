from datetime import datetime, timedelta
from typing import List, Dict
from collections import defaultdict

def calculate_streaks(completion_dates: List[str]) -> tuple[int, int]:
    """Calculate current and longest streaks from completion dates."""
    if not completion_dates:
        return 0, 0
    
    # Sort dates in descending order (most recent first)
    sorted_dates = sorted(completion_dates, reverse=True)
    
    # Convert string dates to datetime objects
    date_objects = [datetime.strptime(date, "%Y-%m-%d").date() for date in sorted_dates]
    
    # Calculate current streak
    today = datetime.now().date()
    current_streak = 0
    
    # Check if the most recent completion was today or yesterday
    if date_objects and (date_objects[0] == today or date_objects[0] == today - timedelta(days=1)):
        current_date = date_objects[0]
        for date_obj in date_objects:
            if date_obj == current_date:
                current_streak += 1
                current_date -= timedelta(days=1)
            else:
                # If there's a gap, check if it's just a 1-day gap
                if current_date == date_obj + timedelta(days=1):
                    current_date = date_obj
                    continue
                else:
                    break
    
    # Calculate longest streak
    longest_streak = 0
    temp_streak = 1
    
    if len(date_objects) > 1:
        for i in range(1, len(date_objects)):
            if date_objects[i-1] - date_objects[i] == timedelta(days=1):
                temp_streak += 1
                longest_streak = max(longest_streak, temp_streak)
            else:
                temp_streak = 1
        longest_streak = max(longest_streak, temp_streak)
    else:
        longest_streak = 1 if date_objects else 0
    
    # Ensure longest streak is at least as long as current streak
    longest_streak = max(longest_streak, current_streak)
    
    return current_streak, longest_streak

def get_week_performance(habits_data: List[Dict]) -> List[Dict]:
    """Get this week's performance data."""
    today = datetime.now().date()
    week_data = []
    
    for i in range(6, -1, -1):  # Last 7 days
        date = today - timedelta(days=i)
        date_str = date.strftime("%Y-%m-%d")
        
        # Count completions for this date across all habits
        completions = 0
        for habit in habits_data:
            if date_str in habit.get('completed_dates', []):
                completions += 1
        
        week_data.append({
            'date': date_str,
            'day': date.strftime('%a'),
            'completions': completions
        })
    
    return week_data

def get_completion_rate(completed_days: int, target_days: int) -> float:
    """Calculate completion rate as percentage."""
    if target_days == 0:
        return 0.0
    return round((completed_days / target_days) * 100, 1)

def group_completions_by_date(completions: List[Dict]) -> Dict[str, List[str]]:
    """Group habit completions by date."""
    grouped = defaultdict(list)
    for completion in completions:
        date = completion['completion_date']
        habit_id = completion['habit_id']
        grouped[date].append(habit_id)
    return dict(grouped)