/**
 * Avatar.jsx ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Avatar circular con iniciales para CorpHR.
 *
 * Props:
 *   iniciales  string ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â 1-2 letras a mostrar
 *   size       'xs'|'sm'|'md'|'lg'|'xl'
 *   gradiente  string ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â clase CSS para el gradiente de fondo
 */

/* Gradientes predefinidos para asignar a usuarios */
const GRADIENTES = [
  'linear-gradient(135deg,#0F9F90,#0B7E73)',
  'linear-gradient(135deg,#2563EB,#0EA5E9)',
  'linear-gradient(135deg,#EA580C,#F97316)',
  'linear-gradient(135deg,#7C3AED,#A78BFA)',
  'linear-gradient(135deg,#334155,#475569)',
];

/**
 * Selecciona un gradiente determinista basado en las iniciales.
 * Esto garantiza que el mismo usuario siempre tenga el mismo color.
 */
function obtenerGradiente(iniciales) {
  const codigo = (iniciales || 'U').charCodeAt(0);
  return GRADIENTES[codigo % GRADIENTES.length];
}

export default function Avatar({ iniciales = '?', size = 'md' }) {
  /* Color de fondo basado en las iniciales del usuario */
  const gradient = obtenerGradiente(iniciales);

  return (
    <span
      className={`avatar avatar--${size}`}
      style={{ background: gradient }}
      aria-label={`Avatar de ${iniciales}`}
    >
      {initials(iniciales)}
    </span>
  );
}

/* Asegurar que se muestran maximo 2 letras */
function initials(str) {
  return (str || '?').slice(0, 2).toUpperCase();
}