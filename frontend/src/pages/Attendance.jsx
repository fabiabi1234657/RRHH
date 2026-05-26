import { useCallback, useEffect, useMemo, useState } from 'react';
import { obtenerAsistenciaPorFechaAPI, obtenerEmpleadosAPI } from '../services/api';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const IcoRefresh = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/></svg>;

const estadoMeta = {
  present: { label: 'Presente', tipo: 'green' },
  late: { label: 'Tarde', tipo: 'orange' },
  absent: { label: 'Ausente', tipo: 'red' },
  missing: { label: 'Sin registro', tipo: 'gray' },
};

const fechaInput = (date = new Date()) => date.toISOString().slice(0, 10);
const hora = (value) => value ? new Date(value).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '--';
const nombreEmpleado = (employee) => employee?.userId?.name ?? 'Empleado sin usuario';
const emailEmpleado = (employee) => employee?.userId?.email ?? '--';
const cargoEmpleado = (employee) => employee?.position?.title ?? 'Sin cargo';
const deptoEmpleado = (employee) => employee?.department?.name ?? 'Sin departamento';

function MetricCard({ label, value, tone }) {
  return (
    <div className={`attend-metric attend-metric--${tone}`}>
      <span className="attend-metric__value">{value}</span>
      <span className="attend-metric__label">{label}</span>
    </div>
  );
}

export default function Attendance() {
  const [fecha, setFecha] = useState(fechaInput());
  const [empleados, setEmpleados] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [pagina, setPagina] = useState(1);

  const ATT_PAGE = 25;

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const [empleadosResp, asistenciaResp] = await Promise.all([
        obtenerEmpleadosAPI(),
        obtenerAsistenciaPorFechaAPI(fecha),
      ]);
      setEmpleados(empleadosResp.employees ?? []);
      setAsistencias(asistenciaResp.attendance ?? []);
    } catch (err) {
      setError(err.message || 'No fue posible cargar la asistencia.');
    } finally {
      setCargando(false);
    }
  }, [fecha]);

  useEffect(() => {
    void Promise.resolve().then(cargar);
  }, [cargar]);

  const asistenciasPorEmpleado = useMemo(() => new Map(
    asistencias.map((registro) => [registro.employeeId?._id ?? registro.employeeId, registro])
  ), [asistencias]);

  const filas = useMemo(() => empleados.map((empleado) => ({
    empleado,
    registro: asistenciasPorEmpleado.get(empleado._id),
  })), [empleados, asistenciasPorEmpleado]);

  const pagFilas = filas.slice((pagina - 1) * ATT_PAGE, pagina * ATT_PAGE);

  const resumen = useMemo(() => {
    const base = { present: 0, late: 0, absent: 0, missing: 0 };
    for (const fila of filas) {
      const estado = fila.registro?.status ?? 'missing';
      base[estado] = (base[estado] ?? 0) + 1;
    }
    return base;
  }, [filas]);

  const TT_STYLE = { background: '#1A2238', border: '1px solid #2A3450', borderRadius: 8, color: '#F1F5F9', fontSize: 12 };
  const pieData = useMemo(() => [
    { name: 'Presentes',    value: resumen.present,  color: '#10B981' },
    { name: 'Tardanzas',    value: resumen.late,     color: '#F59E0B' },
    { name: 'Ausentes',     value: resumen.absent,   color: '#EF4444' },
    { name: 'Sin registro', value: resumen.missing,  color: '#6366F1' },
  ].filter(d => d.value > 0), [resumen]);

  return (
    <div className="attendance-page">
      <div className="page-header page-header--panel">
        <div className="page-header__left">
          <h1 className="page-header__title">Jornada del día</h1>
          <p className="page-header__desc">Seguimiento diario del personal activo.</p>
        </div>
        <div className="attendance-actions">
          <label htmlFor="attendance-date" className="sr-only">Fecha</label>
          <input id="attendance-date" className="field__input attendance-actions__date" type="date" value={fecha} onChange={(event) => { setFecha(event.target.value); setPagina(1); }} />
          <Button variante="secondary" icono={<IcoRefresh />} onClick={cargar} cargando={cargando}>Actualizar</Button>
        </div>
      </div>

      {error && <Alert tipo="error" onCerrar={() => setError('')}>{error}</Alert>}

      <section className="attend-metrics">
        <MetricCard label="Presentes" value={resumen.present} tone="green" />
        <MetricCard label="Llegadas tarde" value={resumen.late} tone="orange" />
        <MetricCard label="Ausentes" value={resumen.absent} tone="red" />
        <MetricCard label="Sin registro" value={resumen.missing} tone="blue" />
      </section>

      {/* Distribución visual del día */}
      {!cargando && pieData.length > 0 && (
        <div className="chart-row--single">
          <div className="card chart-card">
            <div className="card__header">
              <div className="card__header-left">
                <h2 className="card__title">Distribución del día</h2>
                <span className="card__count">
                  {new Date(`${fecha}T00:00:00`).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
            </div>
            <div className="chart-card__body--sm" style={{ height: 210, padding: '12px 4px 8px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData} cx="50%" cy="50%"
                    innerRadius="48%" outerRadius="72%"
                    dataKey="value" nameKey="name" paddingAngle={3}
                  >
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
                  </Pie>
                  <Tooltip contentStyle={TT_STYLE} itemStyle={{ color: '#CBD5E1' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94A3B8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <section className="card attendance-card">
        <div className="card__header">
          <div className="card__header-left">
            <h2 className="card__title">Registro del dia</h2>
            <span className="card__count">{filas.length} empleados evaluados</span>
          </div>
          <span className="attendance-date-label">
            {new Date(`${fecha}T00:00:00`).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>

        {cargando ? (
          <div className="dept-skeleton">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="dept-skeleton__row">
                <div className="skeleton" style={{ width: '34%', height: 14 }} />
                <div className="skeleton" style={{ width: '58%', height: 12, marginTop: 7 }} />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Area</th>
                  <th>Estado</th>
                  <th>Entrada</th>
                  <th>Salida</th>
                </tr>
              </thead>
              <tbody>
                {pagFilas.map(({ empleado, registro }) => {
                  const meta = estadoMeta[registro?.status ?? 'missing'];
                  return (
                    <tr key={empleado._id}>
                      <td><span className="table__primary">{nombreEmpleado(empleado)}</span><span className="table__secondary">{emailEmpleado(empleado)}</span></td>
                      <td><span className="table__primary">{deptoEmpleado(empleado)}</span><span className="table__secondary">{cargoEmpleado(empleado)}</span></td>
                      <td><Badge texto={meta.label} tipo={meta.tipo} dot /></td>
                      <td><span className="table__mono">{hora(registro?.checkIn)}</span></td>
                      <td><span className="table__mono">{hora(registro?.checkOut)}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            page={pagina}
            total={filas.length}
            pageSize={ATT_PAGE}
            onChange={setPagina}
          />
          </>
        )}
      </section>
    </div>
  );
}