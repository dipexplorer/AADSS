export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4";
  };
  public: {
    Tables: {
      academic_sessions: {
        Row: {
          end_date: string | null;
          id: string;
          name: string;
          start_date: string | null;
        };
        Insert: {
          end_date?: string | null;
          id?: string;
          name: string;
          start_date?: string | null;
        };
        Update: {
          end_date?: string | null;
          id?: string;
          name?: string;
          start_date?: string | null;
        };
        Relationships: [];
      };
      attendance: {
        Row: {
          class_session_id: string;
          id: string;
          latitude: number | null;
          longitude: number | null;
          marked_at: string | null;
          status: string;
          student_id: string;
        };
        Insert: {
          class_session_id: string;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          marked_at?: string | null;
          status: string;
          student_id: string;
        };
        Update: {
          class_session_id?: string;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          marked_at?: string | null;
          status?: string;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attendance_class_session_id_fkey";
            columns: ["class_session_id"];
            isOneToOne: false;
            referencedRelation: "class_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      class_sessions: {
        Row: {
          created_at: string | null;
          date: string;
          end_time: string;
          id: string;
          start_time: string;
          status: string | null;
          subject_id: string | null;
          timetable_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          date: string;
          end_time: string;
          id?: string;
          start_time: string;
          status?: string | null;
          subject_id?: string | null;
          timetable_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          date?: string;
          end_time?: string;
          id?: string;
          start_time?: string;
          status?: string | null;
          subject_id?: string | null;
          timetable_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "class_sessions_subject_id_fkey";
            columns: ["subject_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_sessions_timetable_id_fkey";
            columns: ["timetable_id"];
            isOneToOne: false;
            referencedRelation: "timetable";
            referencedColumns: ["id"];
          },
        ];
      };
      notes: {
        Row: {
          content: Json | null;
          created_at: string | null;
          date: string;
          id: string;
          student_id: string | null;
        };
        Insert: {
          content?: Json | null;
          created_at?: string | null;
          date: string;
          id?: string;
          student_id?: string | null;
        };
        Update: {
          content?: Json | null;
          created_at?: string | null;
          date?: string;
          id?: string;
          student_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "notes_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      programs: {
        Row: {
          id: string;
          name: string;
        };
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      semesters: {
        Row: {
          id: string;
          program_id: string | null;
          semester_number: number;
        };
        Insert: {
          id?: string;
          program_id?: string | null;
          semester_number: number;
        };
        Update: {
          id?: string;
          program_id?: string | null;
          semester_number?: number;
        };
        Relationships: [
          {
            foreignKeyName: "semesters_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          },
        ];
      };
      student_profiles: {
        Row: {
          created_at: string | null;
          id: string;
          program_id: string;
          semester_id: string;
          session_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          program_id: string;
          semester_id: string;
          session_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          program_id?: string;
          semester_id?: string;
          session_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_profiles_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "programs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_profiles_semester_id_fkey";
            columns: ["semester_id"];
            isOneToOne: false;
            referencedRelation: "semesters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_profiles_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "academic_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      subjects: {
        Row: {
          created_at: string | null;
          id: string;
          min_attendance_required: number | null;
          name: string;
          semester_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          min_attendance_required?: number | null;
          name: string;
          semester_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          min_attendance_required?: number | null;
          name?: string;
          semester_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subjects_semester_id_fkey";
            columns: ["semester_id"];
            isOneToOne: false;
            referencedRelation: "semesters";
            referencedColumns: ["id"];
          },
        ];
      };
      timetable: {
        Row: {
          allowed_radius: number | null;
          created_at: string | null;
          day_of_week: number;
          end_time: string;
          id: string;
          latitude: number | null;
          longitude: number | null;
          room: string | null;
          start_time: string;
          subject_id: string;
        };
        Insert: {
          allowed_radius?: number | null;
          created_at?: string | null;
          day_of_week: number;
          end_time: string;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          room?: string | null;
          start_time: string;
          subject_id: string;
        };
        Update: {
          allowed_radius?: number | null;
          created_at?: string | null;
          day_of_week?: number;
          end_time?: string;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          room?: string | null;
          start_time?: string;
          subject_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "timetable_subject_id_fkey";
            columns: ["subject_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
