import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ui/ThemeToggle';

const IcoUsers = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoBuilding = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M9 9h1m-1 4h1m4-4h1m-1 4h1"/></svg>;
const IcoClock = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoChart = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcoShield = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcoBriefcase = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>;
const IcoCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

const ADMIN_FEATURES = [
  'Panel de control con métricas del equipo',
  'Gestión de empleados, cargos y departamentos',
  'Consulta diaria de asistencia del personal',
  'Reportes mensuales y distribución por áreas',
  'Cuentas de acceso con roles diferenciados',
];

const EMP_FEATURES = [
  'Consulta del perfil personal',
  'Registro de entrada y salida',
  'Historial de asistencia propio',
  'Sesión segura con credenciales individuales',
];

const MODULOS = [
  {
    icono: <IcoUsers />,
    color: 'accent',
    titulo: 'Empleados',
    desc: 'Consulta y organiza la información del personal con datos laborales, contacto, área y cargo asociado.',
  },
  {
    icono: <IcoBuilding />,
    color: 'info',
    titulo: 'Departamentos',
    desc: 'Estructura las áreas de la organización y mantén una lectura clara de la distribución interna.',
  },
  {
    icono: <IcoBriefcase />,
    color: 'purple',
    titulo: 'Cargos',
    desc: 'Administra posiciones, salarios, responsabilidades y relación directa con cada departamento.',
  },
  {
    icono: <IcoClock />,
    color: 'success',
    titulo: 'Asistencia',
    desc: 'Controla entradas, salidas, ausencias y llegadas tarde desde vistas para administración y empleados.',
  },
  {
    icono: <IcoChart />,
    color: 'warning',
    titulo: 'Reportes',
    desc: 'Revisa indicadores mensuales, cumplimiento de asistencia y headcount por departamento.',
  },
  {
    icono: <IcoShield />,
    color: 'danger',
    titulo: 'Accesos por rol',
    desc: 'Separa la experiencia de administración y autoservicio con permisos definidos desde el backend.',
  },
];

/* Anillo de progreso SVG para la tarjeta de asistencia */
function RingChart({ pct = 92 }) {
  const r = 36, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" className="hero-ring">
      <circle cx="48" cy="48" r={r} stroke="rgba(99,102,241,0.14)" strokeWidth="8" />
      <circle cx="48" cy="48" r={r} stroke="url(#rg)" strokeWidth="8"
        strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ * 0.25}
        strokeLinecap="round" />
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="96" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>
      <text x="48" y="52" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="800" fontFamily="Sora,sans-serif">{pct}%</text>
    </svg>
  );
}

