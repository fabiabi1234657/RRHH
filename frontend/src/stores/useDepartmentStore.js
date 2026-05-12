import { create } from 'zustand';
import {
  obtenerDepartamentosAPI,
  crearDepartamentoAPI,
  actualizarDepartamentoAPI,
  eliminarDepartamentoAPI,
} from '../services/api';

export const useDepartmentStore = create((set, get) => ({
  departments: [],
  loading: false,
  error: null,

  fetchDepartments: async () => {
    set({ loading: true, error: null });
    try {
      const data = await obtenerDepartamentosAPI();
      set({ departments: data.departments ?? [], loading: false });
      return data.departments ?? [];
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createDepartment: async (payload) => {
    await crearDepartamentoAPI(payload);
    return get().fetchDepartments();
  },

  updateDepartment: async (id, payload) => {
    await actualizarDepartamentoAPI(id, payload);
    return get().fetchDepartments();
  },

  deleteDepartment: async (id) => {
    await eliminarDepartamentoAPI(id);
    return get().fetchDepartments();
  },

  clearDepartmentError: () => set({ error: null }),
}));
