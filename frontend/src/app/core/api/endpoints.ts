export const ENDPOINTS_API = {
  autenticacion: {
    iniciarSesion: '/api/autenticacion/iniciar-sesion',
    registroCliente: '/api/autenticacion/registro-cliente',
    cerrarSesion: '/api/autenticacion/cerrar-sesion',
    perfil: '/api/autenticacion/perfil',
    cambiarContrasena: '/api/autenticacion/cambiar-contrasena',
  },
  admin: {
    usuarios: '/api/admin/usuarios',
    estadoUsuario: (id: number | string) => `/api/admin/usuarios/${id}/estado`,
    bitacora: '/api/admin/bitacora',
    roles: '/api/admin/roles',
    permisos: '/api/admin/permisos',
  },
  recepcion: {
    reservas: '/recepcion/reservas',
    disponibilidad: '/recepcion/disponibilidad',
    invitados: '/recepcion/invitados',
    checkin: '/recepcion/checkin',
    checkout: '/recepcion/checkout',
  },
  caja: {
    facturacion: '/caja/facturacion',
    pagos: '/caja/pagos',
    corte: '/caja/corte',
    reportes: '/caja/reportes',
  },
  limpieza: {
    habitaciones: '/limpieza/habitaciones',
    estadoHabitacion: (id: number | string) => `/limpieza/habitaciones/${id}/estado`,
    estados: '/limpieza/estados',
  },
  cliente: {
    perfil: '/cliente/perfil',
    reservas: '/cliente/reservas',
    facturas: '/cliente/facturas',
    pagos: '/cliente/pagos',
  },
} as const;