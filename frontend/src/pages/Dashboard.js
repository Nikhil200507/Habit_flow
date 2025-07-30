import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/dashboard/Header';
import HabitsList from '../components/dashboard/HabitsList';
import CalendarView from '../components/dashboard/CalendarView';
import StatsOverview from '../components/dashboard/StatsOverview';
import AddHabitDialog from '../components/dashboard/AddHabitDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Calendar, Home, BarChart3 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('habits');
  const [showAddHabit, setShowAddHabit] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onAddHabit={() => setShowAddHabit(true)} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-muted-foreground">
            Keep up the great work with your habits
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="habits" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Habits
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="habits" className="space-y-6">
            <HabitsList />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <CalendarView />
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <StatsOverview />
          </TabsContent>
        </Tabs>
      </div>

      <AddHabitDialog 
        open={showAddHabit} 
        onOpenChange={setShowAddHabit} 
      />
    </div>
  );
};

export default Dashboard;