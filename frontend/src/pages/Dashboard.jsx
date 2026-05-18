/**
 * Dashboard.jsx - Panel principal del administrador.
 *
 * Obtiene datos reales del backend:
 *  - Departamentos  (GET /api/departamentos)
 *  - Posiciones/Cargos (GET /api/cargos)
 *  - Empleados      (GET /api/empleados)
 *
 * Muestra:
 *  - Banner de bienvenida con nombre del usuario y fecha
 *  - Tarjetas de metricas (StatCard)
 *  - Tabla con las 5 posiciones mas recientes
 *  - Lista de departamentos con conteo + barra de proporcion
 */
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCatalogStore } from '../stores/useCatalogStore';
import { obtenerEmpleadosAPI } from '../services/api';
import StatCard from '../components/ui/StatCard';
import Badge    from '../components/ui/Badge';
import AlertsWidget from '../components/ui/AlertsWidget';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

/* -- Formatear fecha larga -- */
const fmtFecha = () => new Intl.DateTimeFormat('es-CO', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
}).format(new Date());

/* -- Iconos SVG inline -- */
const IcoBuilding  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h1M9 13h1M9 17h1M14 9h1M14 13h1M14 17h1"/></svg>;
const IcoBriefcase = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2M8 7V5a2 2 0 0 1 4 0"/></svg>;
const IcoUsers     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoActivity  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;

