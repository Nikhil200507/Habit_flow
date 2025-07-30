from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

# User Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    password_hash: str
    theme: str = "light"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    theme: str
    created_at: datetime

# Habit Models
class Habit(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    description: Optional[str] = ""
    color: str = "#3B82F6"
    icon: str = "brain"
    target_days: int = 30
    created_at: datetime = Field(default_factory=datetime.utcnow)

class HabitCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    color: str = "#3B82F6"
    icon: str = "brain"
    target_days: int = 30

class HabitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    target_days: Optional[int] = None

class HabitWithStats(BaseModel):
    id: str
    user_id: str
    name: str
    description: str
    color: str
    icon: str
    target_days: int
    created_at: datetime
    current_streak: int = 0
    longest_streak: int = 0
    completion_count: int = 0
    completed_dates: List[str] = []

# Habit Completion Models
class HabitCompletion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    habit_id: str
    user_id: str
    completion_date: str  # YYYY-MM-DD format
    created_at: datetime = Field(default_factory=datetime.utcnow)

class HabitCompletionCreate(BaseModel):
    completion_date: str  # YYYY-MM-DD format

# Statistics Models
class StatsOverview(BaseModel):
    total_habits: int
    active_streaks: int
    total_current_streak: int
    longest_streak: int
    total_completions: int
    today_completions: int
    avg_completion_rate: float
    this_week_performance: List[dict]

class CalendarData(BaseModel):
    completion_dates: List[str]
    habits_by_date: dict

# Authentication Models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None