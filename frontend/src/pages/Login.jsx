/**
 * Login.jsx - Pagina de inicio de sesion de CorpHR.
 *
 * Diseno:
 *  - Panel izquierdo: features del rol activo (cambia al cambiar tab)
 *  - Panel derecho: formulario compacto con tabs Admin / Empleado
 *  - "Volver al inicio" fijo en la esquina superior izquierda
 *  - Rol inicial tomado desde ?rol= (Home) o 'admin' por defecto
 */
import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button      from '../components/ui/Button';
import Alert       from '../components/ui/Alert';
import ThemeToggle from '../components/ui/ThemeToggle';
import { toast }   from '../stores/useToastStore';

/* -- Iconos -- */
const IcoEye     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcoEyeOff  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const IcoShield  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcoUser    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoBack    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const IcoCheck   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoShieldLg = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcoUserLg   = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

/* -- Configuracion por rol -- */
const ROL_CONFIG = {
  admin: {
    color:   'accent',
    titulo:  'Panel de Administracion',
    sub:     'Control total sobre el sistema',
    icono:   <IcoShieldLg />,
    features: [
      'Dashboard con metricas en tiempo real',
      'Gestion de empleados y cargos',
      'Administrar estructura de departamentos',
      'Control y seguimiento de asistencia',
      'Generacion de reportes organizacionales',
      'Crear cuentas de acceso al sistema',
    ],
  },
  empleado: {
    color:   'purple',
    titulo:  'Portal del Empleado',
    sub:     'Tu espacio personal de RRHH',
    icono:   <IcoUserLg />,
    features: [
      'Consultar perfil y datos personales',
      'Ver historial de asistencia',
      'Actualizar informacion de contacto',
      'Acceso seguro con credenciales propias',
    ],
  },
};

export default function Login() {
  const { login }      = useAuth();
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();

  /* Rol inicial desde ?rol= o 'admin' por defecto */
  const rolParam  = searchParams.get('rol');
  const rolInicial = (rolParam === 'admin' || rolParam === 'empleado') ? rolParam : 'admin';
  const [rolActivo, setRolActivo] = useState(rolInicial);

  const config = ROL_CONFIG[rolActivo];

  /* -- Estado del formulario -- */
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [verPass,  setVerPass]  = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState('');

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const usuario = await login(email.trim(), password);

      /* Verificar que el rol real coincide con el tab seleccionado */
      const rolEsperado = rolActivo === 'admin' ? 'admin' : 'employee';
      if (usuario.role !== rolEsperado) {
        const msg =
          rolActivo === 'admin'
            ? 'Esta cuenta es de empleado. Usa el acceso de Empleado.'
            : 'Esta cuenta es de administrador. Usa el acceso de Administrador.';
        toast.error('Acceso incorrecto', msg);
        setError(msg);
        return;
      }

      toast.success('Bienvenido!', `Hola, ${usuario.name || 'usuario'}.`);
      navigate(
        usuario.role === 'admin' ? '/app/dashboard' : '/app/mi-perfil',
        { replace: true }
      );
    } catch (err) {
      const msg = err.message || 'Error al iniciar sesion';
      toast.error('Error al iniciar sesion', msg);
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-screen">

      {/* Volver al inicio -> esquina superior izquierda */}
      <Link to="/" className="login-back">
        <IcoBack /> Volver al inicio
      </Link>
      <div className="login-theme">
        <ThemeToggle />
      </div>

      {/* -- Panel izquierdo: features del rol activo -- */}
      <div className={`login-brand login-brand--${config.color}`}>
        <div className="login-brand__role-header">
          <div className={`login-brand__role-icon login-brand__role-icon--${config.color}`}>
            {config.icono}
          </div>
          <div>
            <h3 className="login-brand__role-title">{config.titulo}</h3>
            <p className="login-brand__role-sub">{config.sub}</p>
          </div>
        </div>

        <ul className="login-brand__features">
          {config.features.map(f => (
            <li key={f} className={`login-brand__feat login-brand__feat--${config.color}`}>
              <span className="login-brand__feat-icon"><IcoCheck /></span>
              {f}
            </li>
          ))}
        </ul>

        <div className="login-brand__deco" aria-hidden="true" />
      </div>

      {/* -- Panel derecho: formulario -- */}
      <div className="login-panel">
        <div className="login-card">

          {/* Branding */}
          <div className="login-card__brand">
            <div className="login-card__logo">CH</div>
            <div className="login-card__brand-text">
              <span className="login-card__brand-name">CorpHR</span>
              <span className="login-card__brand-sub">Sistema de Recursos Humanos</span>
            </div>
          </div>

          {/* Titulo */}
          <div className="login-card__header">
            <h2 className="login-card__title">Bienvenido</h2>
            <p className="login-card__sub">Ingresa tus credenciales para continuar</p>
          </div>

          {/* Tabs de rol */}
          <div className="login-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={rolActivo === 'admin'}
              className={`login-tab ${rolActivo === 'admin' ? 'login-tab--active-accent' : ''}`}
              onClick={() => { setRolActivo('admin'); setError(''); }}
            >
              <IcoShield /> Administrador
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={rolActivo === 'empleado'}
              className={`login-tab ${rolActivo === 'empleado' ? 'login-tab--active-purple' : ''}`}
              onClick={() => { setRolActivo('empleado'); setError(''); }}
            >
              <IcoUser /> Empleado
            </button>
          </div>

          {/* Error */}
          {error && (
            <Alert tipo="error" onCerrar={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Formulario */}
          <form className="login-form" onSubmit={manejarEnvio} noValidate>
            <div className="field">
              <label htmlFor="email" className="field__label">Correo electronico</label>
              <input
                id="email"
                type="email"
                className="field__input"
                placeholder="usuario@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                autoFocus
              />
            </div>

            <div className="field">
              <label htmlFor="password" className="field__label">Contrasena</label>
              <div className="field__input-wrap">
                <input
                  id="password"
                  type={verPass ? 'text' : 'password'}
                  className="field__input"
                  placeholder="Ingresa tu contrasena"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="field__eye"
                  onClick={() => setVerPass(v => !v)}
                  aria-label={verPass ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                >
                  {verPass ? <IcoEyeOff /> : <IcoEye />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variante="primary"
              size="lg"
              fullWidth
              cargando={cargando}
            >
              {cargando ? 'Verificando...' : 'Iniciar Sesion'}
            </Button>
          </form>

          {/* Recuperar contrasena */}
          <p className="login-card__footer">
            Olvidaste tu contrasena?{' '}
            <Link to="/recuperar-contrasena" className="field__link">Recuperar acceso</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
