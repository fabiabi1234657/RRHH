import { useCallback, useEffect, useMemo, useState } from 'react';
import { obtenerReporteAsistenciaMensualAPI, obtenerReporteHeadcountAPI, obtenerTendenciaAsistenciaAPI } from '../services/api';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import {
  BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const IcoRefresh = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/></svg>;

function ReportMetric({ label, value, hint, tone }) {
  return <div className={`report-metric report-metric--${tone}`}><span className="report-metric__label">{label}</span><strong className="report-metric__value">{value}</strong><span className="report-metric__hint">{hint}</span></div>;
}

export default function Reports() {
  const actual = new Date();
  const [month, setMonth] = useState(actual.getMonth() + 1);
  const [year, setYear] = useState(actual.getFullYear());
  const [monthly, setMonthly] = useState([]);
  const [headcount, setHeadcount] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [trend, setTrend] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const [monthlyResp, headcountResp] = await Promise.all([
        obtenerReporteAsistenciaMensualAPI({ month, year }),
        obtenerReporteHeadcountAPI(),
      ]);
      setMonthly(monthlyResp.data ?? []);
      setHeadcount(headcountResp.departments ?? []);
      setTotalEmployees(headcountResp.totalEmployees ?? monthlyResp.totalEmployees ?? 0);
    } catch (err) {
      setError(err.message || 'No fue posible cargar los reportes.');
    } finally {
      setCargando(false);
    }
  }, [month, year]);

  useEffect(() => { void Promise.resolve().then(cargar); }, [cargar]);

  // Tendencia mensual — se carga una sola vez (no depende del selector de mes/año)
  useEffect(() => {
    obtenerTendenciaAsistenciaAPI(5)
      .then(r => setTrend(r.trend ?? []))
      .catch(() => {});
  }, []);

  const totales = useMemo(() => monthly.reduce((acc, item) => ({
    present:   acc.present   + item.present,
    late:      acc.late      + item.late,
    absent:    acc.absent    + item.absent,
    justified: acc.justified + (item.justified ?? 0),
    totalDays: acc.totalDays + item.totalDays,
  }), { present: 0, late: 0, absent: 0, justified: 0, totalDays: 0 }), [monthly]);

  const distData = useMemo(() => [
    { name: 'Presente',    value: totales.present,   color: '#10B981' },
    { name: 'Tarde',       value: totales.late,      color: '#F59E0B' },
    { name: 'Ausente',     value: totales.absent,    color: '#EF4444' },
    { name: 'Justificado', value: totales.justified, color: '#38BDF8' },
  ].filter(d => d.value > 0), [totales]);

  const TT_STYLE = { background: '#1A2238', border: '1px solid #2A3450', borderRadius: 8, color: '#F1F5F9', fontSize: 12 };

  const cumplimiento = totales.totalDays ? Math.round(((totales.present + totales.late) / totales.totalDays) * 100) : 0;
  const maxHeadcount = Math.max(...headcount.map((item) => item.headcount), 1);

  return (
    <div className="reports-page">
      <div className="page-header page-header--panel">
        <div className="page-header__left">
          <h1 className="page-header__title">Indicadores del periodo</h1>
          <p className="page-header__desc">Seguimiento de personas y asistencia.</p>
        </div>
        <div className="reports-controls">
          <select className="field__input field__select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>{MESES.map((mes, index) => <option key={mes} value={index + 1}>{mes}</option>)}</select>
          <input className="field__input reports-controls__year" type="number" min="2020" value={year} onChange={(e) => setYear(Number(e.target.value))} />
          <Button variante="secondary" icono={<IcoRefresh />} onClick={cargar} cargando={cargando}>Actualizar</Button>
        </div>
      </div>

      {error && <Alert tipo="error" onCerrar={() => setError('')}>{error}</Alert>}

      <section className="reports-metrics">
        <ReportMetric label="Headcount" value={totalEmployees} hint="empleados activos" tone="blue" />
        <ReportMetric label="Asistencias" value={totales.present} hint="registros puntuales" tone="green" />
        <ReportMetric label="Tardanzas" value={totales.late} hint="llegadas tarde" tone="orange" />
        <ReportMetric label="Cumplimiento" value={`${cumplimiento}%`} hint={`${MESES[month - 1]} ${year}`} tone="purple" />
      </section>

      <div className="reports-layout">
        <section className="card">
          <div className="card__header"><div className="card__header-left"><h3 className="card__title">Asistencia mensual</h3><span className="card__count">{monthly.length} empleados incluidos</span></div><Badge texto={`${MESES[month - 1]} ${year}`} tipo="blue" /></div>
          {cargando ? <div className="dept-skeleton">{[1, 2, 3, 4].map((item) => <div key={item} className="dept-skeleton__row"><div className="skeleton" style={{ width: '70%', height: 14 }} /></div>)}</div> : (
            <div className="table-wrap"><table className="table"><thead><tr><th>Empleado</th><th>Area</th><th>Presente</th><th>Tarde</th><th>Ausente</th></tr></thead><tbody>{monthly.map((item) => <tr key={item.employeeId}><td><span className="table__primary">{item.name}</span><span className="table__secondary">{item.email}</span></td><td><span className="table__primary">{item.department}</span><span className="table__secondary">{item.position}</span></td><td><Badge texto={String(item.present)} tipo="green" /></td><td><Badge texto={String(item.late)} tipo="orange" /></td><td><Badge texto={String(item.absent)} tipo="red" /></td></tr>)}</tbody></table></div>
          )}
        </section>

        <section className="card">
          <div className="card__header"><div className="card__header-left"><h3 className="card__title">Distribución por departamento</h3><span className="card__count">{headcount.length} áreas con personal activo</span></div></div>
          <div className="headcount-list">{headcount.map((item) => <div key={item.departmentId} className="headcount-item"><div className="headcount-item__row"><span className="headcount-item__name">{item.departmentName}</span><strong>{item.headcount}</strong></div><div className="headcount-item__track"><span style={{ width: `${(item.headcount / maxHeadcount) * 100}%` }} /></div></div>)}</div>
        </section>
      </div>

      {/* ── Gráficas analíticas ── */}
      <div className="reports-charts">
        <div className="chart-row">

          {/* Gráfica 1: Bar apilada — tendencia mensual de asistencia */}
          <div className="card chart-card">
            <div className="card__header">
              <div className="card__header-left">
                <h3 className="card__title">Tendencia mensual</h3>
                <span className="card__count">últimos {trend.length} meses</span>
              </div>
            </div>
            <div className="chart-card__body">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A3450" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: '#94A3B8', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={TT_STYLE} itemStyle={{ color: '#CBD5E1' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94A3B8' }} />
                  <Bar dataKey="present"   name="Presente"    stackId="a" fill="#10B981" />
                  <Bar dataKey="late"      name="Tardanza"    stackId="a" fill="#F59E0B" />
                  <Bar dataKey="absent"    name="Ausente"     stackId="a" fill="#EF4444" />
                  <Bar dataKey="justified" name="Justificado" stackId="a" fill="#38BDF8" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfica 2: Donut — distribución de asistencia del mes seleccionado */}
          <div className="card chart-card">
            <div className="card__header">
              <div className="card__header-left">
                <h3 className="card__title">Distribución del periodo</h3>
                <span className="card__count">{MESES[month - 1]} {year}</span>
              </div>
            </div>
            <div className="chart-card__body">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distData} cx="50%" cy="50%"
                    innerRadius="52%" outerRadius="74%"
                    dataKey="value" nameKey="name" paddingAngle={3}
                  >
                    {distData.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
                  </Pie>
                  <Tooltip contentStyle={TT_STYLE} itemStyle={{ color: '#CBD5E1' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94A3B8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
        <div className="chart-row">

          {/* Gráfica 3: Bar vertical — headcount por departamento */}
          <div className="card chart-card">
            <div className="card__header">
              <div className="card__header-left">
                <h3 className="card__title">Headcount por departamento</h3>
                <span className="card__count">{headcount.length} áreas con personal</span>
              </div>
            </div>
            <div className="chart-card__body">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={headcount.map(d => ({ name: d.departmentName.length > 10 ? d.departmentName.slice(0,9)+'…' : d.departmentName, value: d.headcount }))}
                  margin={{ left: 0, right: 8, top: 8, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A3450" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={TT_STYLE} itemStyle={{ color: '#CBD5E1' }} formatter={v => [v, 'Empleados']} />
                  <Bar dataKey="value" name="Empleados" fill="#A855F7" radius={[4,4,0,0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfica 4: Area — tasa de cumplimiento mensual */}
          <div className="card chart-card">
            <div className="card__header">
              <div className="card__header-left">
                <h3 className="card__title">Tasa de cumplimiento</h3>
                <span className="card__count">presentes + justificados / total</span>
              </div>
            </div>
            <div className="chart-card__body">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A3450" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: '#94A3B8', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={TT_STYLE} itemStyle={{ color: '#CBD5E1' }} formatter={v => [`${v}%`, 'Cumplimiento']} />
                  <Area type="monotone" dataKey="rate" name="Cumplimiento" stroke="#6366F1" strokeWidth={2.5} fill="url(#rateGrad)" dot={{ fill: '#6366F1', r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}