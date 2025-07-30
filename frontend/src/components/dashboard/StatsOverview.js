import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { mockHabits } from '../../mock';
import { 
  TrendingUp, 
  Target, 
  Calendar,
  Flame,
  Trophy,
  BarChart3,
  Award,
  Clock
} from 'lucide-react';

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const HabitProgressCard = ({ habit }) => {
  const completionRate = Math.round((habit.completedDates.length / habit.targetDays) * 100);
  const daysRemaining = Math.max(0, habit.targetDays - habit.completedDates.length);
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: habit.color }}
          >
            {habit.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{habit.name}</p>
            <p className="text-xs text-muted-foreground">
              {habit.completedDates.length} / {habit.targetDays} days
            </p>
          </div>
          <Badge variant={completionRate >= 80 ? "default" : completionRate >= 50 ? "secondary" : "outline"}>
            {completionRate}%
          </Badge>
        </div>
        
        <Progress value={completionRate} className="h-2 mb-2" />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{daysRemaining} days remaining</span>
          <span>🔥 {habit.currentStreak} streak</span>
        </div>
      </CardContent>
    </Card>
  );
};

const StatsOverview = () => {
  // Calculate overall stats
  const totalHabits = mockHabits.length;
  const totalCompletions = mockHabits.reduce((sum, habit) => sum + habit.completedDates.length, 0);
  const totalCurrentStreak = mockHabits.reduce((sum, habit) => sum + habit.currentStreak, 0);
  const longestStreak = Math.max(...mockHabits.map(habit => habit.longestStreak));
  const avgCompletionRate = Math.round(
    mockHabits.reduce((sum, habit) => 
      sum + (habit.completedDates.length / habit.targetDays), 0
    ) / totalHabits * 100
  );

  // Get today's completed habits
  const today = new Date().toISOString().split('T')[0];
  const todayCompletions = mockHabits.filter(habit => 
    habit.completedDates.includes(today)
  ).length;

  // Get habits with active streaks
  const activeStreaks = mockHabits.filter(habit => habit.currentStreak > 0).length;

  // Calculate this week's performance
  const thisWeek = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayCompletions = mockHabits.filter(habit => 
      habit.completedDates.includes(dateStr)
    ).length;
    thisWeek.push({
      date: dateStr,
      completions: dayCompletions,
      day: date.toLocaleDateString('en-US', { weekday: 'short' })
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Statistics Overview</h2>
        <Badge variant="secondary">
          Last updated: {new Date().toLocaleDateString()}
        </Badge>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Habits"
          value={totalHabits}
          subtitle="Active habits"
          icon={Target}
          color="bg-blue-500"
        />
        <StatCard
          title="Today's Progress"
          value={`${todayCompletions}/${totalHabits}`}
          subtitle={`${Math.round((todayCompletions/totalHabits)*100)}% complete`}
          icon={Calendar}
          color="bg-green-500"
        />
        <StatCard
          title="Active Streaks"
          value={activeStreaks}
          subtitle={`Total: ${totalCurrentStreak} days`}
          icon={Flame}
          color="bg-orange-500"
        />
        <StatCard
          title="Best Streak"
          value={longestStreak}
          subtitle="Personal record"
          icon={Trophy}
          color="bg-yellow-500"
        />
      </div>

      {/* This Week Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            This Week's Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {thisWeek.map((day, index) => (
              <div key={index} className="text-center">
                <p className="text-xs text-muted-foreground mb-1">{day.day}</p>
                <div className="relative">
                  <div className="w-full h-16 bg-muted rounded-lg flex items-end justify-center p-1">
                    <div 
                      className="w-full bg-primary rounded transition-all"
                      style={{ 
                        height: `${Math.max(10, (day.completions / totalHabits) * 100)}%`,
                        opacity: day.completions > 0 ? 1 : 0.3
                      }}
                    />
                  </div>
                  <p className="text-xs font-medium mt-1">{day.completions}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Daily completions</span>
            <span>Max: {totalHabits}</span>
          </div>
        </CardContent>
      </Card>

      {/* Individual Habit Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Individual Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {mockHabits.map((habit) => (
              <HabitProgressCard key={habit.id} habit={habit} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4" />
                <span className="font-medium text-sm">Average Completion</span>
              </div>
              <p className="text-2xl font-bold">{avgCompletionRate}%</p>
              <p className="text-xs text-muted-foreground">Across all habits</p>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="font-medium text-sm">Total Completions</span>
              </div>
              <p className="text-2xl font-bold">{totalCompletions}</p>
              <p className="text-xs text-muted-foreground">Days completed</p>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4" />
                <span className="font-medium text-sm">Consistency Score</span>
              </div>
              <p className="text-2xl font-bold">
                {Math.round((activeStreaks / totalHabits) * 100)}%
              </p>
              <p className="text-xs text-muted-foreground">Habits with streaks</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsOverview;