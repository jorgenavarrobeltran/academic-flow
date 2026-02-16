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
      asistencia: {
        Row: {
          aprobada: boolean | null
          created_at: string | null
          curso_id: string | null
          estado: string | null
          estudiante_id: string | null
          fecha: string
          id: string
          justificacion: string | null
          observacion: string | null
          soporte_url: string | null
        }
        Insert: {
          aprobada?: boolean | null
          created_at?: string | null
          curso_id?: string | null
          estado?: string | null
          estudiante_id?: string | null
          fecha: string
          id: string
          justificacion?: string | null
          observacion?: string | null
          soporte_url?: string | null
        }
        Update: {
          aprobada?: boolean | null
          created_at?: string | null
          curso_id?: string | null
          estado?: string | null
          estudiante_id?: string | null
          fecha?: string
          id?: string
          justificacion?: string | null
          observacion?: string | null
          soporte_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asistencia_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asistencia_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      calificaciones: {
        Row: {
          corte1_nota: number | null
          corte1_observacion: string | null
          corte2_nota: number | null
          corte2_observacion: string | null
          corte3_nota: number | null
          corte3_observacion: string | null
          curso_id: string | null
          estudiante_id: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          corte1_nota?: number | null
          corte1_observacion?: string | null
          corte2_nota?: number | null
          corte2_observacion?: string | null
          corte3_nota?: number | null
          corte3_observacion?: string | null
          curso_id?: string | null
          estudiante_id?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          corte1_nota?: number | null
          corte1_observacion?: string | null
          corte2_nota?: number | null
          corte2_observacion?: string | null
          corte3_nota?: number | null
          corte3_observacion?: string | null
          curso_id?: string | null
          estudiante_id?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calificaciones_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calificaciones_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      convocatorias: {
        Row: {
          beneficios: string | null
          categoria: string | null
          codigo: string | null
          competitividad: string | null
          descripcion: string | null
          documentos_adjuntos: string[] | null
          duracion: string | null
          enlace_oficial: string | null
          entidad_convocante: string | null
          estado: string | null
          fecha_apertura: string | null
          fecha_cierre: string | null
          fecha_resultados: string | null
          id: string
          programas_objetivo: string[] | null
          requisitos: string[] | null
          subcategoria: string | null
          titulo: string
        }
        Insert: {
          beneficios?: string | null
          categoria?: string | null
          codigo?: string | null
          competitividad?: string | null
          descripcion?: string | null
          documentos_adjuntos?: string[] | null
          duracion?: string | null
          enlace_oficial?: string | null
          entidad_convocante?: string | null
          estado?: string | null
          fecha_apertura?: string | null
          fecha_cierre?: string | null
          fecha_resultados?: string | null
          id: string
          programas_objetivo?: string[] | null
          requisitos?: string[] | null
          subcategoria?: string | null
          titulo: string
        }
        Update: {
          beneficios?: string | null
          categoria?: string | null
          codigo?: string | null
          competitividad?: string | null
          descripcion?: string | null
          documentos_adjuntos?: string[] | null
          duracion?: string | null
          enlace_oficial?: string | null
          entidad_convocante?: string | null
          estado?: string | null
          fecha_apertura?: string | null
          fecha_cierre?: string | null
          fecha_resultados?: string | null
          id?: string
          programas_objetivo?: string[] | null
          requisitos?: string[] | null
          subcategoria?: string | null
          titulo?: string
        }
        Relationships: []
      }
      course_whitelist: {
        Row: {
          claimed: boolean | null
          course_id: string
          created_at: string
          full_name: string
          id: string
        }
        Insert: {
          claimed?: boolean | null
          course_id: string
          created_at?: string
          full_name: string
          id?: string
        }
        Update: {
          claimed?: boolean | null
          course_id?: string
          created_at?: string
          full_name?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_whitelist_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      cursos: {
        Row: {
          activo: boolean | null
          archivado: boolean | null
          asignatura: string
          aula: string | null
          codigo: string
          configuracion_notas: Json | null
          created_at: string | null
          dias_clase: number[] | null
          docente_id: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          grupo: string
          hora_fin: string | null
          hora_inicio: string | null
          id: string
          nombre: string
          programa: string | null
          semestre: string
        }
        Insert: {
          activo?: boolean | null
          archivado?: boolean | null
          asignatura: string
          aula?: string | null
          codigo: string
          configuracion_notas?: Json | null
          created_at?: string | null
          dias_clase?: number[] | null
          docente_id?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          grupo: string
          hora_fin?: string | null
          hora_inicio?: string | null
          id: string
          nombre: string
          programa?: string | null
          semestre: string
        }
        Update: {
          activo?: boolean | null
          archivado?: boolean | null
          asignatura?: string
          aula?: string | null
          codigo?: string
          configuracion_notas?: Json | null
          created_at?: string | null
          dias_clase?: number[] | null
          docente_id?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          grupo?: string
          hora_fin?: string | null
          hora_inicio?: string | null
          id?: string
          nombre?: string
          programa?: string | null
          semestre?: string
        }
        Relationships: [
          {
            foreignKeyName: "cursos_docente_id_fkey"
            columns: ["docente_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluaciones: {
        Row: {
          contenido: Json | null
          corte: number
          created_at: string | null
          curso_id: string | null
          es_grupal: boolean | null
          fecha: string | null
          id: string
          instrucciones_ai: string | null
          nombre: string
          porcentaje: number
          tipo_generacion: string | null
        }
        Insert: {
          contenido?: Json | null
          corte: number
          created_at?: string | null
          curso_id?: string | null
          es_grupal?: boolean | null
          fecha?: string | null
          id?: string
          instrucciones_ai?: string | null
          nombre: string
          porcentaje: number
          tipo_generacion?: string | null
        }
        Update: {
          contenido?: Json | null
          corte?: number
          created_at?: string | null
          curso_id?: string | null
          es_grupal?: boolean | null
          fecha?: string | null
          id?: string
          instrucciones_ai?: string | null
          nombre?: string
          porcentaje?: number
          tipo_generacion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluaciones_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          alerta_enviada: boolean | null
          curso_id: string | null
          descripcion: string | null
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          tipo: string | null
          titulo: string
          todo_el_dia: boolean | null
        }
        Insert: {
          alerta_enviada?: boolean | null
          curso_id?: string | null
          descripcion?: string | null
          fecha_fin?: string | null
          fecha_inicio: string
          id: string
          tipo?: string | null
          titulo: string
          todo_el_dia?: boolean | null
        }
        Update: {
          alerta_enviada?: boolean | null
          curso_id?: string | null
          descripcion?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          tipo?: string | null
          titulo?: string
          todo_el_dia?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      grupos: {
        Row: {
          curso_id: string | null
          descripcion: string | null
          fecha_creacion: string | null
          id: string
          integrantes: string[] | null
          nombre: string
          nota_grupal: number | null
          proyecto: string | null
        }
        Insert: {
          curso_id?: string | null
          descripcion?: string | null
          fecha_creacion?: string | null
          id: string
          integrantes?: string[] | null
          nombre: string
          nota_grupal?: number | null
          proyecto?: string | null
        }
        Update: {
          curso_id?: string | null
          descripcion?: string | null
          fecha_creacion?: string | null
          id?: string
          integrantes?: string[] | null
          nombre?: string
          nota_grupal?: number | null
          proyecto?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grupos_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      inscripciones: {
        Row: {
          created_at: string | null
          curso_id: string | null
          estudiante_id: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          curso_id?: string | null
          estudiante_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          curso_id?: string | null
          estudiante_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inscripciones_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscripciones_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      notas_actividades: {
        Row: {
          estudiante_id: string | null
          evaluacion_id: string | null
          id: string
          updated_at: string | null
          valor: number | null
        }
        Insert: {
          estudiante_id?: string | null
          evaluacion_id?: string | null
          id?: string
          updated_at?: string | null
          valor?: number | null
        }
        Update: {
          estudiante_id?: string | null
          evaluacion_id?: string | null
          id?: string
          updated_at?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "notas_actividades_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_actividades_evaluacion_id_fkey"
            columns: ["evaluacion_id"]
            isOneToOne: false
            referencedRelation: "evaluaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      proyectos: {
        Row: {
          avances: Json | null
          curso_id: string | null
          etapa_actual: string | null
          etapas: Json | null
          fecha_fin: string | null
          fecha_inicio: string | null
          grupo_id: string | null
          id: string
          titulo: string
        }
        Insert: {
          avances?: Json | null
          curso_id?: string | null
          etapa_actual?: string | null
          etapas?: Json | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          grupo_id?: string | null
          id: string
          titulo: string
        }
        Update: {
          avances?: Json | null
          curso_id?: string | null
          etapa_actual?: string | null
          etapas?: Json | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          grupo_id?: string | null
          id?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "proyectos_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proyectos_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      recursos: {
        Row: {
          asignatura: string | null
          descripcion: string | null
          duracion: number | null
          fecha_creacion: string | null
          id: string
          nivel: string | null
          obligatorio: boolean | null
          tags: string[] | null
          tipo: string | null
          titulo: string
          unidad_tematica: string | null
          url: string | null
        }
        Insert: {
          asignatura?: string | null
          descripcion?: string | null
          duracion?: number | null
          fecha_creacion?: string | null
          id: string
          nivel?: string | null
          obligatorio?: boolean | null
          tags?: string[] | null
          tipo?: string | null
          titulo: string
          unidad_tematica?: string | null
          url?: string | null
        }
        Update: {
          asignatura?: string | null
          descripcion?: string | null
          duracion?: number | null
          fecha_creacion?: string | null
          id?: string
          nivel?: string | null
          obligatorio?: boolean | null
          tags?: string[] | null
          tipo?: string | null
          titulo?: string
          unidad_tematica?: string | null
          url?: string | null
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          activo: boolean | null
          apellido: string
          biografia: string | null
          celular: string | null
          codigo: string | null
          cvlac_url: string | null
          documento_identidad: string | null
          email: string
          es_homologante: boolean | null
          especialidad: string | null
          facultad: string | null
          fecha_nacimiento: string | null
          fecha_registro: string | null
          foto_url: string | null
          genero: string | null
          google_scholar_url: string | null
          ha_visto_clase_antes: boolean | null
          horario_atencion: string | null
          id: string
          linkedin_url: string | null
          mendeley_url: string | null
          nombre: string
          orcid_url: string | null
          programa: string | null
          promedio_acumulado: number | null
          researchgate_url: string | null
          rol: string | null
          semestre: number | null
          telefono: string | null
        }
        Insert: {
          activo?: boolean | null
          apellido: string
          biografia?: string | null
          celular?: string | null
          codigo?: string | null
          cvlac_url?: string | null
          documento_identidad?: string | null
          email: string
          es_homologante?: boolean | null
          especialidad?: string | null
          facultad?: string | null
          fecha_nacimiento?: string | null
          fecha_registro?: string | null
          foto_url?: string | null
          genero?: string | null
          google_scholar_url?: string | null
          ha_visto_clase_antes?: boolean | null
          horario_atencion?: string | null
          id: string
          linkedin_url?: string | null
          mendeley_url?: string | null
          nombre: string
          orcid_url?: string | null
          programa?: string | null
          promedio_acumulado?: number | null
          researchgate_url?: string | null
          rol?: string | null
          semestre?: number | null
          telefono?: string | null
        }
        Update: {
          activo?: boolean | null
          apellido?: string
          biografia?: string | null
          celular?: string | null
          codigo?: string | null
          cvlac_url?: string | null
          documento_identidad?: string | null
          email?: string
          es_homologante?: boolean | null
          especialidad?: string | null
          facultad?: string | null
          fecha_nacimiento?: string | null
          fecha_registro?: string | null
          foto_url?: string | null
          genero?: string | null
          google_scholar_url?: string | null
          ha_visto_clase_antes?: boolean | null
          horario_atencion?: string | null
          id?: string
          linkedin_url?: string | null
          mendeley_url?: string | null
          nombre?: string
          orcid_url?: string | null
          programa?: string | null
          promedio_acumulado?: number | null
          researchgate_url?: string | null
          rol?: string | null
          semestre?: number | null
          telefono?: string | null
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
      estado_asistencia: "presente" | "ausente" | "tarde" | "justificado"
      usuario_rol: "admin" | "docente" | "estudiante"
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
      estado_asistencia: ["presente", "ausente", "tarde", "justificado"],
      usuario_rol: ["admin", "docente", "estudiante"],
    },
  },
} as const
