export const ENDPOINTS_API = {
  autenticacion: {
    iniciarSesion: '/api/autenticacion/iniciar-sesion',
    cerrarSesion: '/api/autenticacion/cerrar-sesion',
    perfil: '/api/autenticacion/perfil',
  },
  admin: {
    usuarios: '/admin/usuarios',
    roles: '/admin/roles',
    permisos: '/admin/permisos',
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