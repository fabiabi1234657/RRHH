import { useState, useEffect, useCallback } from 'react';
import { useDepartmentStore } from '../stores/useDepartmentStore';
import Modal   from '../components/ui/Modal';
import Button  from '../components/ui/Button';
import Badge   from '../components/ui/Badge';
import Alert   from '../components/ui/Alert';
import { toast } from '../stores/useToastStore';

/* -- Icono de lápiz (editar) -- */
const IcoEdit = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

/* -- Icono de papelera (eliminar) -- */
const IcoDelete = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

/* -- Icono de búsqueda -- */
const IcoSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

/* -- Icono de mas (crear) -- */
const IcoPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

/* -- Formulario de creación / edición de departamento -- */
function FormDepartamento({ inicial, guardando, error, onGuardar, onCerrarError }) {
  /* Estado inicial del formulario */
  const [form, setForm] = useState({ nombre: '', descripcion: '', ...inicial });

  const cambiar = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const enviar = e => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    onGuardar(form);
  };

  return (
    <form className="dept-form" onSubmit={enviar}>
      {/* Mensaje de error del servidor */}
      {error && <Alert tipo="error" onCerrar={onCerrarError}>{error}</Alert>}

      {/* Campo: nombre del departamento */}
      <div className="field">
        <label className="field__label" htmlFor="df-nombre">Nombre del departamento *</label>
        <input id="df-nombre" name="nombre" className="field__input" placeholder="Ej. Recursos Humanos"
          value={form.nombre} onChange={cambiar} required />
      </div>

      {/* Campo: descripción (opcional) */}
      <div className="field">
        <label className="field__label" htmlFor="df-desc">Descripción</label>
        <textarea id="df-desc" name="descripcion" className="field__input field__textarea"
          placeholder="Breve descripción del departamento..." rows={3}
          value={form.descripcion} onChange={cambiar} />
      </div>

      {/* Boton de guardado */}
      <div className="dept-form__footer">
        <Button type="submit" variante="primary" cargando={guardando} fullWidth>
          {inicial?._id ? 'Guardar cambios' : 'Crear departamento'}
        </Button>
      </div>
    </form>
  );
}

/* ================================================================
   Pagina principal: Departamentos
   Conectado al endpoint real GET/POST/PUT/DELETE /api/departamentos
   ================================================================ */
