/**
 * Layout.jsx ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Shell principal de la aplicacion autenticada.
 *
 * Compone el Sidebar fijo, la Topbar fija y el area de contenido
 * donde React Router renderiza la pagina activa via <Outlet />.
 */
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar  from './Topbar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    /* Contenedor raiz del shell de la aplicacion */
    <div className="layout">

      <div
        className={`layout__backdrop${sidebarOpen ? ' layout__backdrop--visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden={!sidebarOpen}
      />

      {/* Barra lateral fija con la navegacion */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Columna principal: topbar + contenido de la pagina */}
      <div className="layout__main">

        {/* Barra superior fija con el titulo y controles */}
        <Topbar onMenuClick={() => setSidebarOpen((prev) => !prev)} />

        {/* Area de contenido desplazable ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â aqui se renderiza cada pagina */}
        <main className="layout__content fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}