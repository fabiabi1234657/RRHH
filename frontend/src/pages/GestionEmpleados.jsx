import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  obtenerEmpleadosAPI,
  crearEmpleadoAPI,
  actualizarEmpleadoAPI,
  eliminarEmpleadoAPI,
  obtenerDepartamentosAPI,
  obtenerPosicionesAPI,
  obtenerUsuariosAPI,
} from '../services/api';
import Modal      from '../components/ui/Modal';
import Button     from '../components/ui/Button';
import Badge      from '../components/ui/Badge';
import Alert      from '../components/ui/Alert';
import Pagination from '../components/ui/Pagination';
import EmployeeDocumentsModal from '../components/ui/EmployeeDocumentsModal';
import { toast } from '../stores/useToastStore';

/* -- Iconos -- */
const IcoEdit = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const IcoDelete = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const IcoSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IcoPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const IcoUser = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const STATUS_LABELS = { active: 'Activo', inactive: 'Inactivo' };
const STATUS_TIPOS  = { active: 'green', inactive: 'orange' };

const DEPT_TYPES = ['blue', 'purple', 'orange', 'success', 'info'];
const deptColor = name => {
  const code = [...(name ?? '')].reduce((a, c) => a + c.charCodeAt(0), 0);
  return DEPT_TYPES[code % DEPT_TYPES.length];
};

const iniciales = nombre => {
  if (!nombre || nombre === '-') return '?';
  return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
};

/* ============================================================
   Formulario crear / editar empleado
   ============================================================ */
