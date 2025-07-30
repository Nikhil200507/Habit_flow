import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Skeleton } from '../ui/skeleton';
import { habitsAPI } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import { 
  Droplets, 
  Brain, 
  BookOpen, 
  Dumbbell, 
  Flame,
  Calendar,
  Trophy,
  MoreVertical,
  Edit,
  Trash2,
  Target,
  Heart,
  Coffee,
  Utensils,
  Moon,
  Gamepad2,
  Music,
  Camera,
  Plane
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const iconMap = {
  droplets: Droplets,
  brain: Brain,
  'book-open': BookOpen,
  dumbbell: Dumbbell,
  heart: Heart,
  coffee: Coffee,
  utensils: Utensils,
  moon: Moon,
  gamepad2: Gamepad2,
  music: Music,
  camera: Camera,
  plane: Plane,
};

const HabitCard = ({ habit, onToggle, onDelete, onEdit }) => {
  const IconComponent = iconMap[habit.icon] || Brain;
  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = habit.completed_dates?.includes(today) || false;
  const progress = Math.round((habit.completion_count / habit.target_days) * 100);
  const { toast } = useToast();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    if (isToggling) return;
    
    setIsToggling(true);
    try {
      await onToggle(habit.id, isCompletedToday);
      toast({
        title: isCompletedToday ? "Habit unchecked" : "Great job! 🎉",
        description: isCompletedToday 
          ? `${habit.name} unmarked for today`
          : `${habit.name} completed for today`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update habit completion",
        variant: "destructive"
      });
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: habit.color }}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{habit.name}</h3>
              <p className="text-sm text-muted-foreground">{habit.description}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(habit)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => onDelete(habit.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">{habit.current_streak}</span>
              <span className="text-xs text-muted-foreground">streak</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">{habit.longest_streak}</span>
              <span className="text-xs text-muted-foreground">best</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">{habit.completion_count}</span>
              <span className="text-xs text-muted-foreground">total</span>
            </div>
          </div>
        </div>

        {/* Today's completion */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Today</span>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isCompletedToday}
              onCheckedChange={handleToggle}
              disabled={isToggling}
              className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
            />
            <span className="text-sm text-muted-foreground">
              {isCompletedToday ? 'Completed' : 'Not completed'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const HabitsList = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchHabits = async () => {
    try {
      const habitsData = await habitsAPI.getHabits();
      setHabits(habitsData);
    } catch (error) {
      console.error('Failed to fetch habits:', error);
      toast({
        title: "Error",
        description: "Failed to load habits",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleToggleHabit = async (habitId, isCurrentlyCompleted) => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      if (isCurrentlyCompleted) {
        await habitsAPI.uncompleteHabit(habitId, today);
      } else {
        await habitsAPI.completeHabit(habitId, today);
      }
      
      // Refresh habits to get updated data
      await fetchHabits();
    } catch (error) {
      console.error('Failed to toggle habit:', error);
      throw error;
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (!window.confirm('Are you sure you want to delete this habit?')) {
      return;
    }

    try {
      await habitsAPI.deleteHabit(habitId);
      toast({
        title: "Habit deleted",
        description: "The habit has been removed successfully."
      });
      await fetchHabits();
    } catch (error) {
      console.error('Failed to delete habit:', error);
      toast({
        title: "Error",
        description: "Failed to delete habit",
        variant: "destructive"
      });
    }
  };

  const handleEditHabit = (habit) => {
    // TODO: Implement edit functionality
    toast({
      title: "Coming soon",
      description: "Edit functionality will be available soon."
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-2 w-full" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          <Target className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No habits yet</h3>
        <p className="text-muted-foreground mb-4">
          Start your journey by creating your first habit
        </p>
      </div>
    );
  }

  const todayCompletions = habits.filter(h => {
    const today = new Date().toISOString().split('T')[0];
    return h.completed_dates?.includes(today);
  }).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Today's Habits</h2>
        <Badge variant="secondary">
          {todayCompletions} / {habits.length} completed
        </Badge>
      </div>
      
      <div className="grid gap-4">
        {habits.map((habit) => (
          <HabitCard 
            key={habit.id} 
            habit={habit} 
            onToggle={handleToggleHabit}
            onDelete={handleDeleteHabit}
            onEdit={handleEditHabit}
          />
        ))}
      </div>
    </div>
  );
};

export default HabitsList;