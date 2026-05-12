/**
 * Alert.jsx ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Componente de alerta / mensaje de estado.
 *
 * Reemplaza el uso de <div className="alert alert--X"> con un
 * componente consistente que incluye icono SVG, texto y boton
 * de cierre opcional. Sigue el sistema de diseno de CorpHR.
 *
 * Props:
 *  - tipo     : 'error' | 'success' | 'warning' | 'info'  (default: 'error')
 *  - titulo   : string (opcional) ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â linea en negrita arriba del mensaje
 *  - children : contenido / mensaje a mostrar
 *  - onCerrar : funcion (opcional) ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â muestra boton X para descartar
 *  - className: clases adicionales
 */


/* -- Iconos SVG por tipo de alerta -- */
const iconos = {
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
};

/* -- Icono X para cerrar -- */
const IcoCerrar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function Alert({ tipo = 'error', titulo, children, onCerrar, className = '' }) {
  /* Clase CSS determinada por el tipo */
  const clase = `alert alert--${tipo} ${className}`.trim();

  return (
    <div className={clase} role="alert">
      {/* Icono del tipo de alerta */}
      <span className="alert__icono" aria-hidden="true">
        {iconos[tipo] ?? iconos.error}
      </span>

      {/* Cuerpo del mensaje */}
      <div className="alert__cuerpo">
        {titulo && <span className="alert__titulo">{titulo}</span>}
        <span className="alert__texto">{children}</span>
      </div>

      {/* Boton de cierre (opcional) */}
      {onCerrar && (
        <button className="alert__cerrar" onClick={onCerrar} aria-label="Cerrar aviso">
          <IcoCerrar />
        </button>
      )}
    </div>
  );
}