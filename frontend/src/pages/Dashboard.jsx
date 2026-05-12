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
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCatalogStore } from '../stores/useCatalogStore';
import { obtenerEmpleadosAPI } from '../services/api';
import StatCard from '../components/ui/StatCard';
import Badge    from '../components/ui/Badge';

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
  const [errorLocal, setErrorLocal] = useState('');

  /* -- Cargar datos al montar el componente -- */
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [, rEmp] = await Promise.all([
          fetchCatalogs(),
          obtenerEmpleadosAPI()
        ]);
        setTotalEmpleados((rEmp.employees ?? rEmp ?? []).length);
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
    </div>
  );
}