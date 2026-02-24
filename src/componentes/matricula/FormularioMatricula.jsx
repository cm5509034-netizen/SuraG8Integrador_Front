// ====================================
// FORMULARIO MATRÍCULA - UNIFICADO
// Sirve para CREAR y EDITAR
// Solo accesible para rol Profesor
// ====================================

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { matriculaService } from '../../services/matriculaService';
import './Matriculas.css';

const FORM_INICIAL = {
  estudianteId:      '',
  nombreEstudiante:  '',
  cursoId:           '',
  nombreCurso:       '',
  periodo:           '',
  fechaMatricula:    '',
  estado:            'Activa',
  observaciones:     '',
};

function FormularioMatricula() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const modoEdicion = Boolean(id);

  const [formData,     setFormData]     = useState(FORM_INICIAL);
  const [mensaje,      setMensaje]      = useState('');
  const [tipoMsg,      setTipoMsg]      = useState('');
  const [cargando,     setCargando]     = useState(false);
  const [cargandoMatricula, setCargandoMatricula] = useState(modoEdicion);

  // En modo edición carga los datos de la matrícula
  useEffect(() => {
    if (!modoEdicion) return;
    const cargar = async () => {
      try {
        const m = await matriculaService.buscarPorId(id);
        setFormData({
          estudianteId:     m.estudianteId     || '',
          nombreEstudiante: m.nombreEstudiante || '',
          cursoId:          m.cursoId          || '',
          nombreCurso:      m.nombreCurso      || '',
          periodo:          m.periodo          || '',
          fechaMatricula:   m.fechaMatricula   || '',
          estado:           m.estado           || 'Activa',
          observaciones:    m.observaciones    || '',
          id:               m.id,
        });
      } catch {
        setMensaje('No se pudo cargar la matrícula. Verifica el backend.');
        setTipoMsg('error');
      } finally {
        setCargandoMatricula(false);
      }
    };
    cargar();
  }, [id, modoEdicion]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validar = () => {
    if (!formData.nombreEstudiante.trim()) return 'El nombre del estudiante es obligatorio.';
    if (!formData.nombreCurso.trim()) return 'El nombre del curso es obligatorio.';
    if (!formData.periodo.trim()) return 'El periodo académico es obligatorio.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorVal = validar();
    if (errorVal) { setMensaje(errorVal); setTipoMsg('error'); return; }

    setCargando(true);
    setMensaje('');

    const datos = {
      ...(modoEdicion && formData.id ? { id: formData.id } : {}),
      estudianteId:     formData.estudianteId     ? parseInt(formData.estudianteId) : null,
      nombreEstudiante: formData.nombreEstudiante,
      cursoId:          formData.cursoId          ? parseInt(formData.cursoId) : null,
      nombreCurso:      formData.nombreCurso,
      periodo:          formData.periodo,
      fechaMatricula:   formData.fechaMatricula   || null,
      estado:           formData.estado,
      observaciones:    formData.observaciones    || null,
    };

    try {
      if (modoEdicion) {
        await matriculaService.actualizar(datos);
        setMensaje('Matrícula actualizada exitosamente!');
      } else {
        await matriculaService.crear(datos);
        setMensaje('Matrícula creada exitosamente!');
      }
      setTipoMsg('exito');
      setTimeout(() => navigate('/matricula'), 1800);
    } catch (err) {
      setMensaje(err.message || 'Error al conectar con el backend. Verifica que esté corriendo en el puerto 8080.');
      setTipoMsg('error');
    } finally {
      setCargando(false);
    }
  };

  if (cargandoMatricula) return (
    <div className="matriculas-container">
      <div className="cargando-container">
        <div className="spinner-global" />
        <p>Cargando datos de la matrícula...</p>
      </div>
    </div>
  );

  return (
    <div className="matriculas-container">
      <div className="matricula-form-wrapper">

        {/* ENCABEZADO */}
        <div className="matricula-form-header">
          <h3>{modoEdicion ? 'Editar Matrícula' : 'Nueva Matrícula'}</h3>
          <p>{modoEdicion ? 'Modifica la información de la matrícula.' : 'Completa los datos de la nueva matrícula.'}</p>
        </div>

        {/* MENSAJE */}
        {mensaje && (
          <div className={`message-alert ${tipoMsg === 'exito' ? 'message-success' : 'message-error'}`}>
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="matricula-form">

          {/* ═══ INFORMACIÓN DEL ESTUDIANTE ═══ */}
          <fieldset>
            <legend>Información del Estudiante</legend>

            <div className="form-group">
              <label htmlFor="nombreEstudiante">Nombre del Estudiante *</label>
              <input id="nombreEstudiante" name="nombreEstudiante"
                value={formData.nombreEstudiante} onChange={handleChange}
                placeholder="Ej: Juan Pérez García" />
            </div>

            <div className="form-group">
              <label htmlFor="estudianteId">ID del Estudiante (opcional)</label>
              <input id="estudianteId" name="estudianteId" type="number"
                value={formData.estudianteId} onChange={handleChange}
                placeholder="ID numérico del estudiante" />
            </div>
          </fieldset>

          {/* ═══ INFORMACIÓN DEL CURSO ═══ */}
          <fieldset>
            <legend>Información del Curso</legend>

            <div className="form-group">
              <label htmlFor="nombreCurso">Nombre del Curso *</label>
              <input id="nombreCurso" name="nombreCurso"
                value={formData.nombreCurso} onChange={handleChange}
                placeholder="Ej: Introducción a la Programación" />
            </div>

            <div className="form-group">
              <label htmlFor="cursoId">ID del Curso (opcional)</label>
              <input id="cursoId" name="cursoId" type="number"
                value={formData.cursoId} onChange={handleChange}
                placeholder="ID numérico del curso" />
            </div>
          </fieldset>

          {/* ═══ DATOS DE LA MATRÍCULA ═══ */}
          <fieldset>
            <legend>Datos de la Matrícula</legend>

            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="periodo">Periodo Académico *</label>
                <input id="periodo" name="periodo"
                  value={formData.periodo} onChange={handleChange}
                  placeholder="Ej: 2026-1" />
              </div>

              <div className="form-group">
                <label htmlFor="fechaMatricula">Fecha de Matrícula</label>
                <input id="fechaMatricula" name="fechaMatricula" type="date"
                  value={formData.fechaMatricula} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label htmlFor="estado">Estado</label>
                <select id="estado" name="estado"
                  value={formData.estado} onChange={handleChange}>
                  <option value="Activa">Activa</option>
                  <option value="Cancelada">Cancelada</option>
                  <option value="Finalizada">Finalizada</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
              </div>
            </div>
          </fieldset>

          {/* ═══ OBSERVACIONES ═══ */}
          <fieldset>
            <legend>Observaciones</legend>
            <div className="form-group">
              <textarea id="observaciones" name="observaciones" rows="3"
                value={formData.observaciones} onChange={handleChange}
                placeholder="Notas adicionales sobre la matrícula..." />
            </div>
          </fieldset>

          {/* BOTONES */}
          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={cargando}>
              {cargando
                ? 'Guardando...'
                : modoEdicion ? 'Actualizar Matrícula' : 'Crear Matrícula'}
            </button>
            <button type="button" className="btn-cancel"
              onClick={() => navigate('/matricula')} disabled={cargando}>
              Cancelar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default FormularioMatricula;
