import { create } from 'zustand';
import {
  obtenerPosicionesAPI,
  crearPosicionAPI,
  actualizarPosicionAPI,
  eliminarPosicionAPI,
} from '../services/api';

export const usePositionStore = create((set, get) => ({
  positions: [],
  loading: false,
  error: null,

  fetchPositions: async () => {
    set({ loading: true, error: null });
    try {
      const data = await obtenerPosicionesAPI();
      set({ positions: data.positions ?? [], loading: false });
      return data.positions ?? [];
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createPosition: async (payload) => {
    await crearPosicionAPI(payload);
    return get().fetchPositions();
  },

  updatePosition: async (id, payload) => {
    await actualizarPosicionAPI(id, payload);
    return get().fetchPositions();
  },

  deletePosition: async (id) => {
    await eliminarPosicionAPI(id);
    return get().fetchPositions();
  },

  clearPositionError: () => set({ error: null }),
}));
