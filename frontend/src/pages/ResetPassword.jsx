/* ============================================================
   ResetPassword.jsx - Página para establecer nueva contraseña
   ============================================================ */
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { restablecerContrasenaAPI } from '../services/api';
import Button      from '../components/ui/Button';
import Alert       from '../components/ui/Alert';
import ThemeToggle from '../components/ui/ThemeToggle';

const IcoLock = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IcoCheck = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Las contraseñas no coinciden.');
    }
    
    if (password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres.');
    }

    setError('');
    setEnviando(true);
    
    try {
      const respuesta = await restablecerContrasenaAPI(token, password);
      if (respuesta?.success) {
        setExito(true);
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err) {
      setError(err.message || 'Error al restablecer la contraseña.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="recover-page">
      <div className="recover-brand">
        <div className="recover-brand__logo">
          <span className="recover-brand__logo-box">CH</span>
          CorpHR
        </div>
        <div className="recover-brand__body">
          <h1 className="recover-brand__title">Nueva<br />contraseña.</h1>
          <p className="recover-brand__sub">
            Asegúrate de elegir una contraseña segura que no uses en otros sitios.
          </p>
        </div>
      </div>

      <div className="recover-form-panel">
        <div className="recover-theme">
          <ThemeToggle />
        </div>

        <div className="recover-form-wrap">
          <div className="recover-icon">
            <IcoLock />
          </div>

          <h2 className="recover-title">Restablecer contraseña</h2>
          <p className="recover-desc">
            Ingresa tu nueva contraseña a continuación para recuperar el acceso.
          </p>

          {exito ? (
            <div className="recover-success">
              <div className="recover-success__icon"><IcoCheck /></div>
              <h3 className="recover-success__title">¡Contraseña actualizada!</h3>
              <p className="recover-success__desc">
                Tu contraseña ha sido cambiada correctamente. Serás redirigido al login en unos segundos...
              </p>
              <Link to="/login" className="recover-login-link">
                Ir al inicio de sesión ahora
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <Alert tipo="error" onCerrar={() => setError('')}>
                  {error}
                </Alert>
              )}
              <form className="recover-form" onSubmit={handleSubmit}>
                <div className="field">
                  <label className="field__label" htmlFor="new-password">Nueva contraseña</label>
                  <input
                    id="new-password"
                    type="password"
                    className="field__input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="confirm-password">Confirmar contraseña</label>
                  <input
                    id="confirm-password"
                    type="password"
                    className="field__input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" variante="primary" fullWidth cargando={enviando}>
                  Restablecer contraseña
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
