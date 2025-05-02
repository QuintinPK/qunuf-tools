
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import TimeTrackerForm from "./TimeTrackerForm";
import TimeTrackerSessions from "./TimeTrackerSessions";
import TimeTrackerStats from "./TimeTrackerStats";
import { TimeTrackerSession } from "@/types/time-tracker";
import TimeTrackerExport from "./TimeTrackerExport";

const TimeTrackerDashboard = () => {
  const [sessions, setSessions] = useState<TimeTrackerSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Fetch all time tracking sessions
  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('time_tracking_sessions')
        .select('*')
        .order('start_time', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error fetching sessions",
        description: "Failed to load your time tracking data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Add a new session
  const addSession = async (newSession: Omit<TimeTrackerSession, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('time_tracking_sessions')
        .insert([newSession])
        .select();

      if (error) throw error;
      if (data) {
        setSessions([data[0], ...sessions]);
        toast({
          title: "Success",
          description: "Time tracking session added",
        });
      }
    } catch (error) {
      console.error('Error adding session:', error);
      toast({
        title: "Error",
        description: "Failed to add time tracking session",
        variant: "destructive",
      });
    }
  };

  // Update an existing session
  const updateSession = async (updatedSession: TimeTrackerSession) => {
    try {
      const { error } = await supabase
        .from('time_tracking_sessions')
        .update({
          start_time: updatedSession.start_time,
          end_time: updatedSession.end_time,
          category: updatedSession.category,
          custom_category: updatedSession.custom_category,
          notes: updatedSession.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedSession.id);

      if (error) throw error;
      
      setSessions(sessions.map(session => 
        session.id === updatedSession.id ? updatedSession : session
      ));
      
      toast({
        title: "Success",
        description: "Time tracking session updated",
      });
    } catch (error) {
      console.error('Error updating session:', error);
      toast({
        title: "Error",
        description: "Failed to update time tracking session",
        variant: "destructive",
      });
    }
  };

  // Delete a session
  const deleteSession = async (id: string) => {
    try {
      const { error } = await supabase
        .from('time_tracking_sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSessions(sessions.filter(session => session.id !== id));
      
      toast({
        title: "Success",
        description: "Time tracking session deleted",
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete time tracking session",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs defaultValue="record">
          <TabsList className="mb-6 w-full grid grid-cols-4">
            <TabsTrigger value="record">Record Time</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>
          
          <TabsContent value="record">
            <TimeTrackerForm onAddSession={addSession} />
          </TabsContent>
          
          <TabsContent value="sessions">
            <TimeTrackerSessions 
              sessions={sessions}
              isLoading={isLoading}
              onUpdateSession={updateSession}
              onDeleteSession={deleteSession}
              onRefresh={fetchSessions}
            />
          </TabsContent>
          
          <TabsContent value="stats">
            <TimeTrackerStats sessions={sessions} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="export">
            <TimeTrackerExport sessions={sessions} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TimeTrackerDashboard;
