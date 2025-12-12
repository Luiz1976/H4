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
      linkedin_accounts: {
        Row: {
          access_token: string
          avatar_url: string | null
          connected_at: string
          created_at: string
          expires_at: string | null
          id: string
          linkedin_user_id: string | null
          name: string | null
          profile_url: string | null
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          avatar_url?: string | null
          connected_at?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          linkedin_user_id?: string | null
          name?: string | null
          profile_url?: string | null
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          avatar_url?: string | null
          connected_at?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          linkedin_user_id?: string | null
          name?: string | null
          profile_url?: string | null
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      linkedin_activity_logs: {
        Row: {
          account_id: string | null
          action: string
          created_at: string
          details: Json | null
          id: string
          log_type: string
          message: string
        }
        Insert: {
          account_id?: string | null
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          log_type: string
          message: string
        }
        Update: {
          account_id?: string | null
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          log_type?: string
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: "linkedin_activity_logs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "linkedin_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      linkedin_listening: {
        Row: {
          account_id: string | null
          action_taken: string | null
          actioned_at: string | null
          created_at: string
          detected_at: string
          detected_topic: string | null
          id: string
          relevance_score: number | null
          response_content: string | null
          source_author: string | null
          source_content: string | null
          source_url: string | null
        }
        Insert: {
          account_id?: string | null
          action_taken?: string | null
          actioned_at?: string | null
          created_at?: string
          detected_at?: string
          detected_topic?: string | null
          id?: string
          relevance_score?: number | null
          response_content?: string | null
          source_author?: string | null
          source_content?: string | null
          source_url?: string | null
        }
        Update: {
          account_id?: string | null
          action_taken?: string | null
          actioned_at?: string | null
          created_at?: string
          detected_at?: string
          detected_topic?: string | null
          id?: string
          relevance_score?: number | null
          response_content?: string | null
          source_author?: string | null
          source_content?: string | null
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "linkedin_listening_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "linkedin_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      linkedin_posts: {
        Row: {
          account_id: string | null
          content: string
          created_at: string
          engagement_comments: number | null
          engagement_likes: number | null
          engagement_shares: number | null
          id: string
          image_index: number | null
          linkedin_post_id: string | null
          published_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          content: string
          created_at?: string
          engagement_comments?: number | null
          engagement_likes?: number | null
          engagement_shares?: number | null
          id?: string
          image_index?: number | null
          linkedin_post_id?: string | null
          published_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          content?: string
          created_at?: string
          engagement_comments?: number | null
          engagement_likes?: number | null
          engagement_shares?: number | null
          id?: string
          image_index?: number | null
          linkedin_post_id?: string | null
          published_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "linkedin_posts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "linkedin_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      linkedin_settings: {
        Row: {
          account_id: string | null
          auto_comment_enabled: boolean | null
          auto_post_enabled: boolean | null
          auto_promote_enabled: boolean | null
          created_at: string
          id: string
          last_post_at: string | null
          listening_keywords: string[] | null
          min_posts_ready: number | null
          next_scheduled_post: string | null
          post_end_hour: number | null
          post_interval_minutes: number | null
          post_start_hour: number | null
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          auto_comment_enabled?: boolean | null
          auto_post_enabled?: boolean | null
          auto_promote_enabled?: boolean | null
          created_at?: string
          id?: string
          last_post_at?: string | null
          listening_keywords?: string[] | null
          min_posts_ready?: number | null
          next_scheduled_post?: string | null
          post_end_hour?: number | null
          post_interval_minutes?: number | null
          post_start_hour?: number | null
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          auto_comment_enabled?: boolean | null
          auto_post_enabled?: boolean | null
          auto_promote_enabled?: boolean | null
          created_at?: string
          id?: string
          last_post_at?: string | null
          listening_keywords?: string[] | null
          min_posts_ready?: number | null
          next_scheduled_post?: string | null
          post_end_hour?: number | null
          post_interval_minutes?: number | null
          post_start_hour?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "linkedin_settings_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "linkedin_accounts"
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
