/**
 * GenerateReports.jsx — Generación de reportes PDF y Excel (CSV).
 */
import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  obtenerReporteAsistenciaMensualAPI,
  obtenerReporteHeadcountAPI,
} from '../services/api.js';

/* ── Iconos ── */
const IcoPDF = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="9" y1="15" x2="15" y2="15"/>
    <line x1="9" y1="11" x2="15" y2="11"/>
    <line x1="9" y1="19" x2="12" y2="19"/>
  </svg>
);
const IcoExcel = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M3 9h18M9 21V9M15 21V9"/>
  </svg>
);
const IcoPreview = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IcoAttendance = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <path d="M9 16l2 2 4-4"/>
  </svg>
);
const IcoHeadcount = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

/* ── Helpers ── */
const MONTHS = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

const now = new Date();
const CURRENT_YEAR = now.getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

function downloadCSV(rows, filename) {
  const csv = rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Generadores PDF ── */
function buildAttendancePDF(data, month, year) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm' });
  const monthLabel = MONTHS[month - 1];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('CorpHR — Reporte de Asistencia Mensual', 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Período: ${monthLabel} ${year}   |   Total empleados: ${data.totalEmployees}`, 14, 28);
  doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, 14, 34);

  autoTable(doc, {
    startY: 42,
    head: [['Nombre', 'Email', 'Departamento', 'Cargo', 'Presentes', 'Ausentes', 'Tardanzas', 'Total días']],
    body: data.data.map(e => [
      e.name, e.email, e.department, e.position,
      e.present, e.absent, e.late, e.totalDays,
    ]),
    headStyles: { fillColor: [99, 102, 241], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [245, 245, 250] },
    styles: { cellPadding: 3 },
  });

  doc.save(`CorpHR_Asistencia_${monthLabel}_${year}.pdf`);
}

function buildHeadcountPDF(data) {
  const doc = new jsPDF({ unit: 'mm' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('CorpHR — Headcount por Departamento', 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Total empleados: ${data.totalEmployees}   |   Generado: ${new Date().toLocaleString('es-CO')}`, 14, 28);

  autoTable(doc, {
    startY: 36,
    head: [['Departamento', 'Empleados']],
    body: data.departments.map(d => [d.departmentName, d.headcount]),
    headStyles: { fillColor: [99, 102, 241], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 250] },
    columnStyles: { 1: { halign: 'center', fontStyle: 'bold' } },
  });

  doc.save(`CorpHR_Headcount.pdf`);
}

