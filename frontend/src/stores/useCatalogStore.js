import { create } from 'zustand';
import { obtenerDepartamentosAPI, obtenerPosicionesAPI } from '../services/api';

export const useCatalogStore = create((set) => ({
  departments: [],
  positions: [],
  loading: false,
  error: null,

  fetchCatalogs: async () => {
    set({ loading: true, error: null });
    try {
      const [departmentsResponse, positionsResponse] = await Promise.all([
        obtenerDepartamentosAPI(),
        obtenerPosicionesAPI(),
      ]);

      const departments = departmentsResponse.departments ?? [];
      const positions = positionsResponse.positions ?? [];
      set({ departments, positions, loading: false });
      return { departments, positions };
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));
