import { useState, useEffect, useCallback } from 'react';
import { obtenerPerfilAPI, actualizarPerfilAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Avatar from '../components/ui/Avatar';
import Badge  from '../components/ui/Badge';
import Alert  from '../components/ui/Alert';
import Modal  from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { toast } from '../stores/useToastStore';

/* -- Icono de usuario -- */
const IcoUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

/* -- Icono de sobre (email) -- */
const IcoMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

/* -- Icono de escudo (rol) -- */
const IcoShield = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

/* -- Icono de calendario -- */
const IcoCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

/* -- Fila de informacion del perfil -- */
function FilaPerfil({ icono, etiqueta, valor }) {
  return (
    <div className="perfil__fila">
      <div className="perfil__fila-icono">{icono}</div>
      <div className="perfil__fila-info">
        <span className="perfil__fila-etiqueta">{etiqueta}</span>
        <span className="perfil__fila-valor">{valor}</span>
      </div>
    </div>
  );
}

/* ================================================================
   Pagina: Mi Perfil
  Llama a GET /api/auth/profile para mostrar datos del usuario
  autenticado y permite editar nombre y contrasena desde un modal.
   ================================================================ */
export default function MyProfile() {
  const { refrescarPerfil } = useAuth();

  /* Datos del usuario cargados del backend */
  const [usuario, setUsuario] = useState(null);
  /* Estado de carga */
  const [cargando, setCargando] = useState(true);
  /* Error de carga */
  const [error, setError] = useState(null);

  /* Estados para editar perfil */
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nombreEdicion, setNombreEdicion] = useState('');
  const [passwordEdicion, setPasswordEdicion] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState('');
  const [exito, setExito] = useState('');

  const cargarPerfil = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerPerfilAPI();
      setUsuario(data.user ?? null);
    } catch (e) {
      setError(e.message ?? 'Error al cargar el perfil');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(cargarPerfil);
  }, [cargarPerfil]);

  const abrirModalEdicion = () => {
    setErrorModal('');
    setExito('');
    setNombreEdicion(usuario?.name ?? '');
    setPasswordEdicion('');
    setVerPassword(false);
    setModalAbierto(true);
  };

  const cerrarModalEdicion = () => {
    setModalAbierto(false);
    setErrorModal('');
    setGuardando(false);
  };

  const guardarPerfil = async () => {
    setErrorModal('');
    if (!nombreEdicion.trim()) {
      setErrorModal('El nombre no puede estar vacio.');
      return;
    }

    const datos = { name: nombreEdicion.trim() };
    if (passwordEdicion.trim()) {
      datos.password = passwordEdicion;
    }

    setGuardando(true);

    try {
      await actualizarPerfilAPI(datos);
      await refrescarPerfil();
      await cargarPerfil();
      setModalAbierto(false);
      setExito('Perfil actualizado correctamente.');
      toast.success('Perfil actualizado', 'Tus cambios fueron guardados correctamente.');
    } catch (e) {
      setErrorModal(e.message || 'Error al actualizar el perfil');
    } finally {
      setGuardando(false);
    }
  };

  /* -- Formateador de fecha en espanol -- */
  const fecha = iso => iso
    ? new Date(iso).toLocaleDateString('es-CO', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
    : '-';

  /* -- Etiqueta legible del rol -- */
  const etiquetaRol = rol => ({
    admin: 'Administrador',
    employee: 'Empleado'
  }[rol] ?? rol ?? '-');

  /* -- Color del badge segun rol -- */
  const colorRol = rol => rol === 'admin' ? 'purple' : 'blue';

  /* Iniciales para el avatar */
  const iniciales = nombre => {
    if (!nombre) return '?';
    return nombre.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  };

  return (
    <div className="mi-perfil">

      {exito && (
        <Alert tipo="success" onCerrar={() => setExito('')}>{exito}</Alert>
      )}

      {/* -- Skeleton de carga -- */}
      {cargando && (
        <div className="perfil__card card">
          <div className="perfil__header-skeleton">
            <div className="skeleton perfil__avatar-sk" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="skeleton" style={{ width: '45%', height: 20 }} />
              <div className="skeleton" style={{ width: '30%', height: 14 }} />
            </div>
          </div>
          <div className="perfil__divider" />
          {[1,2,3,4].map(i => (
            <div key={i} className="perfil__fila">
              <div className="skeleton" style={{ width: 34, height: 34, borderRadius: 9 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="skeleton" style={{ width: '20%', height: 11 }} />
                <div className="skeleton" style={{ width: '50%', height: 14 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* -- Error -- */}
      {!cargando && error && (
        <Alert tipo="error">{error}</Alert>
      )}

      {/* -- Tarjeta de perfil -- */}
      {!cargando && !error && usuario && (
        <>
          {/* Seccion superior: avatar + nombre + rol */}
          <div className="perfil__card card">
            <div className="perfil__hero">
              <div className="perfil__hero-bg" />
              <div className="perfil__hero-content">
                <div className="perfil__hero-left">
                  <Avatar texto={iniciales(usuario.name)} tamano="xl" />
                  <div className="perfil__hero-info">
                    <h2 className="perfil__nombre">{usuario.name}</h2>
                    <p className="perfil__email">{usuario.email}</p>
                    <div className="perfil__badges">
                      <Badge texto={etiquetaRol(usuario.role)} tipo={colorRol(usuario.role)} />
                      <Badge texto="Cuenta activa" tipo="green" dot />
                    </div>
                  </div>
                </div>
                <div className="perfil__hero-actions">
                  <Button variante="secondary" onClick={abrirModalEdicion}>
                    Editar perfil
                  </Button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="perfil__divider" />

            {/* Filas de informacion */}
            <div className="perfil__info">
              <FilaPerfil
                icono={<IcoUser />}
                etiqueta="Nombre completo"
                valor={usuario.name}
              />
              <FilaPerfil
                icono={<IcoMail />}
                etiqueta="Correo electronico"
                valor={usuario.email}
              />
              <FilaPerfil
                icono={<IcoShield />}
                etiqueta="Rol en el sistema"
                valor={etiquetaRol(usuario.role)}
              />
              <FilaPerfil
                icono={<IcoCalendar />}
                etiqueta="Miembro desde"
                valor={fecha(usuario.createdAt)}
              />
            </div>
          </div>

        </>
      )}

      {modalAbierto && usuario && (
        <Modal
          titulo="Editar perfil"
          onClose={cerrarModalEdicion}
          ancho="480px"
          footer={(
            <>
              <Button variante="ghost" onClick={cerrarModalEdicion}>Cancelar</Button>
              <Button variante="primary" onClick={guardarPerfil} cargando={guardando}>Guardar cambios</Button>
            </>
          )}
        >
          <div className="perfil__modal-form">
            <div className="field">
              <label htmlFor="perfil-nombre" className="field__label">Nombre completo</label>
              <input
                id="perfil-nombre"
                type="text"
                className="field__input"
                value={nombreEdicion}
                onChange={(e) => setNombreEdicion(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="field">
              <label htmlFor="perfil-password" className="field__label">Nueva contrasena</label>
              <div className="field__input-wrap">
                <input
                  id="perfil-password"
                  type={verPassword ? 'text' : 'password'}
                  className="field__input"
                  value={passwordEdicion}
                  onChange={(e) => setPasswordEdicion(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Dejar vacio para no cambiar"
                />
                <button
                  type="button"
                  className="field__eye"
                  onClick={() => setVerPassword((v) => !v)}
                  aria-label={verPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                >
                  {verPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="perfil__modal-info">
              <p><strong>Correo:</strong> {usuario.email}</p>
              <p><strong>Rol:</strong> {etiquetaRol(usuario.role)}</p>
            </div>

            {errorModal && (
              <Alert tipo="error" className="perfil__modal-alert">{errorModal}</Alert>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
