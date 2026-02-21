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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          sender_id: string
          sender_name: string
          sender_role: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sender_id: string
          sender_name: string
          sender_role: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
          sender_name?: string
          sender_role?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
        }
        Relationships: []
      }
      conversation_members: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          approval_status: string
          approved_by: string | null
          avatar_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string | null
          type: string
          updated_at: string
        }
        Insert: {
          approval_status?: string
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          approval_status?: string
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          added_by: string | null
          created_at: string
          department: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          join_date: string
          password_changed: boolean
          password_reset_required: boolean
          personal_email: string | null
          phone: string | null
          position: string
          temp_password: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          department: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          join_date?: string
          password_changed?: boolean
          password_reset_required?: boolean
          personal_email?: string | null
          phone?: string | null
          position: string
          temp_password?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          department?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          join_date?: string
          password_changed?: boolean
          password_reset_required?: boolean
          personal_email?: string | null
          phone?: string | null
          position?: string
          temp_password?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      interns: {
        Row: {
          added_by: string
          approved_by: string | null
          college_name: string | null
          company_email: string | null
          course: string | null
          created_at: string
          domain: string
          duration: string
          end_date: string | null
          full_name: string
          id: string
          password_changed: boolean
          password_reset_required: boolean
          personal_email: string
          phone: string
          start_date: string | null
          status: string
          temp_password: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          added_by: string
          approved_by?: string | null
          college_name?: string | null
          company_email?: string | null
          course?: string | null
          created_at?: string
          domain: string
          duration: string
          end_date?: string | null
          full_name: string
          id?: string
          password_changed?: boolean
          password_reset_required?: boolean
          personal_email: string
          phone: string
          start_date?: string | null
          status?: string
          temp_password?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          added_by?: string
          approved_by?: string | null
          college_name?: string | null
          company_email?: string | null
          course?: string | null
          created_at?: string
          domain?: string
          duration?: string
          end_date?: string | null
          full_name?: string
          id?: string
          password_changed?: boolean
          password_reset_required?: boolean
          personal_email?: string
          phone?: string
          start_date?: string | null
          status?: string
          temp_password?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      internship_enquiries: {
        Row: {
          college_name: string
          course: string
          created_at: string
          email: string
          full_name: string
          graduation_year: number
          id: string
          internship_id: string
          message: string | null
          phone: string
          status: Database["public"]["Enums"]["enquiry_status"]
          updated_at: string
        }
        Insert: {
          college_name: string
          course: string
          created_at?: string
          email: string
          full_name: string
          graduation_year: number
          id?: string
          internship_id: string
          message?: string | null
          phone: string
          status?: Database["public"]["Enums"]["enquiry_status"]
          updated_at?: string
        }
        Update: {
          college_name?: string
          course?: string
          created_at?: string
          email?: string
          full_name?: string
          graduation_year?: number
          id?: string
          internship_id?: string
          message?: string | null
          phone?: string
          status?: Database["public"]["Enums"]["enquiry_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "internship_enquiries_internship_id_fkey"
            columns: ["internship_id"]
            isOneToOne: false
            referencedRelation: "internship_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_programs: {
        Row: {
          created_at: string
          department: string
          description: string
          duration: string
          id: string
          is_active: boolean
          requirements: string[]
          stipend: string | null
          title: string
          updated_at: string
          what_you_learn: string[]
        }
        Insert: {
          created_at?: string
          department: string
          description: string
          duration: string
          id?: string
          is_active?: boolean
          requirements?: string[]
          stipend?: string | null
          title: string
          updated_at?: string
          what_you_learn?: string[]
        }
        Update: {
          created_at?: string
          department?: string
          description?: string
          duration?: string
          id?: string
          is_active?: boolean
          requirements?: string[]
          stipend?: string | null
          title?: string
          updated_at?: string
          what_you_learn?: string[]
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          cover_letter: string | null
          created_at: string
          current_company: string | null
          email: string
          full_name: string
          id: string
          job_id: string
          notice_period: string | null
          phone: string
          portfolio_url: string | null
          resume_url: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
          years_experience: number
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string
          current_company?: string | null
          email: string
          full_name: string
          id?: string
          job_id: string
          notice_period?: string | null
          phone: string
          portfolio_url?: string | null
          resume_url?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          years_experience?: number
        }
        Update: {
          cover_letter?: string | null
          created_at?: string
          current_company?: string | null
          email?: string
          full_name?: string
          id?: string
          job_id?: string
          notice_period?: string | null
          phone?: string
          portfolio_url?: string | null
          resume_url?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          years_experience?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          created_at: string
          department: string
          description: string
          id: string
          is_active: boolean
          job_type: Database["public"]["Enums"]["job_type"]
          location: string
          requirements: string[]
          responsibilities: string[]
          salary_range: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department: string
          description: string
          id?: string
          is_active?: boolean
          job_type?: Database["public"]["Enums"]["job_type"]
          location: string
          requirements?: string[]
          responsibilities?: string[]
          salary_range?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string
          description?: string
          id?: string
          is_active?: boolean
          job_type?: Database["public"]["Enums"]["job_type"]
          location?: string
          requirements?: string[]
          responsibilities?: string[]
          salary_range?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          conversation_id: string
          created_at: string
          file_name: string | null
          file_type: string | null
          file_url: string | null
          id: string
          is_read: boolean
          message: string | null
          sender_id: string
          sender_name: string
          sender_role: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_read?: boolean
          message?: string | null
          sender_id: string
          sender_name: string
          sender_role: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_read?: boolean
          message?: string | null
          sender_id?: string
          sender_name?: string
          sender_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_by: string
          assigned_to: string | null
          assigned_to_employee: string | null
          assigned_to_type: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_by: string
          assigned_to?: string | null
          assigned_to_employee?: string | null
          assigned_to_type?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_by?: string
          assigned_to?: string | null
          assigned_to_employee?: string | null
          assigned_to_type?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_employee_fkey"
            columns: ["assigned_to_employee"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "interns"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      app_role: "admin" | "employee" | "intern"
      application_status:
        | "pending"
        | "reviewed"
        | "shortlisted"
        | "rejected"
        | "hired"
      enquiry_status: "pending" | "contacted" | "enrolled" | "closed"
      job_type: "full-time" | "part-time" | "contract" | "remote"
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
      app_role: ["admin", "employee", "intern"],
      application_status: [
        "pending",
        "reviewed",
        "shortlisted",
        "rejected",
        "hired",
      ],
      enquiry_status: ["pending", "contacted", "enrolled", "closed"],
      job_type: ["full-time", "part-time", "contract", "remote"],
    },
  },
} as const
