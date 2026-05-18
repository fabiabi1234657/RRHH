/**
 * Login.jsx - Pagina de inicio de sesion de CorpHR.
 *
 * Diseno:
 *  - Panel izquierdo: branding compacto (logo, tagline, pills decorativas)
 *  - Panel derecho: formulario limpio sin selector de rol
 *  - "Volver al inicio" fijo en esquina superior izquierda
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button      from '../components/ui/Button';
import Alert       from '../components/ui/Alert';
import ThemeToggle from '../components/ui/ThemeToggle';
import { toast }   from '../stores/useToastStore';
import './Login.css';

/* -- Iconos -- */
const IcoEye    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcoEyeOff = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const IcoBack   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;


export default function Login() {
  const { login, verifyMfaLogin } = useAuth();
  const navigate  = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [verPass,  setVerPass]  = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState('');

  // Estado del paso MFA
  const [mfaToken, setMfaToken] = useState('');
  const [mfaCode,  setMfaCode]  = useState('');

  const irPorRol = (usuario) => {
    toast.success('¡Bienvenido de vuelta!', `Hola, ${usuario.name || 'usuario'}. Sesión iniciada correctamente.`);
    navigate(
      usuario.role === 'admin' ? '/app/dashboard' : '/app/mi-perfil',
      { replace: true }
    );
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Completa todos los campos.');
      return;
    }
    setError('');
    setCargando(true);
    try {
      const resultado = await login(email.trim(), password);

      if (resultado?.mfaRequired) {
        setMfaToken(resultado.mfaToken);
        toast.info('Verificación en dos pasos', 'Ingresa el código de tu app autenticadora.');
        return;
      }

      irPorRol(resultado.user);
    } catch (err) {
      const msg = err.message || 'Error al iniciar sesion';
      toast.error('Error al iniciar sesión', msg);
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  const manejarVerificarMfa = async (e) => {
    e.preventDefault();
    if (!mfaCode.trim()) {
      setError('Ingresa el código de 6 dígitos.');
      return;
    }
    setError('');
    setCargando(true);
    try {
      const usuario = await verifyMfaLogin(mfaToken, mfaCode.trim());
      irPorRol(usuario);
    } catch (err) {
      const msg = err.message || 'Código inválido';
      toast.error('Verificación fallida', msg);
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  const cancelarMfa = () => {
    setMfaToken('');
    setMfaCode('');
    setError('');
  };

  return (
    <div className="login-screen">

      {/* Volver al inicio */}
      <Link to="/" className="login-back">
        <IcoBack /> Volver al inicio
      </Link>
      <div className="login-theme">
        <ThemeToggle />
      </div>

      {/* -- Panel izquierdo: branding -- */}
      <div className="login-brand" aria-hidden="true">

        {/* Blobs SVG decorativos */}
        <svg className="login-blobs" viewBox="0 0 600 800" fill="none" preserveAspectRatio="xMidYMid slice">
          <ellipse cx="490" cy="90"  rx="220" ry="220" fill="url(#b1)" opacity="0.65"/>
          <ellipse cx="55"  cy="700" rx="260" ry="260" fill="url(#b2)" opacity="0.65"/>
          <ellipse cx="310" cy="390" rx="140" ry="140" fill="url(#b3)" opacity="0.3"/>
          <ellipse cx="540" cy="540" rx="110" ry="110" fill="url(#b4)" opacity="0.52"/>
          <ellipse cx="-20" cy="210" rx="130" ry="130" fill="url(#b5)" opacity="0.42"/>
          <defs>
            <radialGradient id="b1" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#A5B4FC"/>
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="b2" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#C084FC"/>
              <stop offset="100%" stopColor="#9333EA" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="b3" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#F9A8D4"/>
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="b4" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#FDA4AF"/>
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="b5" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#E0E7FF"/>
              <stop offset="100%" stopColor="#818CF8" stopOpacity="0"/>
            </radialGradient>
          </defs>
        </svg>

        <div className="login-brand__content">

          {/* Logo + nombre */}
          <div className="login-brand__logo-wrap">
            <div className="login-brand__logo">CH</div>
            <span className="login-brand__name">CorpHR</span>
          </div>

          {/* Headline */}
          <div className="login-brand__hero">
            <h1 className="login-brand__headline">Tu equipo,<br/>en un solo<br/>lugar.</h1>
            <p className="login-brand__tagline">Gestiona asistencia, empleados<br/>y reportes desde una sola plataforma.</p>
          </div>

        </div>
      </div>

      {/* -- Panel derecho: formulario -- */}
      <div className="login-panel">
        <div className="login-card">

          {/* Titulo */}
          <div className="login-card__header">
            <h2 className="login-card__title">
              {mfaToken ? 'Verificación en dos pasos' : 'Bienvenido'}
            </h2>
            <p className="login-card__sub">
              {mfaToken
                ? 'Ingresa el código de 6 dígitos de tu app autenticadora.'
                : 'Ingresa tus credenciales para continuar'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <Alert tipo="error" onCerrar={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Formulario de credenciales */}
          {!mfaToken && (
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
          )}

          {/* Formulario de MFA */}
          {mfaToken && (
            <form className="login-form" onSubmit={manejarVerificarMfa} noValidate>
              <div className="field">
                <label htmlFor="mfaCode" className="field__label">Código TOTP</label>
                <input
                  id="mfaCode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  className="field__input"
                  placeholder="123456"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                variante="primary"
                size="lg"
                fullWidth
                cargando={cargando}
              >
                {cargando ? 'Verificando...' : 'Verificar código'}
              </Button>

              <Button
                type="button"
                variante="ghost"
                size="md"
                fullWidth
                onClick={cancelarMfa}
              >
                Cancelar
              </Button>
            </form>
          )}

          {/* Recuperar contrasena */}
          {!mfaToken && (
            <p className="login-card__footer">
              Olvidaste tu contrasena?{' '}
              <Link to="/recuperar-contrasena" className="field__link">Recuperar acceso</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
