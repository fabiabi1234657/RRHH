/**
 * Layout.jsx - Shell principal de la aplicación autenticada.
 *
 * Compone el Sidebar fijo, la Topbar fija y el área de contenido
 * donde React Router renderiza la página activa vía <Outlet />.
 */
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar  from './Topbar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    /* Contenedor raíz del shell de la aplicación */
    <div className="layout">

      <div
        className={`layout__backdrop${sidebarOpen ? ' layout__backdrop--visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden={!sidebarOpen}
      />

      {/* Barra lateral fija con la navegación */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Columna principal: topbar + contenido de la página */}
      <div className="layout__main">

        {/* Barra superior fija con el título y controles */}
        <Topbar onMenuClick={() => setSidebarOpen((prev) => !prev)} />

        {/* Área de contenido desplazable — aquí se renderiza cada página */}
        <main className="layout__content fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}