export default function Dashboard() {
  const { user } = useAuth();
  const {
    departments: departamentos,
    positions: posiciones,
    loading: cargando,
    error,
    fetchCatalogs
  } = useCatalogStore();

  const [totalEmpleados, setTotalEmpleados] = useState(0);
  const [empleados, setEmpleados] = useState([]);
  const [errorLocal, setErrorLocal] = useState('');

  /* -- Cargar datos al montar el componente -- */
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [, rEmp] = await Promise.all([
          fetchCatalogs(),
          obtenerEmpleadosAPI()
        ]);
        const lista = rEmp.employees ?? rEmp ?? [];
        setEmpleados(lista);
        setTotalEmpleados(lista.length);
      } catch (err) {
        setErrorLocal(err.message || 'Error al cargar los datos');
      }
    };
    cargarDatos();
  }, [fetchCatalogs]);

  /* -- Calculos derivados -- */
  const recientes = [...posiciones].slice(0, 5);

  const deptosConConteo = departamentos.map(dep => ({
    ...dep,
    totalCargos: posiciones.filter(
      p => (typeof p.department === 'object' ? p.department?._id : p.department) === dep._id
    ).length,
  }));

  const maxCargos = Math.max(...deptosConConteo.map(d => d.totalCargos), 1);

  /* -- Datos para grаficas -- */
  const DEPT_COLORS = ['#6366F1','#A855F7','#06B6D4','#10B981','#F59E0B','#EF4444','#EC4899','#38BDF8','#8B5CF6','#F97316'];
  const TT_STYLE = { background: '#1A2238', border: '1px solid #2A3450', borderRadius: 8, color: '#F1F5F9', fontSize: 12 };

  const empsPorDept = useMemo(() => {
    const map = {};
    for (const emp of empleados) {
      if (emp.status !== 'active') continue;
      const name = typeof emp.department === 'object'
        ? (emp.department?.name ?? 'Sin área')
        : (departamentos.find(d => d._id === emp.department)?.name ?? 'Sin área');
      map[name] = (map[name] ?? 0) + 1;
    }
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [empleados, departamentos]);

  const salarioPorDept = useMemo(() => {
    const map = {};
    for (const pos of posiciones) {
      const name = typeof pos.department === 'object'
        ? (pos.department?.name ?? 'Sin área')
        : 'Sin área';
      if (!map[name]) map[name] = { total: 0, count: 0 };
      map[name].total += pos.salary ?? 0;
      map[name].count += 1;
    }
    return Object.entries(map)
      .map(([name, { total, count }]) => ({
        name: name.length > 13 ? name.slice(0, 12) + '…' : name,
        avg: count ? Math.round(total / count) : 0,
      }))
      .filter(d => d.avg > 0)
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 8);
  }, [posiciones]);

  /* Obtener primer nombre del usuario */
  const primerNombre = user?.name?.split(' ')[0] || 'Administrador';

  /* Mostrar skeleton mientras cargan los datos */
  if (cargando) {
    return (
      <div className="dash fade-in">
        <div className="dash__stats">
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton" style={{ height: 110, borderRadius: 'var(--radio)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dash fade-in">

      {/* -- Banner de bienvenida -- */}
      <div className="dash__welcome">
        <div className="dash__welcome-left">
          <p className="dash__welcome-caption">Panel de control</p>
          <h2 className="dash__welcome-title">Bienvenido, {primerNombre}</h2>
          <p className="dash__welcome-date">{fmtFecha()}</p>
        </div>
        <div className="dash__welcome-meta">
          <span className="dash__welcome-badge">
            <span className="dash__welcome-dot" />
            Sistema activo
          </span>
        </div>
      </div>

      {/* -- Mensaje de error -- */}
      {(error || errorLocal) && (
        <div className="alert alert--error" style={{ marginBottom: 20 }}>{error || errorLocal}</div>
      )}

      {/* -- Tarjetas de estadisticas -- */}
      <div className="dash__stats">
        <StatCard
          icono={<IcoBuilding />}
          valor={departamentos.length}
          etiqueta="Departamentos activos"
          color="blue"
        />
        <StatCard
          icono={<IcoBriefcase />}
          valor={posiciones.length}
          etiqueta="Cargos registrados"
          color="green"
        />
        <StatCard
          icono={<IcoUsers />}
          valor={totalEmpleados}
          etiqueta="Empleados activos"
          color="orange"
        />
        <StatCard
          icono={<IcoActivity />}
          valor={departamentos.length > 0 ? `${Math.round((posiciones.length / Math.max(departamentos.length, 1)) * 10) / 10}` : '0'}
          etiqueta="Cargos por departamento"
          color="purple"
        />
      </div>

      {/* -- Widget de alertas (contratos / prueba / Habeas Data) -- */}
      <AlertsWidget days={30} />

      {/* -- Layout de dos columnas -- */}
      <div className="dash__cols">

        {/* Columna izquierda: tabla de posiciones recientes */}
        <div className="card">
          <div className="card__header">
            <div className="card__header-left">
              <h3 className="card__title">Cargos recientes</h3>
              <span className="card__count">{posiciones.length} registros</span>
            </div>
            <Link to="/app/posiciones" className="card__action">Ver todos &rarr;</Link>
          </div>

          {posiciones.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon" aria-hidden="true">--</div>
              <p className="empty-state__title">Sin cargos</p>
              <p className="empty-state__desc">Agrega cargos desde la seccion Posiciones</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Cargo</th>
                    <th>Departamento</th>
                  </tr>
                </thead>
                <tbody>
                  {recientes.map(pos => {
                    const deptNombre = typeof pos.department === 'object'
                      ? pos.department?.name
                      : departamentos.find(d => d._id === pos.department)?.name;
                    return (
                      <tr key={pos._id}>
                        <td>
                          <span className="table__primary">{pos.title}</span>
                        </td>
                        <td>
                          <Badge texto={deptNombre || 'Sin depto'} tipo="blue" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Columna derecha: lista de departamentos con barra de proporcion */}
        <div className="card">
          <div className="card__header">
            <div className="card__header-left">
              <h3 className="card__title">Departamentos</h3>
              <span className="card__count">{departamentos.length} activos</span>
            </div>
            <Link to="/app/departamentos" className="card__action">Gestionar &rarr;</Link>
          </div>

          {departamentos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon" aria-hidden="true">--</div>
              <p className="empty-state__title">Sin departamentos</p>
              <p className="empty-state__desc">Crea departamentos desde la seccion correspondiente</p>
            </div>
          ) : (
            <div className="dash__dept-list">
              {deptosConConteo.map(dep => (
                <div key={dep._id} className="dash__dept-item">
                  <div className="dash__dept-info">
                    <div className="dash__dept-row">
                      <span className="dash__dept-name">{dep.name}</span>
                      <span className="dash__dept-count">{dep.totalCargos} cargo{dep.totalCargos !== 1 ? 's' : ''}</span>
                    </div>
                    {/* Barra de proporcion visual */}
                    <div className="dash__dept-bar-track">
                      <div
                        className="dash__dept-bar-fill"
                        style={{ width: `${(dep.totalCargos / maxCargos) * 100}%` }}
                      />
                    </div>
                    {dep.description && (
                      <span className="dash__dept-desc">{dep.description}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* -- Graficas de organización -- */}
      {empleados.length > 0 && (
        <div className="chart-section">
          <h3 className="chart-section__title">Analítica de organización</h3>
          <div className="chart-row">

            {/* Donut: Empleados activos por departamento */}
            <div className="card chart-card">
              <div className="card__header">
                <div className="card__header-left">
                  <h3 className="card__title">Empleados por área</h3>
                  <span className="card__count">personal activo</span>
                </div>
              </div>
              <div className="chart-card__body">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={empsPorDept} cx="50%" cy="50%"
                      innerRadius="52%" outerRadius="74%"
                      dataKey="value" nameKey="name" paddingAngle={3}
                    >
                      {empsPorDept.map((_, i) => (
                        <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TT_STYLE} itemStyle={{ color: '#CBD5E1' }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94A3B8' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar horizontal: Salario promedio por departamento */}
            <div className="card chart-card">
              <div className="card__header">
                <div className="card__header-left">
                  <h3 className="card__title">Salario promedio por área</h3>
                  <span className="card__count">basado en cargos registrados</span>
                </div>
              </div>
              <div className="chart-card__body">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salarioPorDept} layout="vertical"
                    margin={{ left: 4, right: 28, top: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A3450" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fill: '#94A3B8', fontSize: 11 }}
                      tickLine={false} axisLine={false}
                      tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                      type="category" dataKey="name" width={88}
                      tick={{ fill: '#CBD5E1', fontSize: 11 }}
                      tickLine={false} axisLine={false}
                    />
                    <Tooltip
                      contentStyle={TT_STYLE} itemStyle={{ color: '#CBD5E1' }}
                      formatter={v => [`$${v.toLocaleString('es-CO')}`, 'Promedio']}
                    />
                    <Bar dataKey="avg" fill="#6366F1" radius={[0, 4, 4, 0]} maxBarSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}