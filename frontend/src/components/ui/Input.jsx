/**
 * Input.jsx — Campo de formulario reutilizable de CorpHR.
 * Usa las clases del design system (.field__*) definidas en globals.css.
 */
export default function Input({ label, error, className = '', id, ...props }) {
  const inputId = id || props.name;

  return (
    <div className="field">
      {label && (
        <label htmlFor={inputId} className="field__label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`field__input ${className}`.trim()}
        {...props}
      />
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}
