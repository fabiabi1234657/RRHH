/**
 * Modal.jsx ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Ventana modal reutilizable de CorpHR.
 *
 * Props:
 *   titulo    string  ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â titulo del encabezado
 *   onClose   fn      ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â callback al cerrar (X o backdrop o Escape)
 *   children  node    ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â contenido del cuerpo del modal
 *   ancho     string  ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â CSS max-width (default: '520px')
 *   footer    node    ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â contenido del pie del modal (botones)
 */
import { useEffect } from 'react';

export default function Modal({
  titulo,
  onClose,
  children,
  ancho  = '520px',
  footer = null,
}) {
  /* -- Cerrar con la tecla Escape -- */
  useEffect(() => {
    const manejarTecla = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', manejarTecla);

    /* Bloquear el scroll del body mientras el modal esta abierto */
    document.body.style.overflow = 'hidden';

    /* Limpiar al desmontar el modal */
    return () => {
      document.removeEventListener('keydown', manejarTecla);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    /* Fondo oscuro semitransparente ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â click fuera cierra el modal */
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">

      {/* Contenedor del modal ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â stopPropagation evita cierre al hacer click adentro */}
      <div
        className="modal"
        style={{ maxWidth: ancho }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* -- Encabezado del modal -- */}
        <div className="modal__header">
          <h2 className="modal__title">{titulo}</h2>

          {/* Boton de cierre */}
          <button
            className="modal__close"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            {/* Icono X en SVG */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* -- Cuerpo del modal: contenido dinamico -- */}
        <div className="modal__body">
          {children}
        </div>

        {/* -- Pie del modal con botones de accion (opcional) -- */}
        {footer && (
          <div className="modal__footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}