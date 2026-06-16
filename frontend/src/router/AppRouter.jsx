/**
 * AppRouter.jsx — Enrutador principal de CorpHR.
 *
 * Define todas las rutas de la aplicación con protección por rol:
 *   - Rutas públicas   : Login, Recuperar contraseña
 *   - Rutas admin      : Dashboard, Posiciones, Departamentos, Asistencia, Reportes
 *   - Rutas empleado   : Mi Perfil, Mi Asistencia
 *
 * Guardias de ruta:
 *   PrivateRoute  — requiere estar autenticado
 *   AdminRoute    — requiere rol 'admin'
 *   EmployeeRoute — requiere rol 'employee'
 *   PublicRoute   — redirige al dashboard si ya está autenticado
 */
import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/ui/Spinner';

/* Componentes de layout */
import Layout from '../components/layout/Layout';

/* Páginas públicas — carga eager (críticas para el primer render) */
import Home            from '../pages/Home';
import Login           from '../pages/Login';
import RecoverPassword from '../pages/RecoverPassword';
import ResetPassword   from '../pages/ResetPassword';

/* Páginas del administrador — lazy loaded (solo se descargan al navegar) */
const Dashboard      = lazy(() => import('../pages/Dashboard'));
const Employees      = lazy(() => import('../pages/Employees'));
const GestionEmpleados = lazy(() => import('../pages/GestionEmpleados'));
const Departments    = lazy(() => import('../pages/Departments'));
const Attendance     = lazy(() => import('../pages/Attendance'));
const Reports        = lazy(() => import('../pages/Reports'));
const Register       = lazy(() => import('../pages/Register'));
const GenerateReports = lazy(() => import('../pages/GenerateReports'));

/* Páginas del empleado — lazy loaded */
const MyProfile    = lazy(() => import('../pages/MyProfile'));
const MyAttendance = lazy(() => import('../pages/MyAttendance'));

function PageLoader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Spinner />
    </div>
  );
}

/* ── Guardias de ruta ── */

/** Ruta privada: solo usuarios autenticados */
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <RouteLoader />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

/** Ruta de administrador: solo rol 'admin' */
function AdminRoute({ children }) {
  const { esAdmin, isAuthenticated, loading } = useAuth();
  if (loading) return <RouteLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return esAdmin() ? children : <Navigate to="/app/mi-perfil" replace />;
}

/** Ruta de empleado: rol 'employee' (admin tambien puede verlas) */
function EmployeeRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <RouteLoader />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

/** Ruta publica: si ya esta autenticado redirige segun rol */
function PublicRoute({ children }) {
  const { isAuthenticated, esAdmin, loading } = useAuth();
  if (loading) return <RouteLoader />;
  if (isAuthenticated) {
    return <Navigate to={esAdmin() ? '/app/dashboard' : '/app/mi-perfil'} replace />;
  }
  return children;
}

/* ── Componente principal del router ── */
export default function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>

        {/* ── Rutas publicas (sin layout) ── */}
        <Route path="/" element={
          <PublicRoute><Home /></PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute><Login /></PublicRoute>
        } />
        <Route path="/recuperar-contrasena" element={
          <PublicRoute><RecoverPassword /></PublicRoute>
        } />
        <Route path="/reset-password/:token" element={
          <PublicRoute><ResetPassword /></PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute><Suspense fallback={<PageLoader />}><Register /></Suspense></PublicRoute>
        } />

        {/* ── Rutas protegidas (con layout sidebar + topbar) ── */}
        <Route path="/app" element={
          <PrivateRoute><Layout /></PrivateRoute>
        }>

          {/* Redireccion raiz segun rol */}
          <Route index element={<RedirectPorRol />} />

          {/* Rutas exclusivas del administrador */}
          <Route path="dashboard" element={
            <AdminRoute><Suspense fallback={<PageLoader />}><Dashboard /></Suspense></AdminRoute>
          } />
          <Route path="posiciones" element={
            <AdminRoute><Suspense fallback={<PageLoader />}><Employees /></Suspense></AdminRoute>
          } />
          <Route path="departamentos" element={
            <AdminRoute><Suspense fallback={<PageLoader />}><Departments /></Suspense></AdminRoute>
          } />
          <Route path="asistencia" element={
            <AdminRoute><Suspense fallback={<PageLoader />}><Attendance /></Suspense></AdminRoute>
          } />
          <Route path="reportes" element={
            <AdminRoute><Suspense fallback={<PageLoader />}><Reports /></Suspense></AdminRoute>
          } />
          <Route path="generar-reportes" element={
            <AdminRoute><Suspense fallback={<PageLoader />}><GenerateReports /></Suspense></AdminRoute>
          } />
          <Route path="registro" element={
            <AdminRoute><Suspense fallback={<PageLoader />}><Register /></Suspense></AdminRoute>
          } />
          <Route path="empleados" element={
            <AdminRoute><Suspense fallback={<PageLoader />}><GestionEmpleados /></Suspense></AdminRoute>
          } />

          {/* Rutas del empleado (cualquier usuario autenticado) */}
          <Route path="mi-perfil" element={
            <EmployeeRoute><Suspense fallback={<PageLoader />}><MyProfile /></Suspense></EmployeeRoute>
          } />
          <Route path="mi-asistencia" element={
            <EmployeeRoute><Suspense fallback={<PageLoader />}><MyAttendance /></Suspense></EmployeeRoute>
          } />
        </Route>

        {/* Ruta 404 — redirigir al inicio */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.querySelector('.layout__content')?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

/** Redirige al inicio correcto segun el rol del usuario */
function RedirectPorRol() {
  const { esAdmin } = useAuth();
  return <Navigate to={esAdmin() ? '/app/dashboard' : '/app/mi-perfil'} replace />;
}

function RouteLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: 'var(--bg)',
      color: 'var(--text)'
    }}>
      <span className="spinner spinner--lg" aria-label="Cargando sesión" />
    </div>
  );
}
