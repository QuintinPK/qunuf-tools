export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address: string
          address_label: string | null
          created_at: string
        }
        Insert: {
          address: string
          address_label?: string | null
          created_at?: string
        }
        Update: {
          address?: string
          address_label?: string | null
          created_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          address: string
          amount: number
          created_at: string | null
          customer_number: string
          due_date: string
          file_name: string
          file_path: string | null
          id: string
          invoice_date: string
          invoice_number: string
          is_paid: boolean | null
          payment_date: string | null
          updated_at: string | null
          utility_type: string | null
        }
        Insert: {
          address: string
          amount: number
          created_at?: string | null
          customer_number: string
          due_date: string
          file_name: string
          file_path?: string | null
          id?: string
          invoice_date: string
          invoice_number: string
          is_paid?: boolean | null
          payment_date?: string | null
          updated_at?: string | null
          utility_type?: string | null
        }
        Update: {
          address?: string
          amount?: number
          created_at?: string | null
          customer_number?: string
          due_date?: string
          file_name?: string
          file_path?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          is_paid?: boolean | null
          payment_date?: string | null
          updated_at?: string | null
          utility_type?: string | null
        }
        Relationships: []
      }
      meter_readings: {
        Row: {
          address: string
          created_at: string
          electricity_reading: number | null
          id: string
          water_reading: number | null
        }
        Insert: {
          address: string
          created_at?: string
          electricity_reading?: number | null
          id?: string
          water_reading?: number | null
        }
        Update: {
          address?: string
          created_at?: string
          electricity_reading?: number | null
          id?: string
          water_reading?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_meter_readings_address"
            columns: ["address"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["address"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          language: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          language?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          language?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      time_tracking_sessions: {
        Row: {
          category: string
          created_at: string
          custom_category: string | null
          end_time: string | null
          id: string
          notes: string | null
          start_time: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          custom_category?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          start_time: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          custom_category?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      utility_prices: {
        Row: {
          created_at: string
          currency: string
          effective_from: string
          effective_until: string | null
          id: string
          price_per_unit: number
          unit_name: string
          utility_type: string
        }
        Insert: {
          created_at?: string
          currency?: string
          effective_from: string
          effective_until?: string | null
          id?: string
          price_per_unit: number
          unit_name: string
          utility_type: string
        }
        Update: {
          created_at?: string
          currency?: string
          effective_from?: string
          effective_until?: string | null
          id?: string
          price_per_unit?: number
          unit_name?: string
          utility_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      event_type: "activity" | "travel" | "overnight"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      event_type: ["activity", "travel", "overnight"],
    },
  },
} as const
