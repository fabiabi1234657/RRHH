import { useState, useEffect, useCallback } from 'react';
import { obtenerDepartamentosAPI } from '../services/api';
import { usePositionStore } from '../stores/usePositionStore';
import Modal  from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Badge  from '../components/ui/Badge';
import Alert  from '../components/ui/Alert';
import { toast } from '../stores/useToastStore';

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

const DEPT_TYPES = ['blue', 'purple', 'orange', 'green', 'info'];
const deptColor = name => {
  const code = [...(name ?? '')].reduce((a, c) => a + c.charCodeAt(0), 0);
  return DEPT_TYPES[code % DEPT_TYPES.length];
};

/* ----------------------------------------------------------
   Formulario para crear / editar una posicion (cargo)
   Modelo Position del backend:
     - title (string, required)
     - department (ObjectId ref Department, required)
   ---------------------------------------------------------- */
function FormPosicion({ inicial, departamentos, guardando, error, onGuardar, onCerrarError }) {
  const [form, setForm] = useState({ titulo: '', departamentoId: '', ...inicial });
  const cambiar = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const enviar = e => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.departamentoId) return;
    onGuardar(form);
  };

  return (
    <form className="pos-form" onSubmit={enviar}>
      {error && <Alert tipo="error" onCerrar={onCerrarError}>{error}</Alert>}

      <div className="field">
        <label className="field__label" htmlFor="pf-titulo">Titulo del cargo *</label>
        <input id="pf-titulo" name="titulo" className="field__input"
          placeholder="Ej. Desarrollador Senior" value={form.titulo} onChange={cambiar} required />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="pf-dept">Departamento *</label>
        <select id="pf-dept" name="departamentoId" className="field__input field__select"
          value={form.departamentoId} onChange={cambiar} required>
          <option value="">- Selecciona un departamento -</option>
          {departamentos.map(d => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>
      </div>

      <div className="pos-form__footer">
        <Button type="submit" variante="primary" cargando={guardando} fullWidth>
          {inicial?._id ? 'Guardar cambios' : 'Crear posicion'}
        </Button>
      </div>
    </form>
  );
}

/* ================================================================
   Pagina principal: Posiciones / Cargos
   Endpoint: /api/cargos
   Modelo: { title, department }
   ================================================================ */
export default function Employees() {
  const {
    positions: posiciones,
    loading: cargando,
    error,
    fetchPositions,
    createPosition,
    updatePosition,
    deletePosition,
    clearPositionError
  } = usePositionStore();

  const [departamentos, setDepartamentos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modalCrear, setModalCrear] = useState(false);
  const [editando, setEditando]     = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [guardando, setGuardando]   = useState(false);
  const [errorAccion, setErrorAccion] = useState(null);

  const cargar = useCallback(async () => {
    try {
      const [, rDept] = await Promise.all([
        fetchPositions(),
        obtenerDepartamentosAPI()
      ]);
      setDepartamentos(rDept.departments ?? []);
    } catch {
      /* El store conserva el error de posiciones para la UI. */
    }
  }, [fetchPositions]);

  useEffect(() => { void Promise.resolve().then(cargar); }, [cargar]);

  const filtradas = posiciones.filter(p => {
    const q = busqueda.toLowerCase();
    const dept = typeof p.department === 'object' ? p.department?.name : '';
    return (
      p.title?.toLowerCase().includes(q) ||
      dept?.toLowerCase().includes(q)
    );
  });

  const crearPosicion = async ({ titulo, departamentoId }) => {
    setGuardando(true); setErrorAccion(null);
    try {
      await createPosition({ title: titulo, department: departamentoId });
      setModalCrear(false);
      toast.success('Posicion creada', `"${titulo}" fue creada correctamente.`);
    } catch (e) {
      setErrorAccion(e.message ?? 'Error al crear');
      toast.error('Error al crear', e.message ?? 'No se pudo crear la posicion.');
    } finally { setGuardando(false); }
  };

  const actualizarPosicion = async ({ titulo, departamentoId }) => {
    setGuardando(true); setErrorAccion(null);
    try {
      await updatePosition(editando._id, { title: titulo, department: departamentoId });
      setEditando(null);
      toast.success('Posicion actualizada', `"${titulo}" fue actualizada correctamente.`);
    } catch (e) {
      setErrorAccion(e.message ?? 'Error al actualizar');
      toast.error('Error al actualizar', e.message ?? 'No se pudo actualizar la posicion.');
    } finally { setGuardando(false); }
  };

  const confirmarEliminar = async () => {
    setGuardando(true); setErrorAccion(null);
    try {
      const titulo = eliminando.title;
      await deletePosition(eliminando._id);
      setEliminando(null);
      toast.success('Posicion eliminada', `"${titulo}" fue eliminada.`);
    } catch (e) {
      setErrorAccion(e.message ?? 'Error al eliminar');
      toast.error('Error al eliminar', e.message ?? 'No se pudo eliminar la posicion.');
    } finally { setGuardando(false); }
  };

  const fecha = iso => iso
    ? new Date(iso).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
    : '-';

  const inicialEdicion = p => ({
    _id: p._id,
    titulo: p.title ?? '',
    departamentoId: typeof p.department === 'object' ? p.department?._id : p.department ?? ''
  });

  return (
    <div className="posiciones">
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-header__title">Catalogo de cargos</h1>
          <p className="page-header__desc">Responsabilidades y areas vinculadas</p>
        </div>
        <Button variante="primary" icono={<IcoPlus />}
          onClick={() => { setErrorAccion(null); setModalCrear(true); }}>
          Nueva posicion
        </Button>
      </div>

      <div className="dept-toolbar">
        <div className="search-bar">
          <span className="search-bar__icon"><IcoSearch /></span>
          <input className="search-bar__input" placeholder="Buscar por cargo o departamento..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>
        {!cargando && (
          <span className="dept-count">
            {filtradas.length} {filtradas.length === 1 ? 'posicion' : 'posiciones'}
          </span>
        )}
      </div>

      {cargando && (
        <div className="card">
          <div className="dept-skeleton">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="dept-skeleton__row">
                <div className="skeleton" style={{ width: '35%', height: 14 }} />
                <div className="skeleton" style={{ width: '55%', height: 12, marginTop: 6 }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {!cargando && error && (
        <Alert tipo="error" onCerrar={clearPositionError}>{error}</Alert>
      )}

      {!cargando && !error && (
        <div className="card">
          {filtradas.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon" aria-hidden="true">--</div>
              <p className="empty-state__title">
                {busqueda ? 'Sin resultados' : 'No hay posiciones'}
              </p>
              <p className="empty-state__desc">
                {busqueda ? `No se encontro "${busqueda}"` : 'Crea la primera posicion para comenzar.'}
              </p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Cargo</th>
                    <th>Departamento</th>
                    <th>Creado</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map(pos => {
                    const deptName = typeof pos.department === 'object'
                      ? pos.department?.name
                      : departamentos.find(d => d._id === pos.department)?.name;
                    return (
                      <tr key={pos._id}>
                        <td>
                          <span className="table__primary">{pos.title}</span>
                        </td>
                        <td>
                          {deptName
                            ? <Badge texto={deptName} tipo={deptColor(deptName)} />
                            : <span style={{ color: 'var(--text3)', fontSize: 13 }}>-</span>
                          }
                        </td>
                        <td><span className="table__secondary">{fecha(pos.createdAt)}</span></td>
                        <td>
                          <div className="table__actions" style={{ justifyContent: 'flex-end' }}>
                            <button className="table__btn table__btn--edit" title="Editar"
                              onClick={() => { setErrorAccion(null); setEditando(pos); }}>
                              <IcoEdit />
                            </button>
                            <button className="table__btn table__btn--delete" title="Eliminar"
                              onClick={() => { setErrorAccion(null); setEliminando(pos); }}>
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
          )}
        </div>
      )}

      {modalCrear && (
        <Modal titulo="Nueva posicion" onClose={() => setModalCrear(false)}>
          <FormPosicion
            departamentos={departamentos}
            guardando={guardando}
            error={errorAccion}
            onGuardar={crearPosicion}
            onCerrarError={() => setErrorAccion(null)}
          />
        </Modal>
      )}

      {editando && (
        <Modal titulo="Editar posicion" onClose={() => setEditando(null)}>
          <FormPosicion
            inicial={inicialEdicion(editando)}
            departamentos={departamentos}
            guardando={guardando}
            error={errorAccion}
            onGuardar={actualizarPosicion}
            onCerrarError={() => setErrorAccion(null)}
          />
        </Modal>
      )}

      {eliminando && (
        <Modal
          titulo="Eliminar posicion"
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
            <p>Esta seguro de eliminar el cargo <strong>{eliminando.title}</strong>?</p>
            <p className="dept-confirm__warn">Esta accion no se puede deshacer.</p>
          </div>
        </Modal>
      )}
    </div>
  );
}