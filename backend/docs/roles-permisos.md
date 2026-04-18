# Roles y permisos del hotel

## Roles

- Administrador
- Recepcionista
- Cajero
- Limpieza
- Cliente

## Cuentas iniciales

- `admin@gmail.com` / `admin123`
- `recep@gmail.com` / `recep123`
- `cajero@gmail.com` / `cajero123`
- `limpieza@gmail.com` / `limp123`
- `itahy@gmail.com` / `itahy123`

## Matriz por módulos

### Administrador

Acceso total:

- usuarios.*
- roles.*
- permisos.*
- habitaciones.*
- tasas.*
- reservas.*
- estancias.*
- servicios.*
- pos.*
- facturas.*
- pagos.*
- cierre_de_efectivo.*
- informes.*
- auditoria.*

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
- facturas.generar
- pagos.crear
- informes.leer

### Cajero

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
- reservas.leer
- estancias.leer

### Limpieza

- habitaciones.leer
- rooms.change_status
- estancias.leer

### Cliente

- perfil.leer
- perfil.actualizar
- reservas.crear
- reservas.leer_own
- reservas.cancelar_own
- facturas.leer_own
- pagos.crear_own

## Ejemplos de middleware

```php
Route::middleware(['auth', 'role:Administrador'])->group(function () {
    Route::get('/admin/usuarios', fn () => 'Usuarios');
});

Route::middleware(['auth', 'role:Recepcionista|Administrador'])->group(function () {
    Route::get('/recepcion/reservas', fn () => 'Reservas');
});

Route::middleware(['auth', 'permission:facturas.generar'])->group(function () {
    Route::get('/facturas/generar', fn () => 'Generar factura');
});

Route::middleware(['auth', 'password.changed'])->group(function () {
    Route::get('/dashboard', fn () => 'Dashboard');
});
```

## Flujo de contraseña temporal

- Los usuarios sembrados entran con `must_change_password = true`.
- El middleware `password.changed` los redirige a la pantalla de cambio.
- Al guardar la nueva clave, `must_change_password` pasa a `false` y se registra `password_changed_at`.

## Controladores reales

- [app/Http/Controllers/Admin/ManagementController.php](../app/Http/Controllers/Admin/ManagementController.php)
- [app/Http/Controllers/Reception/OperationsController.php](../app/Http/Controllers/Reception/OperationsController.php)
- [app/Http/Controllers/Cashier/CashierController.php](../app/Http/Controllers/Cashier/CashierController.php)
- [app/Http/Controllers/Cleaning/HousekeepingController.php](../app/Http/Controllers/Cleaning/HousekeepingController.php)
- [app/Http/Controllers/Customer/PortalController.php](../app/Http/Controllers/Customer/PortalController.php)

## CRUD real expuesto

- Usuarios: `admin/usuarios` con lectura, creación, actualización y eliminación.
- Reservas: `recepcion/reservas` y `cliente/reservas` con creación y control por propietario.
- Habitaciones: `limpieza/habitaciones` con mantenimiento general y `limpieza/habitaciones/{room}/estado` para cambio de estado.
- Facturas: `caja/facturacion` con listado, alta, emisión y cancelación.
- Pagos: `caja/pagos` con listado, alta, edición y eliminación.

## Tablas finales en español

- `usuarios`
- `habitaciones`
- `reservaciones`
- `facturas`
- `pagos`

## Tablas internas que se mantienen en inglés

- `permissions`
- `roles`
- `model_has_permissions`
- `model_has_roles`
- `role_has_permissions`
- `personal_access_tokens`
- `sessions`
- `cache`
- `jobs`
- `password_reset_tokens`

## Contrato de autenticación API

- `POST /api/autenticacion/iniciar-sesion`
- `POST /api/autenticacion/cerrar-sesion`
- `GET /api/autenticacion/perfil`

Compatibilidad temporal disponible:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Respuesta de login y me

- `token`
- `token_type`
- `user.id`
- `user.name`
- `user.email`
- `user.roles`
- `user.permissions`
- `user.must_change_password`
- `user.password_changed_at`

### Reglas

- El login usa Sanctum y devuelve un bearer token.
- Los permisos del usuario se agregan como abilities del token.
- Si `must_change_password` es `true`, el frontend debe enviar al usuario al cambio de contraseña antes de entrar al dashboard.
