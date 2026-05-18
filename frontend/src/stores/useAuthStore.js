import { create } from 'zustand';
import {
  loginAPI,
  logoutAPI,
  obtenerPerfilAPI,
  verifyMfaLoginAPI
} from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  sessionRevision: 0,

  setSession: (user) => set((state) => ({
    user,
    isAuthenticated: !!user,
    sessionRevision: state.sessionRevision + 1,
  })),

  clearSession: (updates = {}) => set((state) => ({
    user: null,
    isAuthenticated: false,
    sessionRevision: state.sessionRevision + 1,
    ...updates,
  })),

  /**
   * Inicia sesión. Si la cuenta tiene MFA, devuelve:
   *   { mfaRequired: true, mfaToken }
   * En caso contrario devuelve:
   *   { user }
   */
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await loginAPI(email, password);

      if (data.mfaRequired) {
        set({ loading: false });
        return { mfaRequired: true, mfaToken: data.mfaToken };
      }

      if (!data.success || !data.user) {
        throw new Error(data.message || 'Credenciales invalidas');
      }
      get().setSession(data.user);
      set({ loading: false });
      return { user: data.user };
    } catch (error) {
      get().clearSession({
        loading: false,
        error: error.message,
      });
      throw error;
    }
  },

  verifyMfaLogin: async (mfaToken, code) => {
    set({ loading: true, error: null });
    try {
      const data = await verifyMfaLoginAPI(mfaToken, code);
      if (!data.success || !data.user) {
        throw new Error(data.message || 'Código inválido');
      }
      get().setSession(data.user);
      set({ loading: false });
      return data.user;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await logoutAPI();
    } finally {
      get().clearSession({
        loading: false,
        error: null,
      });
    }
  },

  checkAuth: async () => {
    const startedRevision = get().sessionRevision;
    set({ loading: true, error: null });
    try {
      const data = await obtenerPerfilAPI();
      const user = data.success ? data.user : null;

      if (get().sessionRevision !== startedRevision) {
        set({ loading: false });
        return get().user;
      }

      get().setSession(user);
      set({ loading: false });
      return user;
    } catch {
      if (get().sessionRevision !== startedRevision) {
        set({ loading: false });
        return get().user;
      }

      get().clearSession({ loading: false });
      return null;
    }
  },

  refrescarPerfil: async () => get().checkAuth(),
  esAdmin: () => get().user?.role === 'admin',
  esEmpleado: () => get().user?.role === 'employee',
}));