function FormEmpleado({ inicial, departamentos, posiciones, usuarios, guardando, error, onGuardar, onCerrarError }) {
  const [form, setForm] = useState({
    userId: '',
    position: '',
    department: '',
    hireDate: new Date().toISOString().slice(0, 10),
    status: 'active',
    trialEndDate: '',
    contractEndDate: '',
    dataPolicySignedAt: '',
    ...inicial,
  });

  const cambiar = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const enviar = e => {
    e.preventDefault();
    if (!form.userId.trim() || !form.position || !form.department || !form.hireDate) return;
    onGuardar(form);
  };

  return (
    <form className="emp-form" onSubmit={enviar}>
      {error && <Alert tipo="error" onCerrar={onCerrarError}>{error}</Alert>}

      {!inicial?._id && (
        <div className="field">
          <label className="field__label" htmlFor="ef-userId">Usuario *</label>
          <select
            id="ef-userId" name="userId" className="field__input field__select"
            value={form.userId} onChange={cambiar} required
          >
            <option value="">- Selecciona un usuario -</option>
            {usuarios.map(u => (
              <option key={u.id} value={u.id}>
                {u.email}{u.name ? ` — ${u.name}` : ''}
              </option>
            ))}
          </select>
          <span className="field__hint">El usuario debe estar registrado en el sistema</span>
        </div>
      )}

      <div className="emp-form__row">
        <div className="field">
          <label className="field__label" htmlFor="ef-position">Cargo *</label>
          <select id="ef-position" name="position" className="field__input field__select"
            value={form.position} onChange={cambiar} required>
            <option value="">- Selecciona un cargo -</option>
            {posiciones.map(p => (
              <option key={p._id} value={p._id}>{p.title}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="ef-department">Departamento *</label>
          <select id="ef-department" name="department" className="field__input field__select"
            value={form.department} onChange={cambiar} required>
            <option value="">- Selecciona un departamento -</option>
            {departamentos.map(d => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="emp-form__row">
        <div className="field">
          <label className="field__label" htmlFor="ef-hireDate">Fecha de contratacion *</label>
          <input
            id="ef-hireDate" name="hireDate" type="date" className="field__input"
            value={form.hireDate} onChange={cambiar} required
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="ef-status">Estado</label>
          <select id="ef-status" name="status" className="field__input field__select"
            value={form.status} onChange={cambiar}>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
      </div>

      <div className="emp-form__row">
        <div className="field">
          <label className="field__label" htmlFor="ef-trialEndDate">Fin de período de prueba</label>
          <input
            id="ef-trialEndDate" name="trialEndDate" type="date" className="field__input"
            value={form.trialEndDate ?? ''} onChange={cambiar}
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="ef-contractEndDate">Fin de contrato</label>
          <input
            id="ef-contractEndDate" name="contractEndDate" type="date" className="field__input"
            value={form.contractEndDate ?? ''} onChange={cambiar}
          />
        </div>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="ef-dataPolicySignedAt">Fecha de firma Habeas Data</label>
        <input
          id="ef-dataPolicySignedAt" name="dataPolicySignedAt" type="date" className="field__input"
          value={form.dataPolicySignedAt ?? ''} onChange={cambiar}
        />
        <span className="field__hint">Política de tratamiento de datos personales firmada por el empleado.</span>
      </div>

      <div className="emp-form__footer">
        <Button type="submit" variante="primary" cargando={guardando} fullWidth>
          {inicial?._id ? 'Guardar cambios' : 'Crear empleado'}
        </Button>
      </div>
    </form>
  );
}

/* -- Página principal -- */
export default function GestionEmpleados() {
  const [empleados, setEmpleados]         = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [posiciones, setPosiciones]       = useState([]);
  const [usuarios, setUsuarios]           = useState([]);
  const [cargando, setCargando]           = useState(true);
  const [error, setError]                 = useState(null);
  const [busqueda, setBusqueda]           = useState('');
  const [modalCrear, setModalCrear]       = useState(false);
  const [editando, setEditando]           = useState(null);
  const [eliminando, setEliminando]       = useState(null);
  const [guardando, setGuardando]         = useState(false);
  const [errorAccion, setErrorAccion]     = useState(null);
  const [docsDe, setDocsDe]               = useState(null);
  const [pagina, setPagina]               = useState(1);

  const EMP_PAGE = 25;

  const cargar = useCallback(async () => {
    setCargando(true); setError(null);
    try {
      const [rEmp, rDept, rPos, rUsers] = await Promise.all([
        obtenerEmpleadosAPI(),
        obtenerDepartamentosAPI(),
        obtenerPosicionesAPI(),
        obtenerUsuariosAPI(),
      ]);
      setEmpleados(rEmp.employees ?? rEmp ?? []);
      setDepartamentos(rDept.departments ?? []);
      setPosiciones(rPos.positions ?? []);
      setUsuarios(rUsers.users ?? []);
    } catch (e) {
      setError(e.message ?? 'Error al cargar datos');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { void Promise.resolve().then(cargar); }, [cargar]);

  const filtrados = empleados.filter(emp => {
    const q      = busqueda.toLowerCase();
    const nombre = emp.userId?.name ?? emp.userId?.email ?? String(emp.userId ?? '');
    const cargo  = typeof emp.position   === 'object' ? emp.position?.title   : '';
    const dept   = typeof emp.department === 'object' ? emp.department?.name  : '';
    return nombre.toLowerCase().includes(q) || cargo.toLowerCase().includes(q) || dept.toLowerCase().includes(q);
  });

  const pagEmps = filtrados.slice((pagina - 1) * EMP_PAGE, pagina * EMP_PAGE);

  const limpiarFechas = (obj) => {
    const out = { ...obj };
    ['trialEndDate', 'contractEndDate', 'dataPolicySignedAt'].forEach((k) => {
      if (out[k] === '' || out[k] == null) delete out[k];
    });
    return out;
  };

  const crearEmpleado = async (form) => {
    setGuardando(true); setErrorAccion(null);
    try {
      const { userId, position, department, hireDate, status, trialEndDate, contractEndDate, dataPolicySignedAt } = form;
      const payload = limpiarFechas({ userId, position, department, hireDate, status, trialEndDate, contractEndDate, dataPolicySignedAt });
      await crearEmpleadoAPI(payload);
      setModalCrear(false);
      toast.success('Empleado registrado', 'El perfil del empleado fue creado exitosamente.');
      await cargar();
    } catch (e) {
      setErrorAccion(e.message ?? 'Error al crear');
      toast.error('No se pudo registrar', e.message ?? 'Verifica los datos del formulario.');
    } finally { setGuardando(false); }
  };

  const actualizarEmpleado = async (form) => {
    setGuardando(true); setErrorAccion(null);
    try {
      const { position, department, hireDate, status, trialEndDate, contractEndDate, dataPolicySignedAt } = form;
      const payload = limpiarFechas({ position, department, hireDate, status, trialEndDate, contractEndDate, dataPolicySignedAt });
      await actualizarEmpleadoAPI(editando._id, payload);
      setEditando(null);
      toast.success('Empleado actualizado', 'Los datos del perfil fueron guardados.');
      await cargar();
    } catch (e) {
      setErrorAccion(e.message ?? 'Error al actualizar');
      toast.error('No se pudo actualizar', e.message ?? 'Inténtalo de nuevo.');
    } finally { setGuardando(false); }
  };

  const confirmarEliminar = async () => {
    setGuardando(true); setErrorAccion(null);
    try {
      await eliminarEmpleadoAPI(eliminando._id);
      setEliminando(null);
      toast.success('Empleado eliminado', 'El perfil fue removido del sistema.');
      await cargar();
    } catch (e) {
      setErrorAccion(e.message ?? 'Error al eliminar');
      toast.error('No se pudo eliminar', e.message ?? 'Inténtalo de nuevo.');
    } finally { setGuardando(false); }
  };

  const fecha = iso => iso
    ? new Date(iso).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
    : '-';

  const totalActivos  = useMemo(() => empleados.filter(e => e.status === 'active').length,   [empleados]);
  const totalInactivos = useMemo(() => empleados.filter(e => e.status !== 'active').length, [empleados]);

  const resolverNombre = emp => {
    const u = emp.userId;
    if (!u) return '-';
    if (typeof u === 'object') return u.name ?? u.email ?? String(u._id);
    return u;
  };

  const inicialEdicion = emp => ({
    _id:        emp._id,
    userId:     typeof emp.userId     === 'object' ? emp.userId?._id     : emp.userId     ?? '',
    position:   typeof emp.position   === 'object' ? emp.position?._id   : emp.position   ?? '',
    department: typeof emp.department === 'object' ? emp.department?._id : emp.department ?? '',
    hireDate:   emp.hireDate ? emp.hireDate.slice(0, 10) : '',
    status:     emp.status ?? 'active',
    trialEndDate:       emp.trialEndDate       ? emp.trialEndDate.slice(0, 10)       : '',
    contractEndDate:    emp.contractEndDate    ? emp.contractEndDate.slice(0, 10)    : '',
    dataPolicySignedAt: emp.dataPolicySignedAt ? emp.dataPolicySignedAt.slice(0, 10) : '',
  });

  return (
    <div className="posiciones">

      {/* Encabezado */}
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-header__title">Gestion de empleados</h1>
          <p className="page-header__desc">Perfiles, cargos y departamentos del personal</p>
        </div>
        <Button variante="primary" icono={<IcoPlus />}
          onClick={() => { setErrorAccion(null); setModalCrear(true); }}>
          Nuevo empleado
        </Button>
      </div>

      {/* Barra compacta: stats + búsqueda */}
      <div className="emp-toolbar">
        {!cargando && (
          <div className="emp-chips">
            <div className="emp-chip">
              <span className="emp-chip__num">{empleados.length}</span>
              <span className="emp-chip__lbl">Total</span>
            </div>
            <div className="emp-chip emp-chip--green">
              <span className="emp-chip__num">{totalActivos}</span>
              <span className="emp-chip__lbl">Activos</span>
            </div>
            <div className="emp-chip emp-chip--orange">
              <span className="emp-chip__num">{totalInactivos}</span>
              <span className="emp-chip__lbl">Inactivos</span>
            </div>
          </div>
        )}
        <div className="search-bar" style={{ flex: 1 }}>
          <span className="search-bar__icon"><IcoSearch /></span>
          <input
            className="search-bar__input"
            placeholder="Buscar por nombre, cargo o departamento..."
            value={busqueda}
            onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
          />
        </div>
        {!cargando && (
          <span className="dept-count">
            {filtrados.length} {filtrados.length === 1 ? 'empleado' : 'empleados'}
          </span>
        )}
      </div>

      {/* Skeleton */}
      {cargando && (
        <div className="card">
          <div className="dept-skeleton">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="dept-skeleton__row">
                <div className="skeleton" style={{ width: '28%', height: 14 }} />
                <div className="skeleton" style={{ width: '48%', height: 12, marginTop: 6 }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error general */}
      {!cargando && error && (
        <Alert tipo="error" onCerrar={() => setError(null)}>{error}</Alert>
      )}

      {/* Tabla */}
      {!cargando && !error && (
        <div className="card">
          {filtrados.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon" aria-hidden><IcoUser /></div>
              <p className="empty-state__title">
                {busqueda ? 'Sin resultados' : 'No hay empleados'}
              </p>
              <p className="empty-state__desc">
                {busqueda
                  ? `No se encontro "${busqueda}"`
                  : 'Registra el primer empleado para comenzar.'}
              </p>
            </div>
          ) : (
            <>
              <div className="table-wrap">
                <table className="table" style={{ minWidth: 0 }}>
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Cargo</th>
                    <th>Departamento</th>
                    <th>Contratacion</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pagEmps.map(emp => {
                    const nombre = resolverNombre(emp);
                    const cargoNombre = typeof emp.position === 'object'
                      ? emp.position?.title
                      : posiciones.find(p => p._id === emp.position)?.title ?? '-';
                    const deptNombre = typeof emp.department === 'object'
                      ? emp.department?.name
                      : departamentos.find(d => d._id === emp.department)?.name ?? '-';
                    return (
                      <tr key={emp._id}>
                        <td>
                          <div className="emp-name-cell">
                            <div className="emp-avatar">{iniciales(nombre)}</div>
                            <span className="table__primary">{nombre}</span>
                          </div>
                        </td>
                        <td>
                          <span className="table__primary" style={{ fontWeight: 500 }}>{cargoNombre ?? '-'}</span>
                        </td>
                        <td>
                          {deptNombre && deptNombre !== '-'
                            ? <Badge texto={deptNombre} tipo={deptColor(deptNombre)} />
                            : <span style={{ color: 'var(--text3)', fontSize: 13 }}>-</span>
                          }
                        </td>
                        <td>
                          <span className="table__secondary">{fecha(emp.hireDate)}</span>
                        </td>
                        <td>
                          <Badge
                            texto={STATUS_LABELS[emp.status] ?? emp.status}
                            tipo={STATUS_TIPOS[emp.status] ?? 'info'}
                          />
                        </td>
                        <td>
                          <div className="table__actions" style={{ justifyContent: 'flex-end' }}>
                            <button className="table__btn" title="Documentos"
                              onClick={() => setDocsDe(emp)}>
                              📎
                            </button>
                            <button className="table__btn table__btn--edit" title="Editar"
                              onClick={() => { setErrorAccion(null); setEditando(emp); }}>
                              <IcoEdit />
                            </button>
                            <button className="table__btn table__btn--delete" title="Eliminar"
                              onClick={() => { setErrorAccion(null); setEliminando(emp); }}>
                              <IcoDelete />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              page={pagina}
              total={filtrados.length}
              pageSize={EMP_PAGE}
              onChange={setPagina}
            />
            </>
          )}
        </div>
      )}

      {/* Modal: Crear */}
      {modalCrear && (
        <Modal titulo="Nuevo empleado" onClose={() => setModalCrear(false)}>
          <FormEmpleado
            departamentos={departamentos}
            posiciones={posiciones}
            usuarios={usuarios}
            guardando={guardando}
            error={errorAccion}
            onGuardar={crearEmpleado}
            onCerrarError={() => setErrorAccion(null)}
          />
        </Modal>
      )}

      {/* Modal: Editar */}
      {editando && (
        <Modal titulo="Editar empleado" onClose={() => setEditando(null)}>
          <FormEmpleado
            inicial={inicialEdicion(editando)}
            departamentos={departamentos}
            posiciones={posiciones}
            guardando={guardando}
            error={errorAccion}
            onGuardar={actualizarEmpleado}
            onCerrarError={() => setErrorAccion(null)}
          />
        </Modal>
      )}

      {/* Modal: Confirmar eliminacion */}
      {eliminando && (
        <Modal
          titulo="Eliminar empleado"
          onClose={() => setEliminando(null)}
          footer={
            <>
              <Button variante="secondary" onClick={() => setEliminando(null)}>Cancelar</Button>
              <Button variante="danger" cargando={guardando} onClick={confirmarEliminar}>Eliminar</Button>
            </>
          }
        >
          <div className="dept-confirm">
            {errorAccion && <Alert tipo="error" onCerrar={() => setErrorAccion(null)}>{errorAccion}</Alert>}
            <p>Esta seguro de eliminar el perfil de <strong>{resolverNombre(eliminando)}</strong>?</p>
            <p className="dept-confirm__warn">Esta accion no se puede deshacer.</p>
          </div>
        </Modal>
      )}

      {/* Modal: Documentos del empleado */}
      {docsDe && (
        <EmployeeDocumentsModal
          employeeId={docsDe._id}
          employeeName={resolverNombre(docsDe)}
          onClose={() => setDocsDe(null)}
        />
      )}
    </div>
  );
}