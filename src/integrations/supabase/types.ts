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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analytics_cache: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          query_hash: string
          result: Json
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          query_hash: string
          result: Json
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          query_hash?: string
          result?: Json
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          resource: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource?: string
          user_id?: string | null
        }
        Relationships: []
      }
      incidents: {
        Row: {
          alert_ids: string[] | null
          assigned_to: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          notes: string | null
          resolved_at: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          status: Database["public"]["Enums"]["incident_status"]
          title: string
          updated_at: string
        }
        Insert: {
          alert_ids?: string[] | null
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          resolved_at?: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          status?: Database["public"]["Enums"]["incident_status"]
          title: string
          updated_at?: string
        }
        Update: {
          alert_ids?: string[] | null
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          status?: Database["public"]["Enums"]["incident_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      log_sources: {
        Row: {
          connection_config: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          last_sync: string | null
          name: string
          status: string | null
          type: Database["public"]["Enums"]["source_type"]
          updated_at: string
        }
        Insert: {
          connection_config?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          last_sync?: string | null
          name: string
          status?: string | null
          type: Database["public"]["Enums"]["source_type"]
          updated_at?: string
        }
        Update: {
          connection_config?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          last_sync?: string | null
          name?: string
          status?: string | null
          type?: Database["public"]["Enums"]["source_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "log_sources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      logs: {
        Row: {
          created_at: string
          hash: string | null
          id: string
          ip_address: unknown | null
          level: Database["public"]["Enums"]["log_level"]
          message: string
          parsed_data: Json | null
          raw_data: string | null
          search_vector: unknown | null
          source_id: string | null
          source_name: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          hash?: string | null
          id?: string
          ip_address?: unknown | null
          level: Database["public"]["Enums"]["log_level"]
          message: string
          parsed_data?: Json | null
          raw_data?: string | null
          search_vector?: unknown | null
          source_id?: string | null
          source_name: string
          timestamp: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          hash?: string | null
          id?: string
          ip_address?: unknown | null
          level?: Database["public"]["Enums"]["log_level"]
          message?: string
          parsed_data?: Json | null
          raw_data?: string | null
          search_vector?: unknown | null
          source_id?: string | null
          source_name?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "log_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          preferences: Json | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      threat_alerts: {
        Row: {
          affected_systems: string[] | null
          assigned_to: string | null
          created_at: string
          description: string | null
          id: string
          log_id: string | null
          metadata: Json | null
          resolved_at: string | null
          rule_id: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          source: string
          status: Database["public"]["Enums"]["alert_status"]
          title: string
          updated_at: string
        }
        Insert: {
          affected_systems?: string[] | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          id?: string
          log_id?: string | null
          metadata?: Json | null
          resolved_at?: string | null
          rule_id?: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          source: string
          status?: Database["public"]["Enums"]["alert_status"]
          title: string
          updated_at?: string
        }
        Update: {
          affected_systems?: string[] | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          id?: string
          log_id?: string | null
          metadata?: Json | null
          resolved_at?: string | null
          rule_id?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          source?: string
          status?: Database["public"]["Enums"]["alert_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "threat_alerts_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "threat_alerts_log_id_fkey"
            columns: ["log_id"]
            isOneToOne: false
            referencedRelation: "logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "threat_alerts_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "threat_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      threat_rules: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          enabled: boolean | null
          id: string
          name: string
          pattern: string
          severity: Database["public"]["Enums"]["alert_severity"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          name: string
          pattern: string
          severity: Database["public"]["Enums"]["alert_severity"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          name?: string
          pattern?: string
          severity?: Database["public"]["Enums"]["alert_severity"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "threat_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      alert_severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
      alert_status: "NEW" | "INVESTIGATING" | "RESOLVED" | "FALSE_POSITIVE"
      incident_status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
      log_level: "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL"
      source_type: "FILE" | "SYSLOG" | "API" | "FTP" | "USB" | "REALTIME"
      user_role: "ADMIN" | "ANALYST" | "VIEWER"
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
      alert_severity: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      alert_status: ["NEW", "INVESTIGATING", "RESOLVED", "FALSE_POSITIVE"],
      incident_status: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
      log_level: ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
      source_type: ["FILE", "SYSLOG", "API", "FTP", "USB", "REALTIME"],
      user_role: ["ADMIN", "ANALYST", "VIEWER"],
    },
  },
} as const
