import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calendar } from '../ui/calendar';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { habitsAPI } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
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

    fetchHabits();
  }, [toast]);

  // Get all completion dates from all habits
  const getAllCompletionDates = () => {
    const allDates = new Set();
    habits.forEach(habit => {
      habit.completed_dates?.forEach(date => {
        allDates.add(date);
      });
    });
    return Array.from(allDates);
  };

  // Get habits completed on a specific date
  const getHabitsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return habits.filter(habit => 
      habit.completed_dates?.includes(dateStr)
    );
  };

  const completionDates = getAllCompletionDates();
  const selectedDateHabits = getHabitsForDate(selectedDate);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-6 w-48" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-32" />
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Calendar View</h2>
        <Badge variant="secondary">
          {completionDates.length} days with completed habits
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Habit Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              month={selectedMonth}
              onMonthChange={setSelectedMonth}
              modifiers={{
                completed: completionDates.map(date => new Date(date))
              }}
              modifiersStyles={{
                completed: {
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  borderRadius: '6px'
                }
              }}
              className="rounded-md border"
            />
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-primary rounded"></div>
                <span>Days with completed habits</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 border border-muted-foreground rounded"></div>
                <span>Today: {selectedDate.toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateHabits.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {selectedDateHabits.length} habit{selectedDateHabits.length !== 1 ? 's' : ''} completed
                </p>
                <div className="space-y-2">
                  {selectedDateHabits.map((habit) => (
                    <div 
                      key={habit.id}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: habit.color }}
                      />
                      <div>
                        <p className="font-medium text-sm">{habit.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {habit.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  No habits completed on this date
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {habits.map((habit) => {
              const currentMonth = selectedMonth.getMonth();
              const currentYear = selectedMonth.getFullYear();
              
              const monthCompletions = (habit.completed_dates || []).filter(date => {
                const completionDate = new Date(date);
                return completionDate.getMonth() === currentMonth && 
                       completionDate.getFullYear() === currentYear;
              }).length;

              const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
              const completionRate = Math.round((monthCompletions / daysInMonth) * 100);

              return (
                <div key={habit.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: habit.color }}
                    />
                    <span className="text-sm font-medium truncate">
                      {habit.name}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{monthCompletions} days</span>
                      <span>{completionRate}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${completionRate}%`,
                          backgroundColor: habit.color
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;