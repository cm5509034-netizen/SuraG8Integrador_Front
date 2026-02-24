// ====================================
// NAVBAR - MENÚ ACORDEÓN CON SCROLL
// Secciones colapsables por módulo
// ====================================

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './Navbar.css';
import logoSura from '../../imagenes/logo-sura-white.png';

const SECCIONES_COMUNES = [
  { id: 'home',     icono: '🏠', label: 'Home',     ruta: '/home' },
  { id: 'usuarios', icono: '👤', label: 'Usuarios', ruta: '/usuarios' },
];

const SECCIONES_MODULOS = [
  {
    id: 'notificaciones',
    icono: '📧',
    label: 'Notificaciones',
    soloProfesor: false,
    proximamente: false,
    items: [
      { label: 'Ver Notificaciones', ruta: '/notificaciones',       soloProfesor: false },
      { label: 'Nueva Notificación', ruta: '/notificaciones/crear', soloProfesor: true  },
    ],
  },
  {
    // ✅ ACTIVADO: proximamente: false
    id: 'profesores',
    icono: '🎓',
    label: 'Profesores',
    soloProfesor: false,
    proximamente: false,
    items: [
      { label: 'Ver Profesores', ruta: '/profesores',       soloProfesor: false },
      { label: 'Nuevo Profesor', ruta: '/profesores/crear', soloProfesor: true  },
    ],
  },
  {
    // 🚫 DESACTIVADO: módulo Asistencias aún no implementado
    id: 'asistencias',
    icono: '📋',
    label: 'Asistencias',
    soloProfesor: false,
    proximamente: true,
    items: [
      { label: 'Ver Asistencias', ruta: '/asistencias',       soloProfesor: false },
      { label: 'Nueva Asistencia', ruta: '/asistencias/crear', soloProfesor: true  },
    ],
  }
,
  {
    // ✅ ACTIVADO: módulo Cursos integrado
    id: 'cursos',
    icono: '📖',
    label: 'Cursos',
    soloProfesor: false,
    proximamente: false,
    items: [
      { label: 'Ver Cursos',   ruta: '/cursos',       soloProfesor: false },
      { label: 'Nuevo Curso',  ruta: '/cursos/crear', soloProfesor: true  },
    ],
  },
  {
    // ✅ ACTIVADO: módulo Notas integrado
    id: 'notas',
    icono: '📝',
    label: 'Notas',
    soloProfesor: false,
    proximamente: false, // 🔥 ACTIVADO
    items: [
      { label: 'Ver Notas',  ruta: '/notas',       soloProfesor: false },
      { label: 'Nueva Nota', ruta: '/notas/crear', soloProfesor: true  },
    ],
  },
  {
    // ✅ ACTIVADO: módulo Matrícula integrado
    id: 'matricula',
    icono: '🏫',
    label: 'Matrícula',
    soloProfesor: false,
    proximamente: false,
    items: [
      { label: 'Ver Matrículas',  ruta: '/matricula',       soloProfesor: false },
      { label: 'Nueva Matrícula', ruta: '/matricula/crear', soloProfesor: true  },
    ],
  },
  {
    // ✅ ACTIVADO: módulo Reportes integrado (solo Profesor)
    id: 'reportes',
    icono: '📊',
    label: 'Reportes Estadísticos',
    soloProfesor: true,
    proximamente: false,
    items: [
      { label: 'Ver Reportes', ruta: '/reportes', soloProfesor: true },
    ],
  },
];

function Navbar() {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [expandidos,  setExpandidos]  = useState({});

  const usuario    = JSON.parse(localStorage.getItem('usuario'));
  const esProfesor = usuario?.rol === 'Profesor';

  const salir = () => {
    localStorage.removeItem('usuario');
    navigate('/');
  };

  const redirigir = (ruta) => {
    navigate(ruta);
    setMenuAbierto(false);
    setExpandidos({});
  };

  const toggleSeccion = (id) => {
    setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      {menuAbierto && (
        <div
          className="menu-overlay"
          onClick={() => { setMenuAbierto(false); setExpandidos({}); }}
          aria-hidden="true"
        />
      )}

      <nav className="navbar">
        <div className="navbar-sura-izquierda">
          <img
            src={logoSura}
            alt="Logo Sura"
            className="logo-sura-navbar"
            onClick={() => redirigir('/home')}
            style={{ cursor: 'pointer' }}
          />
          <h3>Hola, {usuario?.nombre}</h3>
          <span className="badge-rol">{usuario?.rol}</span>
        </div>

        <div className="acciones-derecha">
          <div className="contenedor-menu">
            <button
              className="boton-menu"
              onClick={() => setMenuAbierto(!menuAbierto)}
              aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuAbierto}
            >
              {menuAbierto ? '✕' : '☰'}
            </button>

            {menuAbierto && (
              <div className="menu-lateral">

                {/* ENCABEZADO FIJO */}
                <div className="menu-panel-header">
                  <span className="menu-panel-titulo">Menú</span>
                  <span className="badge-rol-panel">{usuario?.rol}</span>
                </div>

                {/* ZONA SCROLLEABLE */}
                <div className="menu-scroll-area">

                  {/* Ítems directos */}
                  {SECCIONES_COMUNES.map((sec) => (
                    <div
                      key={sec.id}
                      className="menu-item-directo"
                      onClick={() => redirigir(sec.ruta)}
                    >
                      <span className="menu-item-icono">{sec.icono}</span>
                      <span>{sec.label}</span>
                      <span className="menu-item-arrow">›</span>
                    </div>
                  ))}

                  <div className="menu-divisor" />

                  {/* Secciones acordeón */}
                  {SECCIONES_MODULOS.map((seccion) => {
                    if (seccion.soloProfesor && !esProfesor) return null;

                    const abierto = !!expandidos[seccion.id];

                    return (
                      <div key={seccion.id} className="menu-acordeon">
                        <button
                          className={`menu-acordeon-header ${abierto ? 'abierto' : ''}`}
                          onClick={() => toggleSeccion(seccion.id)}
                          aria-expanded={abierto}
                        >
                          <div className="menu-acordeon-titulo">
                            <span className="menu-item-icono">{seccion.icono}</span>
                            <span>{seccion.label}</span>
                            {seccion.proximamente && (
                              <span className="badge-prox-menu">Próx.</span>
                            )}
                          </div>
                          <span className={`menu-chevron ${abierto ? 'rotado' : ''}`}>›</span>
                        </button>

                        {abierto && (
                          <div className="menu-acordeon-body">
                            {seccion.items.map((item) => {
                              if (item.soloProfesor && !esProfesor) return null;
                              const deshabilitado = seccion.proximamente;

                              return (
                                <div
                                  key={item.ruta}
                                  className={`menu-subitem ${deshabilitado ? 'menu-subitem-deshabilitado' : ''}`}
                                  onClick={() => !deshabilitado && redirigir(item.ruta)}
                                >
                                  <span className="menu-subitem-bullet">▸</span>
                                  <span>{item.label}</span>
                                  {deshabilitado && (
                                    <span className="badge-prox-menu">Próx.</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                </div>{/* fin scroll-area */}

                {/* PIE FIJO: cerrar sesión */}
                <div className="menu-pie">
                  <button className="btn-cerrar-sesion" onClick={salir}>
                    <span>🚪</span>
                    <span>Cerrar sesión</span>
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
