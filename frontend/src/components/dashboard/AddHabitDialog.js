import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useToast } from '../../hooks/use-toast';
import { habitsAPI } from '../../services/api';
import { 
  Droplets, 
  Brain, 
  BookOpen, 
  Dumbbell,
  Heart,
  Coffee,
  Utensils,
  Moon,
  Gamepad2,
  Music,
  Camera,
  Plane
} from 'lucide-react';

const habitIcons = [
  { value: 'droplets', label: 'Water', icon: Droplets },
  { value: 'brain', label: 'Meditation', icon: Brain },
  { value: 'book-open', label: 'Reading', icon: BookOpen },
  { value: 'dumbbell', label: 'Exercise', icon: Dumbbell },
  { value: 'heart', label: 'Health', icon: Heart },
  { value: 'coffee', label: 'Morning Routine', icon: Coffee },
  { value: 'utensils', label: 'Healthy Eating', icon: Utensils },
  { value: 'moon', label: 'Sleep', icon: Moon },
  { value: 'gamepad2', label: 'Hobby', icon: Gamepad2 },
  { value: 'music', label: 'Practice', icon: Music },
  { value: 'camera', label: 'Creativity', icon: Camera },
  { value: 'plane', label: 'Adventure', icon: Plane },
];

const habitColors = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#10B981', label: 'Emerald' },
  { value: '#F59E0B', label: 'Amber' },
  { value: '#EF4444', label: 'Red' },
  { value: '#8B5CF6', label: 'Violet' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#84CC16', label: 'Lime' },
  { value: '#F97316', label: 'Orange' },
  { value: '#6366F1', label: 'Indigo' },
];

const AddHabitDialog = ({ open, onOpenChange, onHabitCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'brain',
    color: '#3B82F6',
    target_days: 30
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a habit name",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const newHabit = await habitsAPI.createHabit(formData);
      
      toast({
        title: "Habit created! 🎉",
        description: `"${formData.name}" has been added to your habits.`
      });
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        icon: 'brain',
        color: '#3B82F6',
        target_days: 30
      });
      
      // Notify parent component to refresh habits
      if (onHabitCreated) {
        onHabitCreated(newHabit);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create habit:', error);
      toast({
        title: "Error",
        description: "Failed to create habit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedIcon = habitIcons.find(icon => icon.value === formData.icon);
  const IconComponent = selectedIcon?.icon || Brain;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Habit</DialogTitle>
          <DialogDescription>
            Add a new habit to track. Choose an icon, color, and set your target goal.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Habit Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Habit Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Drink 8 glasses of water"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of your habit..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <Select 
              value={formData.icon} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4" />
                    {selectedIcon?.label}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {habitIcons.map((icon) => {
                  const Icon = icon.icon;
                  return (
                    <SelectItem key={icon.value} value={icon.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {icon.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-5 gap-2">
              {habitColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    formData.color === color.value 
                      ? 'border-foreground scale-110' 
                      : 'border-border hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                  disabled={isSubmitting}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* Target Days */}
          <div className="space-y-2">
            <Label htmlFor="targetDays">Target Goal (Days)</Label>
            <Select 
              value={formData.target_days.toString()} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, target_days: parseInt(value) }))}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">1 week (7 days)</SelectItem>
                <SelectItem value="21">3 weeks (21 days)</SelectItem>
                <SelectItem value="30">1 month (30 days)</SelectItem>
                <SelectItem value="60">2 months (60 days)</SelectItem>
                <SelectItem value="90">3 months (90 days)</SelectItem>
                <SelectItem value="365">1 year (365 days)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-2">Preview:</p>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: formData.color }}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">{formData.name || 'Habit Name'}</p>
                <p className="text-sm text-muted-foreground">
                  {formData.description || 'Habit description'}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Habit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddHabitDialog;