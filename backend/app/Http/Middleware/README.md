# Middleware de acceso

Ejemplos de uso en `routes/web.php`:

- `role:Administrador` para módulos administrativos.
- `role:Recepcionista|Administrador` para reservas y check-in.
- `role:Cajero|Administrador` para pagos y facturación.
- `role:Limpieza|Administrador` para estados de habitación.
- `role:Cliente` para autoservicio del huésped.
- `password.changed` para forzar el cambio de contraseña antes de entrar al sistema.