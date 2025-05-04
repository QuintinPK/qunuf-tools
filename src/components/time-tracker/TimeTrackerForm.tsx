import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TimeTrackerSession } from "@/types/time-tracker";
import { Clock, Timer, TimerOff, Check } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface TimeTrackerFormProps {
  onAddSession: (session: Omit<TimeTrackerSession, 'id' | 'created_at' | 'updated_at'>) => void;
}

const CATEGORIES = ["Preparation", "Maintenance", "Check-in", "Check-out", "Other"];
const STORAGE_KEY = "activeTimeTrackerSession";

const TimeTrackerForm: React.FC<TimeTrackerFormProps> = ({ onAddSession }) => {
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [currentTimer, setCurrentTimer] = useState("00:00:00");
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Load active session from localStorage on component mount
  useEffect(() => {
    const savedSession = localStorage.getItem(STORAGE_KEY);
    if (savedSession) {
      const { startTimeStr, category: savedCategory, customCategory: savedCustomCategory, notes: savedNotes } = JSON.parse(savedSession);
      
      const parsedStartTime = new Date(startTimeStr);
      setStartTime(parsedStartTime);
      setCategory(savedCategory);
      setCustomCategory(savedCustomCategory || "");
      setNotes(savedNotes || "");
      setIsActive(true);
    }
  }, []);

  // Update timer display when session is active
  useEffect(() => {
    if (isActive && startTime) {
      const id = window.setInterval(() => {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        
        const hours = Math.floor(diffInSeconds / 3600).toString().padStart(2, "0");
        const minutes = Math.floor((diffInSeconds % 3600) / 60).toString().padStart(2, "0");
        const seconds = (diffInSeconds % 60).toString().padStart(2, "0");
        
        setCurrentTimer(`${hours}:${minutes}:${seconds}`);
      }, 1000);
      
      setIntervalId(id);
      return () => clearInterval(id);
    }
  }, [isActive, startTime]);

  // Save active session to localStorage whenever it changes
  useEffect(() => {
    if (isActive && startTime) {
      const sessionData = {
        startTimeStr: startTime.toISOString(),
        category,
        customCategory: customCategory || null,
        notes: notes || null
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    } else if (!isActive) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [isActive, startTime, category, customCategory, notes]);

  const handleStart = () => {
    const now = new Date();
    setStartTime(now);
    setIsActive(true);
  };

  const handleStop = async () => {
    if (!startTime) return;
    
    const endTime = new Date();
    
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    
    // Validate form before saving
    if (!category) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }
    
    // Create new session
    const newSession = {
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      category,
      custom_category: category === "Other" ? customCategory : null,
      notes: notes.trim() || null
    };
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      await onAddSession(newSession);
      
      // Reset form and remove from localStorage
      setIsActive(false);
      setStartTime(null);
      setCurrentTimer("00:00:00");
      setCategory("");
      setCustomCategory("");
      setNotes("");
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error saving session:", error);
      toast({
        title: "Error",
        description: "Failed to save time tracking session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    
    setIsActive(false);
    setStartTime(null);
    setCurrentTimer("00:00:00");
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {isActive ? "Time Tracking In Progress" : "Start Tracking Time"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isActive ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={category} 
                  onValueChange={setCategory}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {category === "Other" && (
                <div className="space-y-2">
                  <Label htmlFor="customCategory">Custom Category</Label>
                  <Input
                    id="customCategory"
                    placeholder="Enter custom category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any relevant notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleStart} 
                className="w-full"
                disabled={!category || (category === "Other" && !customCategory)}
              >
                <Timer className="mr-2 h-4 w-4" />
                Start Tracking
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-2xl font-mono font-bold mb-2">{currentTimer}</div>
                <div className="text-sm text-muted-foreground">
                  Started at: {startTime && format(startTime, "yyyy-MM-dd HH:mm:ss")}
                </div>
                <div className="text-sm font-medium mt-2">
                  Category: {category}{category === "Other" ? `: ${customCategory}` : ""}
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button 
                  onClick={handleStop} 
                  className="flex-1"
                  variant="default"
                  disabled={isSubmitting}
                >
                  <Check className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Complete & Save"}
                </Button>
                <Button 
                  onClick={handleCancel} 
                  variant="destructive"
                  disabled={isSubmitting}
                >
                  <TimerOff className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeTrackerForm;
