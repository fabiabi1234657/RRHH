/**
 * StatCard.jsx ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Tarjeta de estadistica/metrica para el Dashboard.
 *
 * Props:
 *   icono    ReactNode|string ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â icono o emoji del indicador
 *   valor    string|number    ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â valor principal de la metrica
 *   etiqueta string           ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â descripcion del indicador
 *   color    'blue'|'green'|'orange'|'red'|'purple'
 */

export default function StatCard({ icono, valor, etiqueta, color = 'blue', titulo }) {
  return (
    /* La clase de color controla el esquema de colores de la tarjeta */
    <div className={`stat-card stat-card--${color}`}>

      {/* -- Fila superior: icono + valor -- */}
      <div className="stat-card__top">
        {/* Icono del indicador con fondo suave */}
        <div className="stat-card__icon-wrap">
          <span className="stat-card__icon">{icono}</span>
        </div>

        {/* Valor numerico principal */}
        <span className="stat-card__value" title={titulo ?? (typeof valor === 'string' ? valor : undefined)}>{valor}</span>
      </div>

      {/* -- Etiqueta descriptiva del indicador -- */}
      <p className="stat-card__label">{etiqueta}</p>

      {/* Linea de acento en la parte inferior de la tarjeta */}
      <div className="stat-card__accent-line" />
    </div>
  );
}