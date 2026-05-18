import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from './Badge';
import Pagination from './Pagination';
import { obtenerAlertasAPI } from '../../services/api';

const ALERT_PAGE = 5;

const SEVERITY_LABEL = {
  expired: 'Vencido',
  critical: 'Crítico',
  warning: 'Advertencia',
  info: 'Próximo',
};
const SEVERITY_TIPO = {
  expired: 'red',
  critical: 'orange',
  warning: 'yellow',
  info: 'blue',
};

const fechaCorta = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

const IcoBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const SECCIONES = [
  { key: 'contracts', label: 'Contratos', emptyText: 'Sin contratos por vencer.' },
  { key: 'trials', label: 'Períodos de prueba', emptyText: 'Sin periodos de prueba próximos.' },
  { key: 'policies', label: 'Habeas Data pendiente', emptyText: 'Todas las políticas firmadas.' },
];

export default function AlertsWidget({ days = 30 }) {
  const [alerts, setAlerts] = useState({ contracts: [], trials: [], policies: [] });
  const [totals, setTotals] = useState({ contracts: 0, trials: 0, policies: 0 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [paginas, setPaginas] = useState({ contracts: 1, trials: 1, policies: 1 });

  const irA = (key, p) => setPaginas(prev => ({ ...prev, [key]: p }));

  useEffect(() => {
    let mounted = true;
    obtenerAlertasAPI(days)
      .then((data) => {
        if (!mounted) return;
        setAlerts(data.alerts || { contracts: [], trials: [], policies: [] });
        setTotals(data.totals || { contracts: 0, trials: 0, policies: 0 });
      })
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setCargando(false));
    return () => { mounted = false; };
  }, [days]);

  const totalAlertas = totals.contracts + totals.trials + totals.policies;

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card__header">
        <div className="card__header-left">
          <h3 className="card__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IcoBell /> Alertas y vencimientos
          </h3>
          <span className="card__count">
            {cargando ? 'Cargando…' : `${totalAlertas} alertas en los próximos ${days} días`}
          </span>
        </div>
        <Link to="/app/empleados" className="card__action">Ir a empleados →</Link>
      </div>

      {error && (
        <div className="alert alert--error" style={{ margin: 12 }}>{error}</div>
      )}

      {!cargando && !error && totalAlertas === 0 && (
        <p style={{ padding: '16px 20px', fontSize: 13, color: 'var(--text2)' }}>
          No hay alertas activas en este momento.
        </p>
      )}

      {!cargando && !error && totalAlertas > 0 && (
        <div style={{ padding: '8px 16px 16px', display: 'grid', gap: 14 }}>
          {SECCIONES.map((sec) => {
            const lista = alerts[sec.key] || [];
            if (lista.length === 0) return null;
            return (
              <div key={sec.key}>
                <h4 style={{ margin: '4px 0 8px', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                  {sec.label} <span style={{ color: 'var(--text2)', fontWeight: 400 }}>({lista.length})</span>
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {lista.slice((paginas[sec.key] - 1) * ALERT_PAGE, paginas[sec.key] * ALERT_PAGE).map((a) => (
                    <li
                      key={`${sec.key}-${a.employeeId}`}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 12px', background: 'var(--bg2)', borderRadius: 8, fontSize: 13,
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 500 }}>{a.name || a.email}</span>
                        <span style={{ fontSize: 12, color: 'var(--text2)' }}>
                          {sec.key === 'policies'
                            ? 'Política Habeas Data pendiente de firma'
                            : `Vence ${fechaCorta(a.date)} · ${a.daysLeft < 0 ? `${Math.abs(a.daysLeft)} días atrasado` : `${a.daysLeft} días restantes`}`}
                        </span>
                      </div>
                      <Badge texto={SEVERITY_LABEL[a.severity] || a.severity} tipo={SEVERITY_TIPO[a.severity] || 'info'} />
                    </li>
                  ))}
                </ul>
                <Pagination
                  page={paginas[sec.key]}
                  total={lista.length}
                  pageSize={ALERT_PAGE}
                  onChange={(p) => irA(sec.key, p)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
