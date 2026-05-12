import { useCallback, useEffect, useMemo, useState } from 'react';
import { obtenerMiAsistenciaAPI, registrarEntradaAPI, registrarSalidaAPI } from '../services/api';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const IcoIn = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/></svg>;
const IcoOut = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>;

const estadoMeta = {
  present: { label: 'Presente', tipo: 'green' },
  late: { label: 'Tarde', tipo: 'orange' },
  absent: { label: 'Ausente', tipo: 'red' },
};

const fechaKey = (value) => new Date(value).toISOString().slice(0, 10);
const hoyKey = () => fechaKey(new Date());
const hora = (value) => value ? new Date(value).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '--';

function MetricCard({ label, value, tone }) {
  return <div className={`attend-metric attend-metric--${tone}`}><span className="attend-metric__value">{value}</span><span className="attend-metric__label">{label}</span></div>;
}

export default function MyAttendance() {
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [accionando, setAccionando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const data = await obtenerMiAsistenciaAPI();
      setEmployee(data.employee ?? null);
      setAttendance(data.attendance ?? []);
    } catch (err) {
      setError(err.message || 'No fue posible cargar tu asistencia.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { void Promise.resolve().then(cargar); }, [cargar]);

  const todayRecord = useMemo(() => attendance.find((item) => fechaKey(item.date) === hoyKey()), [attendance]);
  const resumen = useMemo(() => attendance.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, { present: 0, late: 0, absent: 0 }), [attendance]);

  const registrarEntrada = async () => {
    setAccionando(true); setError(''); setExito('');
    try { await registrarEntradaAPI(); setExito('Entrada registrada correctamente.'); await cargar(); }
    catch (err) { setError(err.message || 'No fue posible registrar la entrada.'); }
    finally { setAccionando(false); }
  };

  const registrarSalida = async () => {
    setAccionando(true); setError(''); setExito('');
    try { await registrarSalidaAPI(); setExito('Salida registrada correctamente.'); await cargar(); }
    catch (err) { setError(err.message || 'No fue posible registrar la salida.'); }
    finally { setAccionando(false); }
  };

  const statusMeta = estadoMeta[todayRecord?.status] ?? { label: 'Pendiente', tipo: 'gray' };

  return (
    <div className="my-attendance-page">
      <div className="page-header page-header--panel"><div className="page-header__left"><h1 className="page-header__title">Mi Asistencia</h1><p className="page-header__desc">Registro personal de entradas, salidas y estado diario.</p></div></div>
      {error && <Alert tipo="error" onCerrar={() => setError('')}>{error}</Alert>}
      {exito && <Alert tipo="success" onCerrar={() => setExito('')}>{exito}</Alert>}

      <section className="my-attendance-hero card">
        <div><span className="my-attendance-hero__eyebrow">Jornada de hoy</span><h2>{employee?.userId?.name ?? 'Perfil de empleado'}</h2><p>{employee?.department?.name ?? 'Sin departamento'} - {employee?.position?.title ?? 'Sin cargo'}</p></div>
        <div className="my-attendance-hero__status"><Badge texto={statusMeta.label} tipo={statusMeta.tipo} dot /><span>Entrada: {hora(todayRecord?.checkIn)}</span><span>Salida: {hora(todayRecord?.checkOut)}</span></div>
        <div className="my-attendance-hero__actions"><Button icono={<IcoIn />} onClick={registrarEntrada} cargando={accionando} disabled={!!todayRecord?.checkIn}>Registrar entrada</Button><Button variante="secondary" icono={<IcoOut />} onClick={registrarSalida} cargando={accionando} disabled={!todayRecord?.checkIn || !!todayRecord?.checkOut}>Registrar salida</Button></div>
      </section>

      <section className="attend-metrics"><MetricCard label="Presentes" value={resumen.present} tone="green" /><MetricCard label="Tardanzas" value={resumen.late} tone="orange" /><MetricCard label="Ausencias" value={resumen.absent} tone="red" /><MetricCard label="Registros" value={attendance.length} tone="blue" /></section>

      <section className="card">
        <div className="card__header"><div className="card__header-left"><h3 className="card__title">Historial reciente</h3><span className="card__count">{attendance.length} registros cargados</span></div></div>
        {cargando ? <div className="dept-skeleton">{[1, 2, 3, 4].map((item) => <div key={item} className="dept-skeleton__row"><div className="skeleton" style={{ width: '70%', height: 14 }} /></div>)}</div> : (
          <div className="table-wrap"><table className="table"><thead><tr><th>Fecha</th><th>Estado</th><th>Entrada</th><th>Salida</th></tr></thead><tbody>{attendance.map((item) => { const meta = estadoMeta[item.status] ?? estadoMeta.present; return <tr key={item._id}><td><span className="table__primary">{new Date(item.date).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })}</span><span className="table__secondary">{new Date(item.date).getFullYear()}</span></td><td><Badge texto={meta.label} tipo={meta.tipo} dot /></td><td><span className="table__mono">{hora(item.checkIn)}</span></td><td><span className="table__mono">{hora(item.checkOut)}</span></td></tr>; })}</tbody></table></div>
        )}
      </section>
    </div>
  );
}