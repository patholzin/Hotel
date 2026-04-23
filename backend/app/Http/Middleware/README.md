# Middleware de acceso

Ejemplos de uso en `routes/web.php`:

- `role:Administrador` para módulos administrativos.
- `role:Administrador|Gerente` para módulos administrativos.
- `role:Recepcionista|Administrador|Gerente` para reservas y check-in.
- `role:Recepcionista|Administrador|Gerente` para pagos y facturación.
- `role:Limpieza|Administrador|Gerente` para estados de habitación.
- `role:Huesped` para autoservicio del huésped.
- `password.changed` para forzar el cambio de contraseña antes de entrar al sistema.
