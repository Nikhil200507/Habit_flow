from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from datetime import datetime, timedelta
from typing import List

# Import models and auth
from .models import (
    User, UserCreate, UserLogin, UserResponse,
    Habit, HabitCreate, HabitUpdate, HabitWithStats,
    HabitCompletion, HabitCompletionCreate,
    StatsOverview, CalendarData, Token
)
from .auth import (
    authenticate_user, create_access_token, get_current_user,
    get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES
)
from .utils import calculate_streaks, get_week_performance, get_completion_rate

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Authentication endpoints
@api_router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_password
    )
    
    await db.users.insert_one(user.dict())
    return UserResponse(**user.dict())

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user = await authenticate_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse(**current_user.dict())

# Habit management endpoints
@api_router.get("/habits", response_model=List[HabitWithStats])
async def get_habits(current_user: User = Depends(get_current_user)):
    habits = await db.habits.find({"user_id": current_user.id}).to_list(100)
    habits_with_stats = []
    
    for habit_doc in habits:
        habit = Habit(**habit_doc)
        
        # Get completions for this habit
        completions = await db.habit_completions.find({
            "habit_id": habit.id,
            "user_id": current_user.id
        }).to_list(1000)
        
        completed_dates = [comp["completion_date"] for comp in completions]
        current_streak, longest_streak = calculate_streaks(completed_dates)
        
        habit_with_stats = HabitWithStats(
            **habit.dict(),
            current_streak=current_streak,
            longest_streak=longest_streak,
            completion_count=len(completed_dates),
            completed_dates=completed_dates
        )
        habits_with_stats.append(habit_with_stats)
    
    return habits_with_stats

@api_router.post("/habits", response_model=HabitWithStats)
async def create_habit(
    habit_data: HabitCreate,
    current_user: User = Depends(get_current_user)
):
    habit = Habit(
        user_id=current_user.id,
        **habit_data.dict()
    )
    
    await db.habits.insert_one(habit.dict())
    
    # Return habit with empty stats (new habit)
    return HabitWithStats(
        **habit.dict(),
        current_streak=0,
        longest_streak=0,
        completion_count=0,
        completed_dates=[]
    )

@api_router.put("/habits/{habit_id}", response_model=HabitWithStats)
async def update_habit(
    habit_id: str,
    habit_update: HabitUpdate,
    current_user: User = Depends(get_current_user)
):
    # Verify habit belongs to user
    habit_doc = await db.habits.find_one({
        "id": habit_id,
        "user_id": current_user.id
    })
    if not habit_doc:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Update habit
    update_data = {k: v for k, v in habit_update.dict().items() if v is not None}
    if update_data:
        await db.habits.update_one(
            {"id": habit_id},
            {"$set": update_data}
        )
    
    # Get updated habit with stats
    updated_habit = await db.habits.find_one({"id": habit_id})
    completions = await db.habit_completions.find({
        "habit_id": habit_id,
        "user_id": current_user.id
    }).to_list(1000)
    
    completed_dates = [comp["completion_date"] for comp in completions]
    current_streak, longest_streak = calculate_streaks(completed_dates)
    
    return HabitWithStats(
        **updated_habit,
        current_streak=current_streak,
        longest_streak=longest_streak,
        completion_count=len(completed_dates),
        completed_dates=completed_dates
    )

@api_router.delete("/habits/{habit_id}")
async def delete_habit(
    habit_id: str,
    current_user: User = Depends(get_current_user)
):
    # Verify habit belongs to user
    habit_doc = await db.habits.find_one({
        "id": habit_id,
        "user_id": current_user.id
    })
    if not habit_doc:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Delete habit and all its completions
    await db.habits.delete_one({"id": habit_id})
    await db.habit_completions.delete_many({"habit_id": habit_id})
    
    return {"message": "Habit deleted successfully"}

# Habit completion endpoints
@api_router.post("/habits/{habit_id}/complete")
async def complete_habit(
    habit_id: str,
    completion_data: HabitCompletionCreate,
    current_user: User = Depends(get_current_user)
):
    # Verify habit belongs to user
    habit_doc = await db.habits.find_one({
        "id": habit_id,
        "user_id": current_user.id
    })
    if not habit_doc:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Check if already completed for this date
    existing_completion = await db.habit_completions.find_one({
        "habit_id": habit_id,
        "user_id": current_user.id,
        "completion_date": completion_data.completion_date
    })
    
    if existing_completion:
        raise HTTPException(
            status_code=400,
            detail="Habit already completed for this date"
        )
    
    # Create completion record
    completion = HabitCompletion(
        habit_id=habit_id,
        user_id=current_user.id,
        completion_date=completion_data.completion_date
    )
    
    await db.habit_completions.insert_one(completion.dict())
    return {"message": "Habit marked as completed"}

@api_router.delete("/habits/{habit_id}/complete/{completion_date}")
async def uncomplete_habit(
    habit_id: str,
    completion_date: str,
    current_user: User = Depends(get_current_user)
):
    # Verify habit belongs to user
    habit_doc = await db.habits.find_one({
        "id": habit_id,
        "user_id": current_user.id
    })
    if not habit_doc:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    # Delete completion record
    result = await db.habit_completions.delete_one({
        "habit_id": habit_id,
        "user_id": current_user.id,
        "completion_date": completion_date
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Completion not found")
    
    return {"message": "Habit completion removed"}

# Statistics endpoints
@api_router.get("/stats/overview", response_model=StatsOverview)
async def get_stats_overview(current_user: User = Depends(get_current_user)):
    # Get all user habits
    habits = await db.habits.find({"user_id": current_user.id}).to_list(100)
    total_habits = len(habits)
    
    if total_habits == 0:
        return StatsOverview(
            total_habits=0,
            active_streaks=0,
            total_current_streak=0,
            longest_streak=0,
            total_completions=0,
            today_completions=0,
            avg_completion_rate=0.0,
            this_week_performance=[]
        )
    
    # Get all completions for user
    all_completions = await db.habit_completions.find({
        "user_id": current_user.id
    }).to_list(10000)
    
    # Calculate stats
    today = datetime.now().strftime("%Y-%m-%d")
    today_completions = len([c for c in all_completions if c["completion_date"] == today])
    
    total_current_streak = 0
    longest_streak_overall = 0
    active_streaks = 0
    total_completion_rate = 0
    
    habits_data = []
    for habit in habits:
        habit_completions = [c for c in all_completions if c["habit_id"] == habit["id"]]
        completed_dates = [c["completion_date"] for c in habit_completions]
        
        current_streak, longest_streak = calculate_streaks(completed_dates)
        total_current_streak += current_streak
        longest_streak_overall = max(longest_streak_overall, longest_streak)
        
        if current_streak > 0:
            active_streaks += 1
            
        completion_rate = get_completion_rate(len(completed_dates), habit["target_days"])
        total_completion_rate += completion_rate
        
        habits_data.append({
            "id": habit["id"],
            "completed_dates": completed_dates,
            "current_streak": current_streak,
            "longest_streak": longest_streak
        })
    
    avg_completion_rate = total_completion_rate / total_habits if total_habits > 0 else 0
    this_week_performance = get_week_performance(habits_data)
    
    return StatsOverview(
        total_habits=total_habits,
        active_streaks=active_streaks,
        total_current_streak=total_current_streak,
        longest_streak=longest_streak_overall,
        total_completions=len(all_completions),
        today_completions=today_completions,
        avg_completion_rate=round(avg_completion_rate, 1),
        this_week_performance=this_week_performance
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()