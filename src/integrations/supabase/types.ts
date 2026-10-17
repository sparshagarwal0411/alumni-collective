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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      connections: {
        Row: {
          addressee: string
          created_at: string
          id: string
          requester: string
          status: string
        }
        Insert: {
          addressee: string
          created_at?: string
          id?: string
          requester: string
          status?: string
        }
        Update: {
          addressee?: string
          created_at?: string
          id?: string
          requester?: string
          status?: string
        }
        Relationships: []
      }
      funds: {
        Row: {
          currency: string
          goal_amount: number
          id: string
          is_sample: boolean
          name: string
          raised_amount: number
          slug: string
          sort: number
          summary: string | null
        }
        Insert: {
          currency?: string
          goal_amount: number
          id?: string
          is_sample?: boolean
          name: string
          raised_amount?: number
          slug: string
          sort?: number
          summary?: string | null
        }
        Update: {
          currency?: string
          goal_amount?: number
          id?: string
          is_sample?: boolean
          name?: string
          raised_amount?: number
          slug?: string
          sort?: number
          summary?: string | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          company: string
          created_at: string
          description: string | null
          id: string
          is_sample: boolean
          kind: string
          location: string | null
          posted_by: string | null
          referral_available: boolean
          title: string
          url: string | null
        }
        Insert: {
          company: string
          created_at?: string
          description?: string | null
          id?: string
          is_sample?: boolean
          kind?: string
          location?: string | null
          posted_by?: string | null
          referral_available?: boolean
          title: string
          url?: string | null
        }
        Update: {
          company?: string
          created_at?: string
          description?: string | null
          id?: string
          is_sample?: boolean
          kind?: string
          location?: string | null
          posted_by?: string | null
          referral_available?: boolean
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      mentorship_requests: {
        Row: {
          created_at: string
          id: string
          mentee: string
          mentor: string
          message: string | null
          status: string
          topic: string
        }
        Insert: {
          created_at?: string
          id?: string
          mentee: string
          mentor: string
          message?: string | null
          status?: string
          topic: string
        }
        Update: {
          created_at?: string
          id?: string
          mentee?: string
          mentor?: string
          message?: string | null
          status?: string
          topic?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          recipient: string
          sender: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          recipient: string
          sender: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          recipient?: string
          sender?: string
        }
        Relationships: []
      }
      microtasks: {
        Row: {
          claimed_by: string | null
          created_at: string
          description: string | null
          hours: number | null
          id: string
          is_sample: boolean
          posted_by: string | null
          status: string
          title: string
        }
        Insert: {
          claimed_by?: string | null
          created_at?: string
          description?: string | null
          hours?: number | null
          id?: string
          is_sample?: boolean
          posted_by?: string | null
          status?: string
          title: string
        }
        Update: {
          claimed_by?: string | null
          created_at?: string
          description?: string | null
          hours?: number | null
          id?: string
          is_sample?: boolean
          posted_by?: string | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          city: string | null
          company: string | null
          created_at: string
          degree: string | null
          department: string | null
          full_name: string
          grad_year: number | null
          headline: string | null
          id: string
          is_sample: boolean
          linkedin: string | null
          open_to_mentor: boolean
          role_title: string | null
          skills: string[]
        }
        Insert: {
          bio?: string | null
          city?: string | null
          company?: string | null
          created_at?: string
          degree?: string | null
          department?: string | null
          full_name?: string
          grad_year?: number | null
          headline?: string | null
          id: string
          is_sample?: boolean
          linkedin?: string | null
          open_to_mentor?: boolean
          role_title?: string | null
          skills?: string[]
        }
        Update: {
          bio?: string | null
          city?: string | null
          company?: string | null
          created_at?: string
          degree?: string | null
          department?: string | null
          full_name?: string
          grad_year?: number | null
          headline?: string | null
          id?: string
          is_sample?: boolean
          linkedin?: string | null
          open_to_mentor?: boolean
          role_title?: string | null
          skills?: string[]
        }
        Relationships: []
      }
      referral_requests: {
        Row: {
          created_at: string
          id: string
          job_id: string
          note: string | null
          referrer: string
          requester: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          note?: string | null
          referrer: string
          requester: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          note?: string | null
          referrer?: string
          requester?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_requests_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      updates: {
        Row: {
          author: string | null
          body: string
          category: string
          created_at: string
          id: string
          is_sample: boolean
          title: string
        }
        Insert: {
          author?: string | null
          body: string
          category?: string
          created_at?: string
          id?: string
          is_sample?: boolean
          title: string
        }
        Update: {
          author?: string | null
          body?: string
          category?: string
          created_at?: string
          id?: string
          is_sample?: boolean
          title?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "alumni" | "student"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "alumni", "student"],
    },
  },
} as const
