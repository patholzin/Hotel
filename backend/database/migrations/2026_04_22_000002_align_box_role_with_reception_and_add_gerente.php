<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const ROLES_BASE = ['Administrador', 'Gerente', 'Recepcionista', 'Limpieza', 'Huesped'];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $recepcionistaId = DB::table('roles')->where('name', 'Recepcionista')->value('id');

        $legacyCajaRoleIds = DB::table('roles')
            ->whereNotIn('name', self::ROLES_BASE)
            ->whereIn('id', function ($query): void {
                $query->select('role_id')
                    ->from('role_has_permissions')
                    ->whereIn('permission_id', function ($sub): void {
                        $sub->select('id')
                            ->from('permissions')
                            ->whereIn('name', ['facturas.leer', 'facturas.generar', 'pagos.leer', 'pagos.crear']);
                    });
            })
            ->pluck('id');

        if ($recepcionistaId && $legacyCajaRoleIds->isNotEmpty()) {
            $asignaciones = DB::table('model_has_roles')
                ->whereIn('role_id', $legacyCajaRoleIds)
                ->get();

            foreach ($asignaciones as $asignacion) {
                $existe = DB::table('model_has_roles')
                    ->where('role_id', $recepcionistaId)
                    ->where('model_type', $asignacion->model_type)
                    ->where('model_id', $asignacion->model_id)
                    ->exists();

                if (! $existe) {
                    DB::table('model_has_roles')->insert([
                        'role_id' => $recepcionistaId,
                        'model_type' => $asignacion->model_type,
                        'model_id' => $asignacion->model_id,
                    ]);
                }
            }

            DB::table('model_has_roles')->whereIn('role_id', $legacyCajaRoleIds)->delete();
            DB::table('role_has_permissions')->whereIn('role_id', $legacyCajaRoleIds)->delete();
            DB::table('roles')->whereIn('id', $legacyCajaRoleIds)->delete();
        }

        $gerenteId = DB::table('roles')->where('name', 'Gerente')->value('id');

        if (! $gerenteId) {
            DB::table('roles')->insert([
                'name' => 'Gerente',
                'guard_name' => 'web',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $gerenteId = DB::table('roles')->where('name', 'Gerente')->value('id');
        }

        if ($gerenteId) {
            $permissionIds = DB::table('permissions')->pluck('id');
            $rows = [];

            foreach ($permissionIds as $permissionId) {
                $rows[] = [
                    'permission_id' => $permissionId,
                    'role_id' => $gerenteId,
                ];
            }

            if (! empty($rows)) {
                DB::table('role_has_permissions')->insertOrIgnore($rows);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('roles')->where('name', 'Gerente')->delete();
    }
};
