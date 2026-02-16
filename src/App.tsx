import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layouts/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import { Toaster } from './components/ui/sonner';
import { Asistencia } from './components/asistencia/Asistencia';
import Calificaciones from './components/calificaciones/Calificaciones';
import Calendario from './components/calendario/Calendario';
import Recursos from './components/recursos/Recursos';
import { Cursos } from './components/cursos/Cursos';
import { Grupos } from './components/grupos/Grupos';
import { Alertas } from './components/alertas/Alertas';
import { Estudiantes } from './components/estudiantes/Estudiantes';
import { Convocatorias } from './components/convocatorias/Convocatorias';
import { Reportes } from './components/reportes/Reportes';
import { Configuracion } from './components/configuracion/Configuracion';
import EarlyWarning from './components/risk/EarlyWarning';
import Rubricas from './components/rubricas/Rubricas';
import Evaluaciones from './components/evaluaciones/Evaluaciones';
import Portafolio from './components/portafolio/Portafolio';
import PublicRegistration from './components/public/PublicRegistration';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register/:cursoId" element={<PublicRegistration />} />

        {/* Protected Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="courses" element={<Cursos />} />
          <Route path="students" element={<Estudiantes />} />
          <Route path="attendance" element={<Asistencia />} />
          <Route path="grades" element={<Calificaciones />} />
          <Route path="groups" element={<Grupos />} />
          <Route path="calendar" element={<Calendario />} />
          <Route path="alerts" element={<Alertas />} />
          <Route path="resources" element={<Recursos />} />
          <Route path="convocatorias" element={<Convocatorias />} />
          <Route path="evaluations" element={<Evaluaciones />} />
          <Route path="rubrics" element={<Rubricas />} />
          <Route path="portfolio" element={<Portafolio />} />
          <Route path="reports" element={<Reportes />} />
          <Route path="settings" element={<Configuracion />} />
          <Route path="early-warning" element={<EarlyWarning />} />
        </Route>

        {/* Catch-all to login or dashboard */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
