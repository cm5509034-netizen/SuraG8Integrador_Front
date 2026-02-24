// ====================================
// LISTA MATRÍCULAS - MÓDULO SIMPLE
// Profesor: CRUD completo
// Estudiante: solo ve sus matrículas
// ====================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { matriculaService } from '../../services/matriculaService';
import './Matriculas.css';

function ListaMatricula() {
  const navigate   = useNavigate();
  const usuario    = JSON.parse(localStorage.getItem('usuario'));
  const esProfesor = usuario?.rol === 'Profesor';

  const [matriculas,   setMatriculas]   = useState([]);
  const [filtradas,    setFiltradas]    = useState([]);
  const [busqueda,     setBusqueda]     = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [cargando,     setCargando]     = useState(true);
  const [error,        setError]        = useState('');
  const [seleccionada, setSeleccionada] = useState(null);

  useEffect(() => { cargar(); }, []);

  useEffect(() => {
    let lista = matriculas;

    if (busqueda) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(m =>
        (m.nombreEstudiante || '').toLowerCase().includes(q) ||
        (m.nombreCurso      || '').toLowerCase().includes(q) ||
        (m.periodo          || '').toLowerCase().includes(q)
      );
    }

    if (filtroEstado) {
      lista = lista.filter(m => m.estado === filtroEstado);
    }

    setFiltradas(lista);
  }, [busqueda, filtroEstado, matriculas]);

  const cargar = async () => {
    setCargando(true);
    setError('');
    try {
      const data = await matriculaService.listarTodas();
      setMatriculas(data);
      setFiltradas(data);
    } catch {
      setError('No se pudieron cargar las matrículas. Verifica que el backend esté corriendo en el puerto 8080.');
    } finally {
      setCargando(false);
    }
  };

  const handleCancelar = async (id) => {
    if (!window.confirm('¿Estás seguro de cancelar esta matrícula?')) return;
    try {
      await matriculaService.cancelar(id);
      cargar();
    } catch {
      alert('Error al cancelar la matrícula');
    }
  };

  const estadosUnicos = [...new Set(matriculas.map(m => m.estado).filter(Boolean))];

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case 'Activa':     return 'badge-activa';
      case 'Cancelada':  return 'badge-cancelada';
      case 'Finalizada': return 'badge-finalizada';
      default:           return 'badge-pendiente';
    }
  };

  if (cargando) return (
    <div className="matriculas-container">
      <div className="cargando-container">
        <div className="spinner-global" />
        <p>Cargando matrículas...</p>
      </div>
    </div>
  );

  return (
    <div className="matriculas-container">

      {/* ENCABEZADO */}
      <div className="matriculas-header">
        <div className="matriculas-header-texto">
          <h2>Gestión de Matrículas</h2>
          <p className="matriculas-subtitulo">
            {matriculas.length} matrícula{matriculas.length !== 1 ? 's' : ''} registrada{matriculas.length !== 1 ? 's' : ''}
          </p>
        </div>
        {esProfesor && (
          <button className="btn-nueva-matricula" onClick={() => navigate('/matricula/crear')}>
            + Nueva Matrícula
          </button>
        )}
      </div>

      {/* FILTROS */}
      <div className="matriculas-filtros">
        <input
          className="matriculas-search"
          placeholder="Buscar por estudiante, curso o periodo..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        {estadosUnicos.length > 0 && (
          <select
            className="matriculas-select-filtro"
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {estadosUnicos.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        )}
      </div>

      {error && <div className="matriculas-error">{error}</div>}

      {!error && filtradas.length === 0 && (
        <div className="matriculas-vacio">
          <span className="matriculas-vacio-icono">📭</span>
          <p>No se encontraron matrículas con esos criterios.</p>
          {(busqueda || filtroEstado) && (
            <button className="btn-limpiar-filtros"
              onClick={() => { setBusqueda(''); setFiltroEstado(''); }}>
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* TABLA DE MATRÍCULAS */}
      {filtradas.length > 0 && (
        <div className="matriculas-tabla-wrapper">
          <table className="matriculas-tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Estudiante</th>
                <th>Curso</th>
                <th>Periodo</th>
                <th>Fecha Matrícula</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map(m => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.nombreEstudiante || '-'}</td>
                  <td>{m.nombreCurso || '-'}</td>
                  <td>{m.periodo || '-'}</td>
                  <td>{m.fechaMatricula || '-'}</td>
                  <td>
                    <span className={`badge-estado ${getEstadoBadgeClass(m.estado)}`}>
                      {m.estado || 'Pendiente'}
                    </span>
                  </td>
                  <td className="acciones-celda">
                    <button
                      className="btn-ver-detalle"
                      onClick={() => setSeleccionada(m)}
                    >
                      Ver
                    </button>
                    {esProfesor && (
                      <>
                        <button
                          className="btn-editar"
                          onClick={() => navigate(`/matricula/editar/${m.id}`)}
                        >
                          Editar
                        </button>
                        {m.estado !== 'Cancelada' && (
                          <button
                            className="btn-cancelar"
                            onClick={() => handleCancelar(m.id)}
                          >
                            Cancelar
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DETALLE */}
      {seleccionada && (
        <ModalDetalleMatricula
          matricula={seleccionada}
          esProfesor={esProfesor}
          onCerrar={() => setSeleccionada(null)}
          onEditar={() => { setSeleccionada(null); navigate(`/matricula/editar/${seleccionada.id}`); }}
        />
      )}
    </div>
  );
}

// ── MODAL DETALLE ─────────────────────────────
function ModalDetalleMatricula({ matricula, esProfesor, onCerrar, onEditar }) {
  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case 'Activa':     return 'badge-activa';
      case 'Cancelada':  return 'badge-cancelada';
      case 'Finalizada': return 'badge-finalizada';
      default:           return 'badge-pendiente';
    }
  };

  return (
    <div className="modal-overlay-matricula" onClick={onCerrar}>
      <div className="modal-matricula" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-matricula-header">
          <div>
            <h3>Detalle de Matrícula #{matricula.id}</h3>
            <span className={`badge-estado ${getEstadoBadgeClass(matricula.estado)}`}>
              {matricula.estado || 'Pendiente'}
            </span>
          </div>
          <button className="btn-cerrar-modal-matricula" onClick={onCerrar}>X</button>
        </div>

        {/* Body */}
        <div className="modal-matricula-body">
          <section className="modal-matricula-seccion">
            <h4>Información de la Matrícula</h4>
            <FilaDetalle label="Estudiante"       valor={matricula.nombreEstudiante} />
            <FilaDetalle label="ID Estudiante"    valor={matricula.estudianteId} />
            <FilaDetalle label="Curso"            valor={matricula.nombreCurso} />
            <FilaDetalle label="ID Curso"         valor={matricula.cursoId} />
            <FilaDetalle label="Periodo"          valor={matricula.periodo} />
            <FilaDetalle label="Fecha Matrícula"  valor={matricula.fechaMatricula} />
            <FilaDetalle label="Estado"           valor={matricula.estado} />
          </section>

          {matricula.observaciones && (
            <section className="modal-matricula-seccion">
              <h4>Observaciones</h4>
              <p className="modal-descripcion">{matricula.observaciones}</p>
            </section>
          )}
        </div>

        {/* Footer */}
        {esProfesor && (
          <div className="modal-matricula-footer">
            <button className="btn-matricula-editar-modal" onClick={onEditar}>
              Editar Matrícula
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilaDetalle({ label, valor }) {
  if (valor === null || valor === undefined || valor === '') return null;
  return (
    <div className="fila-detalle">
      <span className="fila-label">{label}:</span>
      <span className="fila-valor">{String(valor)}</span>
    </div>
  );
}

export default ListaMatricula;
