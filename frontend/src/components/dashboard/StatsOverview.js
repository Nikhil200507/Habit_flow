import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { statsAPI, habitsAPI } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
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
  const completionRate = Math.round((habit.completion_count / habit.target_days) * 100);
  const daysRemaining = Math.max(0, habit.target_days - habit.completion_count);
  
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
              {habit.completion_count} / {habit.target_days} days
            </p>
          </div>
          <Badge variant={completionRate >= 80 ? "default" : completionRate >= 50 ? "secondary" : "outline"}>
            {completionRate}%
          </Badge>
        </div>
        
        <Progress value={completionRate} className="h-2 mb-2" />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{daysRemaining} days remaining</span>
          <span>🔥 {habit.current_streak} streak</span>
        </div>
      </CardContent>
    </Card>
  );
};

const StatsOverview = () => {
  const [stats, setStats] = useState(null);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, habitsData] = await Promise.all([
          statsAPI.getOverview(),
          habitsAPI.getHabits()
        ]);
        
        setStats(statsData);
        setHabits(habitsData);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        toast({
          title: "Error",
          description: "Failed to load statistics",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-6 w-32" />
        </div>

        {/* Main Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="w-10 h-10 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Week Performance */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="text-center space-y-2">
                  <Skeleton className="h-4 w-8 mx-auto" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-4 w-4 mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No statistics available</p>
      </div>
    );
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
          value={stats.total_habits}
          subtitle="Active habits"
          icon={Target}
          color="bg-blue-500"
        />
        <StatCard
          title="Today's Progress"
          value={`${stats.today_completions}/${stats.total_habits}`}
          subtitle={`${Math.round((stats.today_completions/Math.max(stats.total_habits, 1))*100)}% complete`}
          icon={Calendar}
          color="bg-green-500"
        />
        <StatCard
          title="Active Streaks"
          value={stats.active_streaks}
          subtitle={`Total: ${stats.total_current_streak} days`}
          icon={Flame}
          color="bg-orange-500"
        />
        <StatCard
          title="Best Streak"
          value={stats.longest_streak}
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
            {stats.this_week_performance.map((day, index) => (
              <div key={index} className="text-center">
                <p className="text-xs text-muted-foreground mb-1">{day.day}</p>
                <div className="relative">
                  <div className="w-full h-16 bg-muted rounded-lg flex items-end justify-center p-1">
                    <div 
                      className="w-full bg-primary rounded transition-all"
                      style={{ 
                        height: `${Math.max(10, (day.completions / Math.max(stats.total_habits, 1)) * 100)}%`,
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
            <span>Max: {stats.total_habits}</span>
          </div>
        </CardContent>
      </Card>

      {/* Individual Habit Progress */}
      {habits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Individual Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {habits.map((habit) => (
                <HabitProgressCard key={habit.id} habit={habit} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
              <p className="text-2xl font-bold">{stats.avg_completion_rate}%</p>
              <p className="text-xs text-muted-foreground">Across all habits</p>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="font-medium text-sm">Total Completions</span>
              </div>
              <p className="text-2xl font-bold">{stats.total_completions}</p>
              <p className="text-xs text-muted-foreground">Days completed</p>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4" />
                <span className="font-medium text-sm">Consistency Score</span>
              </div>
              <p className="text-2xl font-bold">
                {Math.round((stats.active_streaks / Math.max(stats.total_habits, 1)) * 100)}%
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