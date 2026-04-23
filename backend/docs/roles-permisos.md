# Roles y permisos del hotel

## Roles

- Administrador
- Gerente
- Recepcionista
- Limpieza
- Huesped

## Cuentas iniciales

- `admin@gmail.com` / `admin123`
- `gerente@gmail.com` / `gerente123`
- `recep@gmail.com` / `recep123`
- `limpieza@gmail.com` / `limp123`
- `itahy@gmail.com` / `itahy123`

## Matriz por modulos

### Administrador

Acceso total a todos los permisos del sistema.

### Gerente

Acceso total a todos los permisos del sistema.

### Recepcionista

- reservas.leer
- reservas.crear
- reservas.actualizar
- reservas.cancelar
- reservas.asignar_habitaciones
- disponibilidad.leer
- invitados.leer
- invitados.crear
- invitados.actualizar
- alojamientos.checkin
- alojamientos.checkout
- habitaciones.leer
- rooms.change_status
- facturas.leer
- facturas.generar
- facturas.emitir
- facturas.cancelar
- pagos.leer
- pagos.crear
- cierre_de_efectivo.leer
- cierre_de_efectivo.generar
- informes.leer
- informes.exportar

### Limpieza

- habitaciones.leer
- rooms.change_status
- estancias.leer

### Huesped

- perfil.leer
- perfil.actualizar
- reservas.crear
- reservas.leer_own
- reservas.cancelar_own
- facturas.leer_own
- pagos.crear_own

## CRUD real expuesto

- Usuarios: `admin/usuarios` con lectura, creacion, actualizacion y eliminacion.
- Reservas: `recepcion/reservas` y `huesped/reservas` con creacion y control por propietario.
- Habitaciones: `limpieza/habitaciones` con mantenimiento general y `limpieza/habitaciones/{room}/estado` para cambio de estado.
- Facturas: `caja/facturacion` con listado, alta, emision y cancelacion.
- Pagos: `caja/pagos` con listado, alta, edicion y eliminacion.

## Contrato de autenticacion API

- `POST /api/autenticacion/iniciar-sesion`
- `POST /api/autenticacion/registro-huesped`
- `POST /api/autenticacion/cerrar-sesion`
- `GET /api/autenticacion/perfil`
- `PUT /api/autenticacion/cambiar-contrasena`
