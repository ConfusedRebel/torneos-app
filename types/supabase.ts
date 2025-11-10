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
      administradores: {
        Row: {
          contraseña: string
          email: string
          id_administrador: string
          nombre: string
          user_id: string | null
        }
        Insert: {
          contraseña: string
          email: string
          id_administrador?: string
          nombre: string
          user_id?: string | null
        }
        Update: {
          contraseña?: string
          email?: string
          id_administrador?: string
          nombre?: string
          user_id?: string | null
        }
        Relationships: []
      }
      equipos: {
        Row: {
          id_equipo: string
          id_jugador1: string
          id_jugador2: string | null
          id_torneo: string
          nombre: string | null
          puntos: number | null
          ranking_en_torneo: number | null
        }
        Insert: {
          id_equipo?: string
          id_jugador1: string
          id_jugador2?: string | null
          id_torneo: string
          nombre?: string | null
          puntos?: number | null
          ranking_en_torneo?: number | null
        }
        Update: {
          id_equipo?: string
          id_jugador1?: string
          id_jugador2?: string | null
          id_torneo?: string
          nombre?: string | null
          puntos?: number | null
          ranking_en_torneo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "equipos_id_torneo_fkey"
            columns: ["id_torneo"]
            isOneToOne: false
            referencedRelation: "torneos"
            referencedColumns: ["id_torneo"]
          },
          {
            foreignKeyName: "equipos_jugador1_fkey"
            columns: ["id_jugador1"]
            isOneToOne: false
            referencedRelation: "jugadores"
            referencedColumns: ["id_jugador"]
          },
          {
            foreignKeyName: "equipos_jugador2_fkey"
            columns: ["id_jugador2"]
            isOneToOne: false
            referencedRelation: "jugadores"
            referencedColumns: ["id_jugador"]
          },
        ]
      }
      jugadores: {
        Row: {
          antiguedad: string | null
          apellido: string
          email: string
          id_jugador: string
          nombre: string
          ranking_paddle: number | null
          ranking_tennis: number | null
          user_id: string | null
        }
        Insert: {
          antiguedad?: string | null
          apellido: string
          email: string
          id_jugador?: string
          nombre: string
          ranking_paddle?: number | null
          ranking_tennis?: number | null
          user_id?: string | null
        }
        Update: {
          antiguedad?: string | null
          apellido?: string
          email?: string
          id_jugador?: string
          nombre?: string
          ranking_paddle?: number | null
          ranking_tennis?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      partidos: {
        Row: {
          fase: string | null
          fecha: string
          hora: string
          id_equipo1: string
          id_equipo2: string
          id_ganador: string | null
          id_partido: string
          id_torneo: string
          resultado: string | null
        }
        Insert: {
          fase?: string | null
          fecha: string
          hora: string
          id_equipo1: string
          id_equipo2: string
          id_ganador?: string | null
          id_partido?: string
          id_torneo: string
          resultado?: string | null
        }
        Update: {
          fase?: string | null
          fecha?: string
          hora?: string
          id_equipo1?: string
          id_equipo2?: string
          id_ganador?: string | null
          id_partido?: string
          id_torneo?: string
          resultado?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partidos_equipo1_fkey"
            columns: ["id_equipo1"]
            isOneToOne: false
            referencedRelation: "equipos"
            referencedColumns: ["id_equipo"]
          },
          {
            foreignKeyName: "partidos_equipo2_fkey"
            columns: ["id_equipo2"]
            isOneToOne: false
            referencedRelation: "equipos"
            referencedColumns: ["id_equipo"]
          },
          {
            foreignKeyName: "partidos_ganador_fkey"
            columns: ["id_ganador"]
            isOneToOne: false
            referencedRelation: "equipos"
            referencedColumns: ["id_equipo"]
          },
          {
            foreignKeyName: "partidos_id_torneo_fkey"
            columns: ["id_torneo"]
            isOneToOne: false
            referencedRelation: "torneos"
            referencedColumns: ["id_torneo"]
          },
        ]
      }
      torneos: {
        Row: {
          deporte: string
          duo: boolean
          estado: Database["public"]["Enums"]["estado_torneo"]
          fecha_fin: string
          fecha_inicio: string
          id_torneo: string
          maxParticipantes: number | null
          nombre: string
          ubicacion: string
        }
        Insert: {
          deporte: string
          duo?: boolean
          estado?: Database["public"]["Enums"]["estado_torneo"]
          fecha_fin: string
          fecha_inicio: string
          id_torneo?: string
          maxParticipantes?: number | null
          nombre: string
          ubicacion: string
        }
        Update: {
          deporte?: string
          duo?: boolean
          estado?: Database["public"]["Enums"]["estado_torneo"]
          fecha_fin?: string
          fecha_inicio?: string
          id_torneo?: string
          maxParticipantes?: number | null
          nombre?: string
          ubicacion?: string
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
      estado_torneo: "pendiente" | "en_curso" | "finalizado"
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
      estado_torneo: ["pendiente", "en_curso", "finalizado"],
    },
  },
} as const
