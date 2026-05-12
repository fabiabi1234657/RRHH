/**
 * Sidebar.jsx - Barra lateral de navegacion principal de CorpHR.
 *
 * Contiene:
 *  - Logo y nombre de la aplicacion
 *  - Menu de navegacion filtrado por rol del usuario
 *  - Indicador de ruta activa
 *  - Seccion inferior con avatar, nombre e informacion del usuario
 *  - Boton de cierre de sesion
 */
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from '../../stores/useToastStore';

/* -- Iconos SVG inline (sin dependencias externas) -- */
const IcoDashboard  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>;
const IcoBriefcase  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="12"/></svg>;
const IcoBuilding   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M9 9h1m-1 4h1m4-4h1m-1 4h1"/></svg>;
const IcoCalendar   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoChart      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcoUser       = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoClock      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 15.5"/></svg>;
const IcoLogout     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IcoUserPlus   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>;
const IcoDownload   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

/* -- Definicion de los items de navegacion por seccion -- */
const navAdmin = [
  { to: '/app/dashboard',         label: 'Dashboard',           Icon: IcoDashboard },
  { to: '/app/empleados',         label: 'Empleados',           Icon: IcoUser      },
  { to: '/app/posiciones',        label: 'Posiciones',          Icon: IcoBriefcase },
  { to: '/app/departamentos',     label: 'Departamentos',       Icon: IcoBuilding  },
  { to: '/app/asistencia',        label: 'Asistencia',          Icon: IcoCalendar  },
  { to: '/app/reportes',          label: 'Reportes',            Icon: IcoChart     },
  { to: '/app/generar-reportes',  label: 'Generar Reportes',    Icon: IcoDownload  },
  { to: '/app/registro',          label: 'Registrar usuario',   Icon: IcoUserPlus  },
];

const navEmpleado = [
  { to: '/app/mi-perfil',     label: 'Mi Perfil',     Icon: IcoUser  },
  { to: '/app/mi-asistencia', label: 'Mi Asistencia', Icon: IcoClock },
];

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const { user, logout, esAdmin } = useAuth();
  const navigate = useNavigate();

  /* Obtener las iniciales del nombre para el avatar */
  const iniciales = user?.name
    ? user.name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
    : '?';

  /* Manejar el cierre de sesion con redireccion al login */
  const manejarLogout = async () => {
    await logout();
    toast.info('Sesion cerrada', 'Hasta pronto.');
    onClose();
    navigate('/login', { replace: true });
  };

  /* Seleccionar el menu segun el rol */
  const items = esAdmin() ? navAdmin : navEmpleado;

  return (
    <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`}>

      {/* -- Logo y nombre de la aplicacion -- */}
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <span className="sidebar__logo-mark">C</span>
        </div>
        <div className="sidebar__brand-text">
          <span className="sidebar__brand-name">CorpHR</span>
          <span className="sidebar__brand-sub">Sistema de RRHH</span>
        </div>
      </div>

      {/* -- Etiqueta de seccion -- */}
      <p className="sidebar__section-label">
        {esAdmin() ? 'Administracion' : 'Mi Espacio'}
      </p>

      {/* -- Menu de navegacion -- */}
      <nav className="sidebar__nav">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            /* React Router anade la clase 'active' automaticamente */
            className={({ isActive }) =>
              `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
            }
          >
            {/* Icono de la ruta */}
            <span className="sidebar__link-icon"><item.Icon /></span>
            {/* Etiqueta de la ruta */}
            <span className="sidebar__link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Separador entre el menu y el pie */}
      <div className="sidebar__spacer" />

      {/* -- Pie del sidebar: info del usuario + logout -- */}
      <div className="sidebar__footer">
        {/* Avatar con iniciales */}
        <div className="sidebar__avatar">{iniciales}</div>

        {/* Nombre y rol del usuario */}
        <div className="sidebar__user-info">
          <span className="sidebar__user-name">{user?.name || 'Usuario'}</span>
          <span className="sidebar__user-role">
            {user?.role === 'admin' ? 'Administrador' : 'Empleado'}
          </span>
        </div>

        {/* Boton de cierre de sesion */}
        <button
          className="sidebar__logout"
          onClick={manejarLogout}
          title="Cerrar sesion"
          aria-label="Cerrar sesion"
        >
          <IcoLogout />
        </button>
      </div>
    </aside>
  );
}
