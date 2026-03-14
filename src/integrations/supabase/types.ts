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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      alchemy_elements: {
        Row: {
          id: string
          image_url: string | null
          name: string
          type: string | null
        }
        Insert: {
          id?: string
          image_url?: string | null
          name: string
          type?: string | null
        }
        Update: {
          id?: string
          image_url?: string | null
          name?: string
          type?: string | null
        }
        Relationships: []
      }
      connect_requests: {
        Row: {
          contact_info: string | null
          created_at: string | null
          id: string
          name: string
          reason: string | null
        }
        Insert: {
          contact_info?: string | null
          created_at?: string | null
          id?: string
          name: string
          reason?: string | null
        }
        Update: {
          contact_info?: string | null
          created_at?: string | null
          id?: string
          name?: string
          reason?: string | null
        }
        Relationships: []
      }
      creative_works: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          external_link: string | null
          id: string
          is_bw_video: boolean | null
          location_id: string | null
          media_url: string | null
          pillar: string | null
          title: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          external_link?: string | null
          id?: string
          is_bw_video?: boolean | null
          location_id?: string | null
          media_url?: string | null
          pillar?: string | null
          title?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          external_link?: string | null
          id?: string
          is_bw_video?: boolean | null
          location_id?: string | null
          media_url?: string | null
          pillar?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creative_works_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_rituals: {
        Row: {
          activity_distribution: Json | null
          created_at: string | null
          date: string
          energy_level: number | null
          id: string
          location_id: string | null
          mood_score: number | null
          reflection_text: string | null
          sleep_hours: number | null
          total_active_minutes: number | null
        }
        Insert: {
          activity_distribution?: Json | null
          created_at?: string | null
          date?: string
          energy_level?: number | null
          id?: string
          location_id?: string | null
          mood_score?: number | null
          reflection_text?: string | null
          sleep_hours?: number | null
          total_active_minutes?: number | null
        }
        Update: {
          activity_distribution?: Json | null
          created_at?: string | null
          date?: string
          energy_level?: number | null
          id?: string
          location_id?: string | null
          mood_score?: number | null
          reflection_text?: string | null
          sleep_hours?: number | null
          total_active_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_rituals_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_shadow_knowledge: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      inspirations: {
        Row: {
          category: string | null
          description: string | null
          id: string
          image_url: string | null
          location_id: string | null
          name: string
        }
        Insert: {
          category?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location_id?: string | null
          name: string
        }
        Update: {
          category?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location_id?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspirations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          city_country: string | null
          coordinates: unknown
          created_at: string | null
          description: string | null
          id: string
          is_current: boolean | null
          is_visited: boolean | null
          name: string
        }
        Insert: {
          city_country?: string | null
          coordinates?: unknown
          created_at?: string | null
          description?: string | null
          id?: string
          is_current?: boolean | null
          is_visited?: boolean | null
          name: string
        }
        Update: {
          city_country?: string | null
          coordinates?: unknown
          created_at?: string | null
          description?: string | null
          id?: string
          is_current?: boolean | null
          is_visited?: boolean | null
          name?: string
        }
        Relationships: []
      }
      music_library: {
        Row: {
          artist: string | null
          description: string | null
          external_link: string | null
          id: string
          is_ai_generated: boolean | null
          location_id: string | null
          media_url: string | null
          mood: string | null
          title: string
          type: string | null
          utility: string | null
        }
        Insert: {
          artist?: string | null
          description?: string | null
          external_link?: string | null
          id?: string
          is_ai_generated?: boolean | null
          location_id?: string | null
          media_url?: string | null
          mood?: string | null
          title: string
          type?: string | null
          utility?: string | null
        }
        Update: {
          artist?: string | null
          description?: string | null
          external_link?: string | null
          id?: string
          is_ai_generated?: boolean | null
          location_id?: string | null
          media_url?: string | null
          mood?: string | null
          title?: string
          type?: string | null
          utility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "music_library_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_settings: {
        Row: {
          current_location_id: string | null
          id: number
          last_updated_at: string | null
          name: string | null
          one_liner: string | null
        }
        Insert: {
          current_location_id?: string | null
          id?: number
          last_updated_at?: string | null
          name?: string | null
          one_liner?: string | null
        }
        Update: {
          current_location_id?: string | null
          id?: number
          last_updated_at?: string | null
          name?: string | null
          one_liner?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_settings_current_location_id_fkey"
            columns: ["current_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      project_details: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          meta_info: string | null
          project_id: string | null
          type: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          meta_info?: string | null
          project_id?: string | null
          type?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          meta_info?: string | null
          project_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_details_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          brief: string | null
          created_at: string | null
          end_date: string | null
          full_description: string | null
          id: string
          location_id: string | null
          start_date: string | null
          title: string
          work_philosophy: string | null
        }
        Insert: {
          brief?: string | null
          created_at?: string | null
          end_date?: string | null
          full_description?: string | null
          id?: string
          location_id?: string | null
          start_date?: string | null
          title: string
          work_philosophy?: string | null
        }
        Update: {
          brief?: string | null
          created_at?: string | null
          end_date?: string | null
          full_description?: string | null
          id?: string
          location_id?: string | null
          start_date?: string | null
          title?: string
          work_philosophy?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          id: string
          image_url: string | null
          instructions: string | null
          location_id: string | null
          name: string
          nutrition_profile: Json | null
        }
        Insert: {
          id?: string
          image_url?: string | null
          instructions?: string | null
          location_id?: string | null
          name: string
          nutrition_profile?: Json | null
        }
        Update: {
          id?: string
          image_url?: string | null
          instructions?: string | null
          location_id?: string | null
          name?: string
          nutrition_profile?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_pulse: {
        Row: {
          content: string
          created_at: string | null
          id: string
          location_id: string | null
          mood_score: number | null
          reflection_date: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          location_id?: string | null
          mood_score?: number | null
          reflection_date?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          location_id?: string | null
          mood_score?: number | null
          reflection_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weekly_pulse_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      wellness_logs: {
        Row: {
          daily_ritual_id: string | null
          id: string
          logged_at: string | null
          recipe_id: string | null
        }
        Insert: {
          daily_ritual_id?: string | null
          id?: string
          logged_at?: string | null
          recipe_id?: string | null
        }
        Update: {
          daily_ritual_id?: string | null
          id?: string
          logged_at?: string | null
          recipe_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wellness_logs_daily_ritual_id_fkey"
            columns: ["daily_ritual_id"]
            isOneToOne: false
            referencedRelation: "daily_rituals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wellness_logs_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "favorite_recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wellness_logs_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      yoga_practice: {
        Row: {
          benefits: string | null
          category: string | null
          description: string | null
          id: string
          implementation_text: string | null
          limb_name: string | null
          location_id: string | null
          precautions: string | null
          ritual_name: string | null
          ritual_type: string | null
          video_url: string | null
        }
        Insert: {
          benefits?: string | null
          category?: string | null
          description?: string | null
          id?: string
          implementation_text?: string | null
          limb_name?: string | null
          location_id?: string | null
          precautions?: string | null
          ritual_name?: string | null
          ritual_type?: string | null
          video_url?: string | null
        }
        Update: {
          benefits?: string | null
          category?: string | null
          description?: string | null
          id?: string
          implementation_text?: string | null
          limb_name?: string | null
          location_id?: string | null
          precautions?: string | null
          ritual_name?: string | null
          ritual_type?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "yoga_practice_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      cultural_synthesis: {
        Row: {
          content_type: string | null
          display_name: string | null
          id: string | null
          location_id: string | null
        }
        Relationships: []
      }
      favorite_recipes: {
        Row: {
          frequency: number | null
          id: string | null
          image_url: string | null
          instructions: string | null
          location_id: string | null
          name: string | null
          nutrition_profile: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
