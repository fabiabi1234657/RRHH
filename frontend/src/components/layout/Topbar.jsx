/**
 * Topbar.jsx ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Barra superior fija de CorpHR.
 *
 * Muestra el titulo y subtitulo de la pagina actual
 * junto al toggle de tema (oscuro/claro) y la fecha del dia.
 */
import { useLocation } from 'react-router-dom';
import { useAuth }     from '../../hooks/useAuth';
import ThemeToggle     from '../ui/ThemeToggle';

/* -- Mapa ruta ? { titulo, subtitulo } -- */
const TITULOS = {
  '/app/dashboard':     { titulo: 'Dashboard',      subtitulo: 'Resumen general del sistema' },
  '/app/posiciones':    { titulo: 'Posiciones',      subtitulo: 'GestiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n de cargos y roles organizacionales' },
  '/app/departamentos': { titulo: 'Departamentos',   subtitulo: 'Estructura organizativa de la empresa' },
  '/app/asistencia':    { titulo: 'Asistencia',      subtitulo: 'Control y seguimiento de asistencia' },
  '/app/reportes':      { titulo: 'Reportes',        subtitulo: 'Informes y estadisticas del sistema' },
  '/app/generar-reportes': { titulo: 'Generar Reportes', subtitulo: 'Exportar datos en PDF y Excel' },
  '/app/registro':      { titulo: 'Registrar usuario', subtitulo: 'Alta de cuentas y permisos de acceso' },
  '/app/mi-perfil':     { titulo: 'Mi Perfil',       subtitulo: 'InformaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n personal y de cuenta' },
  '/app/mi-asistencia': { titulo: 'Mi Asistencia',   subtitulo: 'Historial personal de asistencia' },
};

/* Formatear la fecha actual en espanol */
function obtenerFechaFormateada() {
  return new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
    year:    'numeric',
  });
}

/* Coloca la primera letra en mayuscula */
function capitalizar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const IcoMenu = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;

export default function Topbar({ onMenuClick = () => {} }) {
  const { pathname } = useLocation();
  const { user }  = useAuth();

  /* Obtener el titulo de la pagina actual o un fallback */
  const { titulo, subtitulo } = TITULOS[pathname] || { titulo: 'CorpHR', subtitulo: '' };

  /* Saludo segun la hora del dia */
  const hora = new Date().getHours();
  const saludo =
    hora < 12 ? 'Buenos dias' :
    hora < 18 ? 'Buenas tardes' :
    'Buenas noches';

  return (
    <header className="topbar">

      <button
        type="button"
        className="topbar__menu"
        onClick={onMenuClick}
        aria-label="Abrir menu lateral"
      >
        <IcoMenu />
      </button>

      {/* -- Lado izquierdo: titulo y subtitulo de la pagina -- */}
      <div className="topbar__page">
        <h1 className="topbar__title">{titulo}</h1>
        {subtitulo && (
          <p className="topbar__subtitle">{subtitulo}</p>
        )}
      </div>

      {/* -- Lado derecho: saludo, fecha y toggle de tema -- */}
      <div className="topbar__right">

        {/* Bloque de saludo al usuario */}
        <div className="topbar__greeting">
          <span className="topbar__greeting-text">
            {saludo}, <strong>{user?.name?.split(' ')[0] || 'Usuario'}</strong>
          </span>
          <span className="topbar__date">
            {capitalizar(obtenerFechaFormateada())}
          </span>
        </div>

        {/* Separador visual */}
        <div className="topbar__sep" />

        {/* Componente de alternancia de tema */}
        <ThemeToggle />
      </div>
    </header>
  );
}