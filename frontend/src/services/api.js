/**
 * api.js — Capa central de comunicación con el backend de CorpHR.
 *
 * Todas las peticiones HTTP de la aplicación pasan por este módulo.
 * Usa Axios con la instancia preconfigurada en src/api/axios.ts
 * (baseURL: '/api', withCredentials: true).
 *
 * Entidades disponibles en el backend:
 *  - Auth         : POST /auth/login | register | logout | GET /auth/profile
 *  - Departamentos: CRUD en /departamentos
 *  - Cargos       : CRUD en /cargos  (populated con department)
 *  - Empleados    : CRUD en /empleados
 *  - Asistencia   : POST /attendance/checkin | PUT /attendance/checkout
 *  - Reportes     : GET /reports/...
 */

import api from '../api/axios';

const MENSAJES_HTTP = {
  400: 'Datos incorrectos. Revisa los campos e intenta de nuevo.',
  401: 'Credenciales incorrectas. Verifica tu correo y contraseña.',
  403: 'No tienes permiso para realizar esta accion.',
  404: 'El recurso solicitado no fue encontrado.',
  409: 'Ya existe un registro con esos datos.',
  422: 'Los datos ingresados no son validos.',
  429: 'Demasiados intentos. Espera un momento antes de continuar.',
  500: 'Error interno del servidor. Intenta mas tarde.',
  502: 'No se puede conectar al servidor. Verifica que el servicio este activo.',
  503: 'Servicio no disponible. Intenta mas tarde.',
};

function extraerMensaje(error) {
  if (error.response) {
    const { status, data } = error.response;
    return data?.message || MENSAJES_HTTP[status] || `Error del servidor (${status}).`;
  }
  if (error.request) {
    return 'No se puede conectar al servidor. Verifica que el servicio este activo.';
  }
  return error.message || 'Error desconocido.';
}

async function peticion(metodo, endpoint, datos = null) {
  try {
    const config = { method: metodo, url: endpoint };
    if (datos !== null) config.data = datos;
    const respuesta = await api(config);
    return respuesta.data;
  } catch (error) {
    throw new Error(extraerMensaje(error));
  }
}

/* AUTH */
export const loginAPI = (email, password) =>
  peticion('POST', '/auth/login', { email, password });

export const registrarAPI = (datos) =>
  peticion('POST', '/auth/register', datos);

export const registrarAdminAPI = (datos) =>
  peticion('POST', '/auth/register-admin', datos);

export const logoutAPI = () =>
  peticion('POST', '/auth/logout');

export const obtenerPerfilAPI = () =>
  peticion('GET', '/auth/profile');

export const actualizarPerfilAPI = (datos) =>
  peticion('PUT', '/auth/profile', datos);

export const recuperarContrasenaAPI = (email) =>
  peticion('POST', '/auth/recover', { email });

/* ASISTENCIA */
export const registrarEntradaAPI = (datos = {}) =>
  peticion('POST', '/attendance/checkin', datos);

export const registrarSalidaAPI = (datos = {}) =>
  peticion('PUT', '/attendance/checkout', datos);

export const obtenerAsistenciaPorFechaAPI = (date) =>
  peticion('GET', `/attendance/date/${encodeURIComponent(date)}`);

export const obtenerMiAsistenciaAPI = () =>
  peticion('GET', '/attendance/me');

export const obtenerAsistenciaEmpleadoAPI = (employeeId) =>
  peticion('GET', `/attendance/${employeeId}`);

/* REPORTES */
export const obtenerReporteAsistenciaMensualAPI = ({ month, year }) =>
  peticion('GET', `/reports/attendance/monthly?month=${encodeURIComponent(month)}&year=${encodeURIComponent(year)}`);

export const obtenerReporteHeadcountAPI = () =>
  peticion('GET', '/reports/headcount');

export const obtenerResumenEmpleadoAPI = (employeeId) =>
  peticion('GET', `/reports/employee/${employeeId}/summary`);

/* DEPARTAMENTOS — /departamentos */
export const obtenerDepartamentosAPI = () =>
  peticion('GET', '/departamentos');

export const obtenerDepartamentoPorIdAPI = (id) =>
  peticion('GET', `/departamentos/${id}`);

export const crearDepartamentoAPI = (datos) =>
  peticion('POST', '/departamentos', datos);

export const actualizarDepartamentoAPI = (id, datos) =>
  peticion('PUT', `/departamentos/${id}`, datos);

export const eliminarDepartamentoAPI = (id) =>
  peticion('DELETE', `/departamentos/${id}`);

/* CARGOS (POSICIONES) — /cargos */
export const obtenerPosicionesAPI = () =>
  peticion('GET', '/cargos');

export const obtenerPosicionPorIdAPI = (id) =>
  peticion('GET', `/cargos/${id}`);

export const crearPosicionAPI = (datos) =>
  peticion('POST', '/cargos', datos);

export const actualizarPosicionAPI = (id, datos) =>
  peticion('PUT', `/cargos/${id}`, datos);

export const eliminarPosicionAPI = (id) =>
  peticion('DELETE', `/cargos/${id}`);

/* EMPLEADOS — /empleados */
export const obtenerEmpleadosAPI = () =>
  peticion('GET', '/empleados');

export const obtenerEmpleadoPorIdAPI = (id) =>
  peticion('GET', `/empleados/${id}`);

export const crearEmpleadoAPI = (datos) =>
  peticion('POST', '/empleados', datos);

export const actualizarEmpleadoAPI = (id, datos) =>
  peticion('PUT', `/empleados/${id}`, datos);

export const eliminarEmpleadoAPI = (id) =>
  peticion('DELETE', `/empleados/${id}`);