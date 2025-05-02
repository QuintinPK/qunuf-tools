
export interface TimeTrackerSession {
  id: string;
  start_time: string;
  end_time: string | null;
  category: string;
  custom_category: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
