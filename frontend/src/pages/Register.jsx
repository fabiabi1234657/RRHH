import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrarAPI, registrarAdminAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Alert  from '../components/ui/Alert';

/* -- Iconos -- */
const IcoEye      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcoEyeOff   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const IcoUserPlus = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/></svg>;
const IcoShield    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcoBriefcase = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>;


/* ================================================================
   Pagina: Registrar Usuario
   Solo accesible para el rol 'admin'.
   Llama a POST /api/auth/register con { name, email, password, role }.
   ================================================================ */
export default function Register() {
  const navigate = useNavigate();
  const { esAdmin, isAuthenticated } = useAuth();
  const puedeAsignarRol = isAuthenticated && esAdmin();

  /* -- Estado del formulario -- */
  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmar: '', rol: 'employee' });
  const [verPass, setVerPass]   = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState('');
  const [exito,    setExito]    = useState('');

  const cambiar = e => {
    setError('');
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  /* -- Envio del formulario al backend -- */
  const enviar = async e => {
    e.preventDefault();
    setError('');
    setExito('');

    /* Validación local de contraseñas coincidentes */
    if (form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden. Verifícalas e intenta de nuevo.');
      return;
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setCargando(true);
    try {
      const datos = puedeAsignarRol
        ? await registrarAdminAPI({
            name: form.nombre.trim(),
            email: form.email.trim(),
            password: form.password,
            role: form.rol
          })
        : await registrarAPI({
            name: form.nombre.trim(),
            email: form.email.trim(),
            password: form.password
          });
      /* Mostrar nombre del usuario creado en el mensaje de exito */
      setExito(`Usuario "${datos.user?.name ?? form.nombre}" creado correctamente.`);
      /* Limpiar formulario para permitir crear otro */
      setForm({ nombre: '', email: '', password: '', confirmar: '', rol: 'employee' });
    } catch (err) {
      setError(err.message || 'Error al crear el usuario');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="registro">
      <div className="registro__wrap">
        <div className="card">

          <div className="registro__card-head">
            <div className="registro__head-icon"><IcoUserPlus /></div>
            <div>
              <h2>Datos de la cuenta</h2>
              <p>Completa la información básica para habilitar el acceso.</p>
            </div>
          </div>

          {exito && <Alert tipo="success" onCerrar={() => setExito('')}>{exito}</Alert>}
          {error && <Alert tipo="error" onCerrar={() => setError('')}>{error}</Alert>}

          <form className="registro__form" onSubmit={enviar} noValidate>

          {/* Nombre completo */}
          <div className="field">
            <label className="field__label" htmlFor="rg-nombre">Nombre completo *</label>
            <input id="rg-nombre" name="nombre" className="field__input"
              placeholder="Ej. Maria Gonzalez" value={form.nombre}
              onChange={cambiar} required />
          </div>

          {/* Email */}
          <div className="field">
            <label className="field__label" htmlFor="rg-email">Correo electrónico *</label>
            <input id="rg-email" name="email" type="email" className="field__input"
              placeholder="usuario@empresa.com" value={form.email}
              onChange={cambiar} required />
          </div>

          {/* Fila: contraseña + confirmación */}
          <div className="registro__row">
            <div className="field">
              <label className="field__label" htmlFor="rg-pass">Contraseña *</label>
              <div className="field__input-wrap">
                <input id="rg-pass" name="password"
                  type={verPass ? 'text' : 'password'}
                  className="field__input"
                  placeholder="Min. 6 caracteres"
                  value={form.password} onChange={cambiar} required />
                <button type="button" className="field__eye" onClick={() => setVerPass(v => !v)} tabIndex={-1} aria-label={verPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                  {verPass ? <IcoEyeOff /> : <IcoEye />}
                </button>
              </div>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="rg-confirm">Confirmar contraseña *</label>
              <div className="field__input-wrap">
                <input id="rg-confirm" name="confirmar"
                  type={verPass ? 'text' : 'password'}
                  className="field__input"
                  placeholder="Repite la contraseña"
                  value={form.confirmar} onChange={cambiar} required />
              </div>
            </div>
          </div>

          {puedeAsignarRol ? (
            <div className="field">
              <span className="field__label">Rol en el sistema *</span>
              <div className="registro__role-grid" role="radiogroup" aria-label="Rol en el sistema">
                <button type="button" className={`registro__role-card ${form.rol === 'employee' ? 'is-active' : ''}`} onClick={() => setForm(f => ({ ...f, rol: 'employee' }))}>
                  <span className="registro__role-icon"><IcoBriefcase /></span>
                  <span><strong>Empleado</strong><small>Acceso a perfil y asistencia propia</small></span>
                </button>
                <button type="button" className={`registro__role-card ${form.rol === 'admin' ? 'is-active' : ''}`} onClick={() => setForm(f => ({ ...f, rol: 'admin' }))}>
                  <span className="registro__role-icon"><IcoShield /></span>
                  <span><strong>Administrador</strong><small>Gestion completa del sistema</small></span>
                </button>
              </div>
              <span className="field__hint">Solo un administrador autenticado puede crear cuentas admin.</span>
            </div>
          ) : (
            <div className="field">
              <span className="field__hint">
                El registro publico crea una cuenta de empleado. Las cuentas admin se crean desde el panel interno.
              </span>
            </div>
          )}

          <div className="registro__footer">
            <Button type="button" variante="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit" variante="primary" cargando={cargando}>Crear usuario</Button>
          </div>

          </form>
        </div>
      </div>
    </div>
  );
}
