# Guía de Integración con Supabase - AcademicFlow Pro

Para completar la integración de la base de datos y reemplazar los datos de prueba, sigue estos pasos en tu proyecto de Supabase.

## 1. Acceder al SQL Editor
1. Ve a tu Dashboard de Supabase.
2. Selecciona tu proyecto.
3. En el menú lateral izquierdo, haz clic en **SQL Editor**.

## 2. Crear las Tablas (Schema)
1. Haz clic en **New query**.
2. Copia el contenido del archivo `supabase/migrations/01_initial_schema.sql` que se encuentra en tu proyecto local.
3. Pega el contenido en el editor SQL de Supabase.
4. Haz clic en **Run** para ejecutar el script.
   - Esto creará todas las tablas necesarias (`usuarios`, `cursos`, `asistencia`, etc.) y configurará las políticas de seguridad (RLS).

## 3. Poblar Datos de Prueba (Seed)
1. Haz clic en **New query** nuevamente (o limpia el editor actual).
2. Copia el contenido del archivo `supabase/seed.sql` de tu proyecto local.
3. Pega el contenido en el editor SQL.
4. Haz clic en **Run**.
   - Esto insertará los datos iniciales (docentes, estudiantes, cursos, notas) para que la aplicación no esté vacía.

## 4. Verificación
1. Recarga tu aplicación AcademicFlow Pro (`http://localhost:5173`).
2. Inicia sesión.
   - Si usas el botón **"Ingresar en Modo Demo (Sin Backend)"**, la aplicación ahora intentará conectarse a Supabase primero. Si la base de datos está configurada correctamente, verás los datos que acabas de insertar.
   - Si la conexión falla, la aplicación seguirá funcionando con los datos locales de respaldo (mocks).

## Notas Adicionales
- La aplicación está configurada para conectarse automáticamente si las variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` están definidas en tu archivo `.env`.
- El usuario demo (`docente-demo`) está incluido en el script de seed para facilitar las pruebas.
