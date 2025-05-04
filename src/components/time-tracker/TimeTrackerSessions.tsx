
import React, { useState } from "react";
import { format, parseISO, differenceInMinutes } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimeTrackerSession } from "@/types/time-tracker";
import { Edit, Trash2, Calendar } from "lucide-react";
import { formatDuration } from "@/utils/time-utils";

interface TimeTrackerSessionsProps {
  sessions: TimeTrackerSession[];
  isLoading: boolean;
  onUpdateSession: (session: TimeTrackerSession) => void;
  onDeleteSession: (id: string) => void;
  onRefresh: () => void;
}

const CATEGORIES = ["Preparation", "Maintenance", "Check-in", "Check-out", "Other"];

const TimeTrackerSessions: React.FC<TimeTrackerSessionsProps> = ({
  sessions,
  isLoading,
  onUpdateSession,
  onDeleteSession,
  onRefresh,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState<TimeTrackerSession | null>(null);
  const [editCategory, setEditCategory] = useState("");
  const [editCustomCategory, setEditCustomCategory] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editEndDate, setEditEndDate] = useState("");

  const handleEdit = (session: TimeTrackerSession) => {
    setCurrentSession(session);
    setEditCategory(session.category);
    setEditCustomCategory(session.custom_category || "");
    setEditNotes(session.notes || "");
    
    const startDate = parseISO(session.start_time);
    const endDate = session.end_time ? parseISO(session.end_time) : null;
    
    setEditStartDate(format(startDate, "yyyy-MM-dd"));
    setEditStartTime(format(startDate, "HH:mm"));
    
    if (endDate) {
      setEditEndDate(format(endDate, "yyyy-MM-dd"));
      setEditEndTime(format(endDate, "HH:mm"));
    } else {
      setEditEndDate("");
      setEditEndTime("");
    }
    
    setDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!currentSession) return;
    
    // Parse dates and combine with times
    const startDateTime = new Date(`${editStartDate}T${editStartTime}`);
    const endDateTime = editEndDate && editEndTime 
      ? new Date(`${editEndDate}T${editEndTime}`) 
      : null;
    
    // Validate times (end time should be after start time)
    if (endDateTime && startDateTime >= endDateTime) {
      alert("End time must be after start time");
      return;
    }
    
    const updatedSession: TimeTrackerSession = {
      ...currentSession,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime ? endDateTime.toISOString() : null,
      category: editCategory,
      custom_category: editCategory === "Other" ? editCustomCategory : null,
      notes: editNotes.trim() || null
    };
    
    onUpdateSession(updatedSession);
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this session?")) {
      onDeleteSession(id);
    }
  };

  const groupSessionsByDate = () => {
    const groupedSessions: { [date: string]: TimeTrackerSession[] } = {};
    
    sessions.forEach((session) => {
      const dateKey = format(parseISO(session.start_time), "yyyy-MM-dd");
      if (!groupedSessions[dateKey]) {
        groupedSessions[dateKey] = [];
      }
      groupedSessions[dateKey].push(session);
    });
    
    return groupedSessions;
  };

  const calculateTotalDuration = (sessions: TimeTrackerSession[]) => {
    return sessions.reduce((total, session) => {
      if (!session.end_time) return total;
      return total + differenceInMinutes(parseISO(session.end_time), parseISO(session.start_time));
    }, 0);
  };

  const groupedSessions = groupSessionsByDate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Your Time Tracking Sessions</h3>
        <Button onClick={onRefresh} variant="outline" size="sm">
          Refresh
        </Button>
      </div>
      
      {isLoading ? (
        <div className="py-10 text-center text-muted-foreground">Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground">
          No time tracking sessions recorded yet
        </div>
      ) : (
        Object.entries(groupedSessions).map(([date, dateSessions]) => (
          <div key={date} className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">{format(new Date(date), "EEEE, MMMM d, yyyy")}</h3>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md">
                Total: {formatDuration(calculateTotalDuration(dateSessions))}
              </span>
            </div>
            
            {dateSessions.map((session) => (
              <Card key={session.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">
                      {session.category === "Other" && session.custom_category 
                        ? `${session.category}: ${session.custom_category}` 
                        : session.category}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {format(parseISO(session.start_time), "HH:mm")} - 
                      {session.end_time 
                        ? format(parseISO(session.end_time), " HH:mm")
                        : " In progress"}
                    </div>
                    
                    {session.end_time && (
                      <div className="text-sm font-medium mt-1">
                        Duration: {formatDuration(differenceInMinutes(
                          parseISO(session.end_time), 
                          parseISO(session.start_time)
                        ))}
                      </div>
                    )}
                    
                    {session.notes && (
                      <div className="mt-2 text-sm bg-muted p-2 rounded-sm">
                        {session.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(session)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(session.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ))
      )}
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Time Tracking Session</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={editEndTime}
                  onChange={(e) => setEditEndTime(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
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
            
            {editCategory === "Other" && (
              <div className="space-y-2">
                <Label htmlFor="customCategory">Custom Category</Label>
                <Input
                  id="customCategory"
                  placeholder="Enter custom category"
                  value={editCustomCategory}
                  onChange={(e) => setEditCustomCategory(e.target.value)}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any relevant notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimeTrackerSessions;
