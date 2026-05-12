/**
 * Badge.jsx ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Etiqueta de estado tipo pill para CorpHR.
 *
 * Props:
 *   texto  string ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â texto a mostrar
 *   tipo   'green'|'blue'|'orange'|'red'|'purple'|'gray'
 *   dot    boolean ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â mostrar punto de estado al inicio
 */

export default function Badge({ texto, tipo = 'gray', dot = false }) {
  return (
    /* La clase dinamica determina el color del badge */
    <span className={`badge badge--${tipo}`}>
      {/* Punto opcional de estado */}
      {dot && <span className="badge__dot" aria-hidden="true" />}
      {texto}
    </span>
  );
}