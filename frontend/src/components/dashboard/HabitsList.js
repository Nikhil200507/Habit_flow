import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { mockHabits, getTodayCompletion, getHabitProgress, mockToggleHabit } from '../../mock';
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
  Trash2
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
};

const HabitCard = ({ habit, onToggle }) => {
  const IconComponent = iconMap[habit.icon] || Brain;
  const isCompletedToday = getTodayCompletion(habit.id);
  const progress = getHabitProgress(habit.id);
  const { toast } = useToast();

  const handleToggle = () => {
    onToggle(habit.id);
    toast({
      title: isCompletedToday ? "Habit unchecked" : "Great job! 🎉",
      description: isCompletedToday 
        ? `${habit.name} unmarked for today`
        : `${habit.name} completed for today`
    });
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
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
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
              <span className="text-sm font-medium">{habit.currentStreak}</span>
              <span className="text-xs text-muted-foreground">streak</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">{habit.longestStreak}</span>
              <span className="text-xs text-muted-foreground">best</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">{habit.completedDates.length}</span>
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
  const [habits, setHabits] = useState(mockHabits);

  const handleToggleHabit = (habitId) => {
    const updatedHabit = mockToggleHabit(habitId);
    setHabits(prev => prev.map(h => h.id === habitId ? updatedHabit : h));
  };

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
        <Button>Add your first habit</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Today's Habits</h2>
        <Badge variant="secondary">
          {habits.filter(h => getTodayCompletion(h.id)).length} / {habits.length} completed
        </Badge>
      </div>
      
      <div className="grid gap-4">
        {habits.map((habit) => (
          <HabitCard 
            key={habit.id} 
            habit={habit} 
            onToggle={handleToggleHabit}
          />
        ))}
      </div>
    </div>
  );
};

export default HabitsList;