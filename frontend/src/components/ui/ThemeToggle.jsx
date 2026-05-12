/**
 * ThemeToggle.jsx ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Interruptor de tema oscuro/claro.
 *
 * Usa Zustand para alternar entre temas.
 */
import useTheme from '../../hooks/useTheme';

/* Icono del sol (tema claro) */
const IcoSun  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;

/* Icono de la luna (tema oscuro) */
const IcoMoon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    /* Boton accesible con rol de switch */
    <button
      className={`theme-toggle ${isDark ? 'theme-toggle--dark' : 'theme-toggle--light'}`}
      onClick={toggleTheme}
      aria-label={isDark ? 'Activar tema claro' : 'Activar tema oscuro'}
      title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
    >
      {/* Pista de fondo del toggle */}
      <span className="theme-toggle__track">
        {/* Perilla deslizante con el icono dinamico */}
        <span className="theme-toggle__thumb">
          {isDark ? <IcoMoon /> : <IcoSun />}
        </span>
      </span>
    </button>
  );
}