function HeroVisual() {
  const avatars = ['CM', 'MR', 'VG', 'NH'];
  const bars = [
    { label: 'Operaciones', pct: 78, col: '#6366F1' },
    { label: 'Tecnología', pct: 92, col: '#A855F7' },
    { label: 'Finanzas', pct: 55, col: '#06B6D4' },
  ];

  return (
    <div className="hero-visual" aria-hidden="true">
      {/* Orbes de fondo */}
      <div className="hero-visual__orb hero-visual__orb--a" />
      <div className="hero-visual__orb hero-visual__orb--b" />

      {/* Tarjeta 1 — Asistencia (anillo) */}
      <div className="hero-visual__card hero-visual__card--ring">
        <div className="hero-visual__card-header">
          <span className="hero-visual__card-label">Asistencia hoy</span>
          <span className="hero-visual__dot hero-visual__dot--green" />
        </div>
        <div className="hero-visual__ring-wrap">
          <RingChart pct={92} />
        </div>
        <p className="hero-visual__card-sub">23 de 25 empleados presentes</p>
      </div>

      {/* Tarjeta 2 — Equipo */}
      <div className="hero-visual__card hero-visual__card--team">
        <div className="hero-visual__card-header">
          <span className="hero-visual__card-label">Equipo activo</span>
        </div>
        <div className="hero-visual__val">24</div>
        <div className="hero-visual__avatars">
          {avatars.map((a, i) => (
            <span key={a} className="hero-visual__av" style={{ zIndex: 4 - i }}>{a}</span>
          ))}
          <span className="hero-visual__av hero-visual__av--more">+8</span>
        </div>
      </div>

      {/* Tarjeta 3 — Departamentos */}
      <div className="hero-visual__card hero-visual__card--depts">
        <div className="hero-visual__card-header">
          <span className="hero-visual__card-label">Departamentos</span>
          <span className="hero-visual__badge">5 áreas</span>
        </div>
        <div className="hero-visual__bars">
          {bars.map(({ label, pct, col }) => (
            <div key={label} className="hero-visual__bar-row">
              <span className="hero-visual__bar-name">{label}</span>
              <div className="hero-visual__bar-track">
                <div className="hero-visual__bar-fill" style={{ width: `${pct}%`, background: col }} />
              </div>
              <span className="hero-visual__bar-pct">{pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tarjeta 4 — Estado del sistema (pequeña) */}
      <div className="hero-visual__card hero-visual__card--status">
        <span className="hero-visual__dot hero-visual__dot--green" />
        <span className="hero-visual__status-text">Sistema operativo</span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="home">
      <nav className="home-nav">
        <Link to="/" className="home-nav__brand" aria-label="CorpHR inicio">
          <div className="home-nav__logo">CH</div>
          <span className="home-nav__name">CorpHR</span>
        </Link>
        <ThemeToggle />
        <Link to="/login" className="home-nav__link">Iniciar sesión</Link>
      </nav>

      <main>
      <section className="home-hero">        <HeroVisual />
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">Sistema de gestión de recursos humanos</p>
          <h1 className="home-hero__title">CorpHR</h1>
          <p className="home-hero__sub">
            Gestiona empleados, cargos y departamentos con control de asistencia en tiempo real, reportes mensuales y acceso diferenciado por roles. Toda la operación de RRHH sin complejidad.
          </p>


        </div>
      </section>

      <section className="home-section">
        <div className="home-section__head">
          <p className="home-section__eyebrow">Módulos activos</p>
          <h2 className="home-section__title">Todo el flujo de RRHH en una interfaz consistente</h2>
          <p className="home-section__sub">Cada módulo está conectado al backend y preparado para revisar la experiencia completa desde el frontend.</p>
        </div>
        <div className="home-modules">
          {MODULOS.map(({ icono, color, titulo, desc }) => (
            <article key={titulo} className={`home-module home-module--${color}`}>
              <div className="home-module__icon">{icono}</div>
              <h3 className="home-module__title">{titulo}</h3>
              <p className="home-module__desc">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section home-section--roles">
        <div className="home-section__head">
          <p className="home-section__eyebrow">Acceso por perfil</p>
          <h2 className="home-section__title">Administrador y empleado trabajan desde el mismo sistema</h2>
          <p className="home-section__sub">La navegación se adapta al rol para mantener simple lo que cada usuario necesita hacer.</p>
        </div>
        <div className="home-roles">
          <article className="home-role">
            <div className="home-role__header">
              <div className="home-role__icon"><IcoShield /></div>
              <div>
                <h3 className="home-role__title">Administrador</h3>
                <p className="home-role__sub">Control operativo del sistema</p>
              </div>
            </div>
            <ul className="home-role__list">
              {ADMIN_FEATURES.map(feature => (
                <li key={feature}><span><IcoCheck /></span>{feature}</li>
              ))}
            </ul>
          </article>

          <article className="home-role">
            <div className="home-role__header">
              <div className="home-role__icon"><IcoUsers /></div>
              <div>
                <h3 className="home-role__title">Empleado</h3>
                <p className="home-role__sub">Autoservicio personal</p>
              </div>
            </div>
            <ul className="home-role__list">
              {EMP_FEATURES.map(feature => (
                <li key={feature}><span><IcoCheck /></span>{feature}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      </main>

      <footer className="home-footer">
        <div className="home-footer__brand">
          <div className="home-nav__logo">CH</div>
          <span>CorpHR</span>
        </div>
        <p>© {new Date().getFullYear()} CorpHR - Sistema de Gestión de Recursos Humanos.</p>
      </footer>
    </div>
  );
}
