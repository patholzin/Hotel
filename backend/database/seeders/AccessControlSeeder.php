<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class AccessControlSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'usuarios.leer',
            'usuarios.crear',
            'usuarios.actualizar',
            'usuarios.desactivar',
            'roles.leer',
            'roles.crear',
            'roles.actualizar',
            'roles.desactivar',
            'permisos.leer',
            'permisos.crear',
            'permisos.actualizar',
            'permisos.desactivar',
            'habitaciones.leer',
            'habitaciones.crear',
            'habitaciones.actualizar',
            'habitaciones.desactivar',
            'rooms.change_status',
            'tasas.leer',
            'tasas.crear',
            'tasas.actualizar',
            'tasas.desactivar',
            'reservas.leer',
            'reservas.crear',
            'reservas.actualizar',
            'reservas.cancelar',
            'reservas.asignar_habitaciones',
            'reservas.leer_own',
            'reservas.cancelar_own',
            'disponibilidad.leer',
            'invitados.leer',
            'invitados.crear',
            'invitados.actualizar',
            'alojamientos.checkin',
            'alojamientos.checkout',
            'estancias.leer',
            'servicios.leer',
            'servicios.crear',
            'servicios.actualizar',
            'servicios.desactivar',
            'pos.leer',
            'pos.crear',
            'pos.actualizar',
            'pos.cerrar',
            'facturas.leer',
            'facturas.generar',
            'facturas.emitir',
            'facturas.cancelar',
            'facturas.leer_own',
            'pagos.leer',
            'pagos.crear',
            'pagos.crear_own',
            'cierre_de_efectivo.leer',
            'cierre_de_efectivo.generar',
            'informes.leer',
            'informes.exportar',
            'auditoria.leer',
            'perfil.leer',
            'perfil.actualizar',
        ];

        foreach ($permissions as $permissionName) {
            Permission::findOrCreate($permissionName, 'web');
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $roles = [
            'Administrador' => $permissions,
            'Recepcionista' => [
                'reservas.leer',
                'reservas.crear',
                'reservas.actualizar',
                'reservas.cancelar',
                'reservas.asignar_habitaciones',
                'disponibilidad.leer',
                'invitados.leer',
                'invitados.crear',
                'invitados.actualizar',
                'alojamientos.checkin',
                'alojamientos.checkout',
                'habitaciones.leer',
                'rooms.change_status',
                'facturas.generar',
                'pagos.crear',
                'informes.leer',
            ],
            'Cajero' => [
                'reservas.leer',
                'estancias.leer',
                'facturas.leer',
                'facturas.generar',
                'facturas.emitir',
                'facturas.cancelar',
                'pagos.leer',
                'pagos.crear',
                'cierre_de_efectivo.leer',
                'cierre_de_efectivo.generar',
                'informes.leer',
                'informes.exportar',
            ],
            'Limpieza' => [
                'habitaciones.leer',
                'rooms.change_status',
                'estancias.leer',
            ],
            'Cliente' => [
                'perfil.leer',
                'perfil.actualizar',
                'reservas.crear',
                'reservas.leer_own',
                'reservas.cancelar_own',
                'facturas.leer_own',
                'pagos.crear_own',
            ],
        ];

        foreach ($roles as $roleName => $rolePermissions) {
            $role = Role::findOrCreate($roleName, 'web');
            $role->syncPermissions($rolePermissions);
        }

        $users = [
            [
                'name' => 'Administrador',
                'email' => 'admin@gmail.com',
                'password' => 'admin123',
                'role' => 'Administrador',
            ],
            [
                'name' => 'Recepcionista',
                'email' => 'recep@gmail.com',
                'password' => 'recep123',
                'role' => 'Recepcionista',
            ],
            [
                'name' => 'Cajero',
                'email' => 'cajero@gmail.com',
                'password' => 'cajero123',
                'role' => 'Cajero',
            ],
            [
                'name' => 'Limpieza',
                'email' => 'limpieza@gmail.com',
                'password' => 'limp123',
                'role' => 'Limpieza',
            ],
            [
                'name' => 'Cliente',
                'email' => 'itahy@gmail.com',
                'password' => 'itahy123',
                'role' => 'Cliente',
            ],
        ];

        foreach ($users as $userData) {
            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => Hash::make($userData['password']),
                    'must_change_password' => true,
                    'password_changed_at' => null,
                ]
            );

            $user->syncRoles([$userData['role']]);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}