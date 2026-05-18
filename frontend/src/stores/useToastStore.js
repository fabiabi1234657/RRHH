import { create } from 'zustand';

let nextId  = 1;
const LEAVE_MS  = 280;  // debe coincidir con CSS toastOut
const DEDUP_MS  = 800;  // ignora notificaciones idénticas dentro de este intervalo

// Timers fuera del store (evita condiciones de carrera con set() de Zustand)
let autoTimer  = null;
let leaveTimer = null;
let lastKey    = '';
let lastTime   = 0;

export const useToastStore = create((set, get) => ({
  toast: null, // un solo toast activo a la vez

  push(opts = {}) {
    const type     = opts.type  || 'info';
    const title    = opts.title || '';
    const msg      = opts.msg   || '';
    const duration = opts.duration ?? 4500;

    // Rate-limit: descarta notificaciones idénticas en rápida sucesión
    const key = `${type}|${title}|${msg}`;
    const now = Date.now();
    if (key === lastKey && now - lastTime < DEDUP_MS) return;
    lastKey  = key;
    lastTime = now;

    // Cancela timers pendientes del toast anterior
    clearTimeout(autoTimer);
    clearTimeout(leaveTimer);
    autoTimer  = null;
    leaveTimer = null;

    const id = nextId++;
    set({ toast: { id, type, title, msg, duration, leaving: false } });

    if (duration > 0) {
      autoTimer = setTimeout(() => get().dismiss(), duration);
    }
    return id;
  },

  dismiss() {
    const { toast: t } = get();
    if (!t || t.leaving) return;
    clearTimeout(autoTimer);
    autoTimer = null;
    set((s) => ({ toast: s.toast ? { ...s.toast, leaving: true } : null }));
    leaveTimer = setTimeout(() => set({ toast: null }), LEAVE_MS);
  },

  clear() {
    clearTimeout(autoTimer);
    clearTimeout(leaveTimer);
    autoTimer  = null;
    leaveTimer = null;
    set({ toast: null });
  },
}));

// Helpers de conveniencia
export const toast = {
  success: (title, msg, duration) =>
    useToastStore.getState().push({ type: 'success', title, msg, duration }),
  error: (title, msg, duration) =>
    useToastStore.getState().push({ type: 'error', title, msg, duration }),
  warning: (title, msg, duration) =>
    useToastStore.getState().push({ type: 'warning', title, msg, duration }),
  info: (title, msg, duration) =>
    useToastStore.getState().push({ type: 'info', title, msg, duration }),
};

