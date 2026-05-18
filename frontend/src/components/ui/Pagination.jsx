/**
 * Pagination — componente reutilizable.
 *
 * Props:
 *   page      number  — página actual (1-based)
 *   total     number  — total de ítems
 *   pageSize  number  — ítems por página
 *   onChange  fn      — callback(nuevaPagina: number)
 */
export default function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const go = (p) => {
    const clamped = Math.max(1, Math.min(totalPages, p));
    if (clamped !== page) onChange(clamped);
  };

  /* Números a mostrar (con elipsis) */
  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else if (page <= 4) {
    pages.push(1, 2, 3, 4, 5, '…', totalPages);
  } else if (page >= totalPages - 3) {
    pages.push(1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
  } else {
    pages.push(1, '…', page - 1, page, page + 1, '…', totalPages);
  }

  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  return (
    <div className="pagination">
      <span className="pagination__info">{from}–{to} de {total}</span>
      <button
        className="pagination__btn"
        onClick={() => go(page - 1)}
        disabled={page === 1}
        aria-label="Página anterior"
      >‹</button>
      {pages.map((p, i) =>
        p === '…'
          ? <span key={`e${i}`} className="pagination__ellipsis">…</span>
          : (
            <button
              key={p}
              className={`pagination__btn${p === page ? ' pagination__btn--active' : ''}`}
              onClick={() => go(p)}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          )
      )}
      <button
        className="pagination__btn"
        onClick={() => go(page + 1)}
        disabled={page === totalPages}
        aria-label="Página siguiente"
      >›</button>
    </div>
  );
}