/* ── Componente principal ── */
export default function GenerateReports() {
  const [reportType, setReportType] = useState('attendance');
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  const reportTypes = [
    { id: 'attendance', label: 'Asistencia Mensual', desc: 'Presencias, ausencias y tardanzas por empleado en un mes.', Icon: IcoAttendance },
    { id: 'headcount', label: 'Headcount por Departamento', desc: 'Número de empleados activos agrupados por área.', Icon: IcoHeadcount },
  ];

  async function handlePreview() {
    setError('');
    setPreview(null);
    setLoading(true);
    try {
      let data;
      if (reportType === 'attendance') {
        data = await obtenerReporteAsistenciaMensualAPI({ month, year });
      } else {
        data = await obtenerReporteHeadcountAPI();
      }
      setPreview(data);
    } catch (e) {
      setError(e.message || 'Error al obtener datos del servidor.');
    } finally {
      setLoading(false);
    }
  }

  function handlePDF() {
    if (!preview) return;
    if (reportType === 'attendance') buildAttendancePDF(preview, month, year);
    else buildHeadcountPDF(preview);
  }

  function handleExcel() {
    if (!preview) return;
    if (reportType === 'attendance') {
      const header = ['Nombre', 'Email', 'Departamento', 'Cargo', 'Presentes', 'Ausentes', 'Tardanzas', 'Total días'];
      const rows = preview.data.map(e => [e.name, e.email, e.department, e.position, e.present, e.absent, e.late, e.totalDays]);
      downloadCSV([header, ...rows], `CorpHR_Asistencia_${MONTHS[month - 1]}_${year}.csv`);
    } else {
      const header = ['Departamento', 'Empleados'];
      const rows = preview.departments.map(d => [d.departmentName, d.headcount]);
      downloadCSV([header, ...rows], 'CorpHR_Headcount.csv');
    }
  }

  /* Preview tables */
  const previewTable = preview ? (
    reportType === 'attendance' ? (
      <div className="gr-table-wrap">
        <table className="gr-table">
          <thead>
            <tr>
              <th>Nombre</th><th>Email</th><th>Departamento</th>
              <th>Cargo</th><th>Pres.</th><th>Aus.</th><th>Tarde</th><th>Total</th>
            </tr>
          </thead>
          <tbody>
            {preview.data.map((e, i) => (
              <tr key={e.employeeId ?? i}>
                <td>{e.name}</td>
                <td className="gr-muted">{e.email}</td>
                <td>{e.department}</td>
                <td>{e.position}</td>
                <td className="gr-center gr-success">{e.present}</td>
                <td className="gr-center gr-danger">{e.absent}</td>
                <td className="gr-center gr-warning">{e.late}</td>
                <td className="gr-center">{e.totalDays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="gr-table-wrap gr-table-wrap--sm">
        <table className="gr-table">
          <thead>
            <tr><th>Departamento</th><th>Empleados</th></tr>
          </thead>
          <tbody>
            {preview.departments.map((d) => (
              <tr key={d.departmentId ?? d.departmentName}>
                <td>{d.departmentName}</td>
                <td className="gr-center"><span className="gr-badge">{d.headcount}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="gr-total">Total de empleados: <strong>{preview.totalEmployees}</strong></p>
      </div>
    )
  ) : null;

  return (
    <div className="gr-page">
      {/* Encabezado */}
      <div className="gr-header">
        <h1 className="gr-header__title">Generar Reportes</h1>
        <p className="gr-header__sub">Exporta datos operativos del sistema en PDF o Excel (CSV).</p>
      </div>

      <div className="gr-body">
        {/* Tipo de reporte */}
        <section className="gr-section">
          <h2 className="gr-section__label">Tipo de reporte</h2>
          <div className="gr-type-grid">
            {reportTypes.map(({ id, label, desc, Icon }) => (
              <button
                key={id}
                className={`gr-type-card${reportType === id ? ' gr-type-card--active' : ''}`}
                onClick={() => { setReportType(id); setPreview(null); setError(''); }}
              >
                <span className="gr-type-icon"><Icon /></span>
                <span className="gr-type-text">
                  <span className="gr-type-label">{label}</span>
                  <span className="gr-type-desc">{desc}</span>
                </span>
                {reportType === id && <span className="gr-type-check" aria-hidden="true">✓</span>}
              </button>
            ))}
          </div>
        </section>

        {/* Configuración */}
        <section className="gr-section">
          <h2 className="gr-section__label">Configuración</h2>
          <div className="gr-config">
            {reportType === 'attendance' && (
              <>
                <label className="gr-field">
                  <span>Mes</span>
                  <select value={month} onChange={e => { setMonth(+e.target.value); setPreview(null); }}>
                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                </label>
                <label className="gr-field">
                  <span>Año</span>
                  <select value={year} onChange={e => { setYear(+e.target.value); setPreview(null); }}>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </label>
              </>
            )}
            <button className="gr-btn gr-btn--preview" onClick={handlePreview} disabled={loading}>
              {loading ? <span className="gr-spinner" /> : <IcoPreview />}
              {loading ? 'Cargando...' : 'Obtener vista previa'}
            </button>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="gr-error" role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {/* Vista previa */}
        {preview && (
          <section className="gr-section gr-section--preview">
            <div className="gr-preview-head">
              <h2 className="gr-section__label">Vista previa</h2>
              <div className="gr-actions">
                <button className="gr-btn gr-btn--pdf" onClick={handlePDF}>
                  <IcoPDF /> Descargar PDF
                </button>
                <button className="gr-btn gr-btn--excel" onClick={handleExcel}>
                  <IcoExcel /> Descargar Excel (.csv)
                </button>
              </div>
            </div>
            {previewTable}
          </section>
        )}
      </div>
    </div>
  );
}
