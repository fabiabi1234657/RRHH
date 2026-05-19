import { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';
import Button from './Button';
import Alert from './Alert';
import Badge from './Badge';
import {
  listarDocumentosEmpleadoAPI,
  subirDocumentoEmpleadoAPI,
  eliminarDocumentoAPI,
  descargarDocumentoURL
} from '../../services/api';
import { toast } from '../../stores/useToastStore';

const CATEGORIAS = [
  { value: 'contrato', label: 'Contrato' },
  { value: 'cedula', label: 'Cédula' },
  { value: 'hoja_vida', label: 'Hoja de vida' },
  { value: 'certificacion', label: 'Certificación' },
  { value: 'habeas_data', label: 'Habeas Data' },
  { value: 'otro', label: 'Otro' }
];

const CATEGORY_LABEL = Object.fromEntries(CATEGORIAS.map((c) => [c.value, c.label]));

const formatBytes = (b) => {
  if (!b) return '0 B';
  const u = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(1024));
  return `${(b / Math.pow(1024, i)).toFixed(1)} ${u[i]}`;
};

const fechaCorta = (iso) => (iso ? new Date(iso).toLocaleDateString('es-CO') : '-');

/**
 * Modal de gestión documental de un empleado.
 * Props: employeeId, employeeName, onClose
 */
export default function EmployeeDocumentsModal({ employeeId, employeeName, onClose }) {
  const [docs, setDocs] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [categoria, setCategoria] = useState('otro');
  const [descripcion, setDescripcion] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [subiendo, setSubiendo] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);
  const cargar = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let active = true;
    const fetchDocs = () => {
      setCargando(true);
      setError('');
      listarDocumentosEmpleadoAPI(employeeId)
        .then((data) => { if (active) setDocs(data.documents || []); })
        .catch((e) => { if (active) setError(e.message); })
        .finally(() => { if (active) setCargando(false); });
    };
    fetchDocs();
    return () => { active = false; };
  }, [employeeId, reloadKey]);

  const subir = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Selecciona un archivo.');
      return;
    }
    setError('');
    setSubiendo(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('category', categoria);
      if (descripcion.trim()) fd.append('description', descripcion.trim());
      if (expiresAt) fd.append('expiresAt', expiresAt);

      await subirDocumentoEmpleadoAPI(employeeId, fd);
      toast.success('Documento subido', `${file.name} se almacenó correctamente.`);
      setFile(null);
      setDescripcion('');
      setExpiresAt('');
      setCategoria('otro');
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubiendo(false);
    }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este documento? Esta acción no se puede deshacer.')) return;
    try {
      await eliminarDocumentoAPI(id);
      toast.success('Documento eliminado', 'El archivo fue removido del repositorio.');
      await cargar();
    } catch (err) {
      toast.error('Error', err.message);
    }
  };

  return (
    <Modal titulo={`Documentos de ${employeeName || 'empleado'}`} onClose={onClose} ancho="720px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && <Alert tipo="error" onCerrar={() => setError('')}>{error}</Alert>}

        {/* Formulario de subida */}
        <form onSubmit={subir} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="field">
              <label className="field__label">Archivo *</label>
              <input
                type="file"
                className="field__input"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx"
                required
              />
              <span className="field__hint">PDF, imágenes o Office (máx 10 MB)</span>
            </div>
            <div className="field">
              <label className="field__label">Categoría</label>
              <select
                className="field__input field__select"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                {CATEGORIAS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
            <div className="field">
              <label className="field__label">Descripción</label>
              <input
                type="text"
                className="field__input"
                placeholder="Opcional"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field__label">Vence el</label>
              <input
                type="date"
                className="field__input"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" variante="primary" cargando={subiendo}>
            Subir documento
          </Button>
        </form>

        {/* Lista de documentos */}
        <div className="table-wrap" style={{ maxHeight: 320, overflow: 'auto' }}>
          {cargando ? (
            <p style={{ padding: 12, fontSize: 13, color: 'var(--text2)' }}>Cargando…</p>
          ) : docs.length === 0 ? (
            <p style={{ padding: 12, fontSize: 13, color: 'var(--text2)' }}>
              Aún no hay documentos cargados.
            </p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Tamaño</th>
                  <th>Subido</th>
                  <th>Vence</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d._id}>
                    <td className="table__primary">{d.originalName}</td>
                    <td><Badge texto={CATEGORY_LABEL[d.category] || d.category} tipo="info" /></td>
                    <td className="table__secondary">{formatBytes(d.size)}</td>
                    <td className="table__secondary">{fechaCorta(d.createdAt)}</td>
                    <td className="table__secondary">{fechaCorta(d.expiresAt)}</td>
                    <td>
                      <div className="table__actions" style={{ justifyContent: 'flex-end', gap: 4 }}>
                        <a
                          href={descargarDocumentoURL(d._id)}
                          className="table__btn"
                          title="Descargar"
                          target="_blank"
                          rel="noreferrer"
                        >
                          ⬇
                        </a>
                        <button
                          className="table__btn table__btn--delete"
                          title="Eliminar"
                          onClick={() => eliminar(d._id)}
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Modal>
  );
}
