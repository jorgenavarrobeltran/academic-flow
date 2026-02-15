# Lista de Tareas: AcademicFlow Pro 

Esta lista de tareas rastrea la implementación completa de **AcademicFlow Pro** basada en los 19 módulos del PRD.

## Fase 1: Fundamentos Institucionales (MVP)
*Objetivo: Gestión administrativa básica, autenticación y cursos.*

- [x] **Módulo 1: Autenticación y Gestión de Usuarios**
    - [x] Login (Docente/Estudiante) *(UI Completa, Backend Integrado)*
    - [x] Registro y Perfil de Usuario *(UI Implementada en Configuración)*
    - [x] Configuración de Notificaciones *(UI Implementada en Configuración)*
    - [x] Recuperación de Contraseña *(UI Implementada)*

- [x] **Módulo 2: Gestión de Cursos y Semestres**
    - [x] Dashboard Principal *(UI Completa, Datos Reales Integrados)*
    - [x] Creación de Cursos *(Backend Integrado en useStore)*
    - [x] Importación de Listas de Estudiantes *(Excel/CSV)*

- [x] **Módulo 3: Control de Asistencia**
    - [x] Toma de Lista Inteligente *(Integrado con Supabase/Demo)*
    - [x] Justificación de Inasistencias *(UI Implementada)*
    - [x] Reportes de Asistencia *(Estadísticas básicas en vista)*

## Fase 2: Evaluación y Rendimiento
*Objetivo: Sistema de notas, rúbricas y detección de riesgo.*

- [x] **Módulo 4: Sistema de Calificación por Cortes**
    - [x] Configuración de Cortes (30-30-40)
    - [x] Libro de Calificaciones *(UI Implementada)*
    - [x] Cálculo de Definitivas *(Implementado en Frontend)*

- [x] **Módulo 10: Reportes y Estadísticas**
    - [x] Reportes Docente (Notas/Asistencia) *(Dashboard con Gráficos)*
    - [x] Exportación a Excel/PDF *(Funcionalidad Excel activa con xlsx)*
    - [x] Análisis de Desempeño Avanzado *(Cobertura de métricas implementada)*

- [x] **Módulo 13: Gestión de Rúbricas**
    - [x] Constructor de Rúbricas Parametrizables
    - [x] Evaluación 360° *(Tab Implementado)*

- [x] **Módulo 14: Detección Temprana de Riesgo (Early Warning)**
    - [x] Algoritmo de Predicción
    - [x] Semáforo de Riesgo (Verde/Amarillo/Rojo)

## Fase 3: Comunicación y Oportunidades
*Objetivo: Recursos, convocatorias y alertas.*

- [x] **Módulo 8: Calendario y Notificaciones**
    - [x] Calendario Integrado
    - [x] Sistema de Alertas (Emails con Resend) *(Funcionalidad Backend Real)*

- [x] **Módulo 11: Recursos Educativos**
    - [x] Biblioteca de Contenidos *(UI Implementada)*

- [x] **Módulo 12: Convocatorias y Becas**
    - [x] Listado de Oportunidades *(UI Implementada)*
    - [x] Detalle de Convocatoria *(Modal funcional)*

## Fase 4: Futuras Implementaciones

- [x] **Módulo 7: Evaluaciones Virtuales** (Quices/Parciales)
- [x] **Módulo 9: Chatbot de Consultas** *(Componente Flotante Implementado)*
- [x] **Módulo 15: Portafolio Digital** *(Componente Implementado)*
- [x] **Persistencia Global**: Conectado a Supabase (Ver README_SUPABASE.md para aplicar migraciones)
