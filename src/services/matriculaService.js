// ====================================
// SERVICIO DE MATRÍCULAS - UNIFICADO
// Mismo patrón que cursoService, profesorService, etc.
// ====================================

const API_URL = 'http://localhost:8080/apisurag8/v1/matricula';

export const matriculaService = {

  // ========== LISTAR TODAS (GET) ==========
  listarTodas: async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Error al obtener las matrículas');
      return await response.json();
    } catch (error) {
      console.error('Error en listarTodas():', error);
      throw error;
    }
  },

  // ========== BUSCAR POR ID (GET) ==========
  buscarPorId: async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) throw new Error(`No se encontró la matrícula con ID ${id}`);
      return await response.json();
    } catch (error) {
      console.error('Error en buscarPorId():', error);
      throw error;
    }
  },

  // ========== CREAR (POST) ==========
  crear: async (matricula) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matricula),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al crear la matrícula');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en crear():', error);
      throw error;
    }
  },

  // ========== ACTUALIZAR (POST con id - JPA save()) ==========
  actualizar: async (matricula) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matricula),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al actualizar la matrícula');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en actualizar():', error);
      throw error;
    }
  },

  // ========== CANCELAR (cambiar estado a "Cancelada") ==========
  cancelar: async (id) => {
    try {
      const matricula = await matriculaService.buscarPorId(id);
      const actualizada = { ...matricula, estado: 'Cancelada' };
      return await matriculaService.actualizar(actualizada);
    } catch (error) {
      console.error('Error en cancelar():', error);
      throw error;
    }
  },
};