export default function Departments() {
  const {
    departments: departamentos,
    loading: cargando,
    error,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    clearDepartmentError
  } = useDepartmentStore();
  /* Término de búsqueda */
  const [busqueda, setBusqueda] = useState('');

  /* Modal de creación */
  const [modalCrear, setModalCrear] = useState(false);
  /* Departamento seleccionado para editar (null = ninguno) */
  const [editando, setEditando] = useState(null);
  /* Departamento pendiente de confirmar eliminacion */
  const [eliminando, setEliminando] = useState(null);

  /* Estado de carga para acciones (guardar / eliminar) */
  const [guardando, setGuardando] = useState(false);
  /* Error de accion (guardar / eliminar) */
  const [errorAccion, setErrorAccion] = useState(null);

  /* -- Carga inicial de departamentos -- */
  const cargar = useCallback(async () => {
    try {
      await fetchDepartments();
    } catch {
      /* El store conserva el error para la UI. */
    }
  }, [fetchDepartments]);

  useEffect(() => { cargar(); }, [cargar]);

  /* -- Lista filtrada por búsqueda -- */
  const filtrados = departamentos.filter(d =>
    d.name?.toLowerCase().includes(busqueda.toLowerCase()) ||
    d.description?.toLowerCase().includes(busqueda.toLowerCase())
  );

  /* -- Guardar nuevo departamento -- */
  const crearDepartamento = async ({ nombre, descripcion }) => {
    setGuardando(true);
    setErrorAccion(null);
    try {
      await createDepartment({ name: nombre, description: descripcion });
      setModalCrear(false);
      toast.success('Departamento creado', `"${nombre}" fue añadido al sistema correctamente.`);
    } catch (e) {
      setErrorAccion(e.message ?? 'Error al crear');
      toast.error('No se pudo crear', e.message ?? 'Verifica los datos e intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  /* -- Guardar edición de departamento -- */
  const actualizarDepartamento = async ({ nombre, descripcion }) => {
    setGuardando(true);
    setErrorAccion(null);
    try {
      await updateDepartment(editando._id, { name: nombre, description: descripcion });
      setEditando(null);
      toast.success('Departamento actualizado', `"${nombre}" fue guardado con los nuevos datos.`);
    } catch (e) {
      setErrorAccion(e.message ?? 'Error al actualizar');
      toast.error('No se pudo actualizar', e.message ?? 'Verifica los datos e intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  /* -- Confirmar eliminacion -- */
  const confirmarEliminar = async () => {
    setGuardando(true);
    setErrorAccion(null);
    try {
      const nombre = eliminando.name;
      await deleteDepartment(eliminando._id);
      setEliminando(null);
      toast.success('Departamento eliminado', `"${nombre}" fue removido del sistema.`);
    } catch (e) {
      setErrorAccion(e.message ?? 'Error al eliminar');
      toast.error('No se pudo eliminar', e.message ?? 'Verifica que no tenga empleados asociados.');
    } finally {
      setGuardando(false);
    }
  };

  /* -- Formateador de fecha legible en espanol -- */
  const fecha = iso => iso
    ? new Date(iso).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
    : '-';

  return (
    <div className="departamentos">

      {/* -- Encabezado de la pagina -- */}
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-header__title">Áreas organizacionales</h1>
          <p className="page-header__desc">Estructura interna y descripcion de cada equipo</p>
        </div>
        <Button variante="primary" icono={<IcoPlus />} onClick={() => { setErrorAccion(null); setModalCrear(true); }}>
          Nuevo departamento
        </Button>
      </div>

      {/* -- Barra de herramientas (busqueda + contador) -- */}
      <div className="dept-toolbar">
        <div className="search-bar">
          <span className="search-bar__icon"><IcoSearch /></span>
          <input className="search-bar__input" placeholder="Buscar departamento..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>
        {!cargando && (
          <span className="dept-count">
            {filtrados.length} {filtrados.length === 1 ? 'departamento' : 'departamentos'}
          </span>
        )}
      </div>

      {/* -- Estado de carga (skeleton) -- */}
      {cargando && (
        <div className="card">
          <div className="dept-skeleton">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="dept-skeleton__row">
                <div className="skeleton" style={{ width: '40%', height: 14 }} />
                <div className="skeleton" style={{ width: '60%', height: 12, marginTop: 6 }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -- Error de carga -- */}
      {!cargando && error && (
        <Alert tipo="error" onCerrar={clearDepartmentError}>{error}</Alert>
      )}

      {/* -- Tabla de departamentos -- */}
      {!cargando && !error && (
        <div className="card">
          {filtrados.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon" aria-hidden="true">--</div>
              <p className="empty-state__title">
                {busqueda ? 'Sin resultados' : 'No hay departamentos'}
              </p>
              <p className="empty-state__desc">
                {busqueda ? `No se encontró "${busqueda}"` : 'Crea el primer departamento para comenzar.'}
              </p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Departamento</th>
                    <th>Descripcion</th>
                    <th>Creado</th>
                    <th style={{ textAlign: 'center' }}>Estado</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map(dep => (
                    <tr key={dep._id}>
                      {/* Nombre del departamento */}
                      <td>
                        <div className="dept-name-cell">
                          <span className="dept-avatar">{dep.name?.charAt(0)?.toUpperCase() ?? 'D'}</span>
                          <span className="table__primary">{dep.name}</span>
                        </div>
                      </td>

                      {/* Descripcion (truncada) */}
                      <td>
                        <span className="dept-desc text-truncate">
                          {dep.description || <span style={{ color: 'var(--text3)' }}>Sin descripcion</span>}
                        </span>
                      </td>

                      {/* Fecha de creacion */}
                      <td><span className="table__secondary">{fecha(dep.createdAt)}</span></td>

                      {/* Badge de estado */}
                      <td style={{ textAlign: 'center' }}>
                        <Badge texto="Activo" tipo="green" dot />
                      </td>

                      {/* Botones de accion */}
                      <td>
                        <div className="table__actions" style={{ justifyContent: 'flex-end' }}>
                          <button className="table__btn table__btn--edit" title="Editar"
                            onClick={() => { setErrorAccion(null); setEditando(dep); }}>
                            <IcoEdit />
                          </button>
                          <button className="table__btn table__btn--delete" title="Eliminar"
                            onClick={() => { setErrorAccion(null); setEliminando(dep); }}>
                            <IcoDelete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* -- Modal: Crear departamento -- */}
      {modalCrear && (
        <Modal titulo="Nuevo departamento" onClose={() => setModalCrear(false)}>
          <FormDepartamento
            guardando={guardando}
            error={errorAccion}
            onGuardar={crearDepartamento}            onCerrarError={() => setErrorAccion(null)}          />
        </Modal>
      )}

      {/* -- Modal: Editar departamento -- */}
      {editando && (
        <Modal titulo="Editar departamento" onClose={() => setEditando(null)}>
          <FormDepartamento
            inicial={{ _id: editando._id, nombre: editando.name, descripcion: editando.description ?? '' }}
            guardando={guardando}
            error={errorAccion}
            onGuardar={actualizarDepartamento}            onCerrarError={() => setErrorAccion(null)}          />
        </Modal>
      )}

      {/* -- Modal: Confirmar eliminacion -- */}
      {eliminando && (
        <Modal
          titulo="Eliminar departamento"
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
            <p>Esta seguro de eliminar el departamento <strong>{eliminando.name}</strong>?</p>
            <p className="dept-confirm__warn">Esta accion no se puede deshacer.</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
