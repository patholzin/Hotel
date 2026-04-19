<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\BitacoraService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class ManagementController extends Controller
{
    public function users(Request $request): JsonResponse
    {
        return response()->json([
            'module' => 'admin.users',
            'message' => 'Listado de usuarios',
            'data' => User::query()->with('roles:id,name')->latest()->get(),
            'actor' => $request->user()?->only(['id', 'name', 'email']),
        ]);
    }

    public function storeUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:usuarios,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'must_change_password' => true,
            'password_changed_at' => null,
        ]);

        $user->syncRoles([$validated['role']]);

        BitacoraService::registrar($request, 'usuarios.crear', 'usuario', $user->id, [
            'email' => $user->email,
            'rol' => $validated['role'],
        ]);

        return response()->json(['message' => 'Usuario creado', 'data' => $user->load('roles')], 201);
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', 'unique:usuarios,email,' . $user->id],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'role' => ['sometimes', 'string', 'exists:roles,name'],
        ]);

        $payload = array_filter([
            'name' => $validated['name'] ?? null,
            'email' => $validated['email'] ?? null,
            'password' => isset($validated['password']) ? Hash::make($validated['password']) : null,
        ], static fn ($value) => $value !== null);

        $user->update($payload);

        if (isset($validated['role'])) {
            $user->syncRoles([$validated['role']]);
        }

        BitacoraService::registrar($request, 'usuarios.actualizar', 'usuario', $user->id, [
            'cambios' => array_keys($validated),
        ]);

        return response()->json(['message' => 'Usuario actualizado', 'data' => $user->load('roles')]);
    }

    public function destroyUser(User $user): JsonResponse
    {
        $userId = $user->id;
        $email = $user->email;
        $user->delete();

        BitacoraService::registrar(request(), 'usuarios.eliminar', 'usuario', $userId, [
            'email' => $email,
        ]);

        return response()->json(['message' => 'Usuario eliminado']);
    }

    public function cambiarEstadoUsuario(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'activo' => ['required', 'boolean'],
        ]);

        $user->update([
            'activo' => (bool) $validated['activo'],
        ]);

        BitacoraService::registrar($request, 'usuarios.estado', 'usuario', $user->id, [
            'activo' => (bool) $user->activo,
        ]);

        return response()->json([
            'message' => $user->activo ? 'Usuario activado' : 'Usuario inactivado',
            'data' => $user->load('roles'),
        ]);
    }

    public function roles(Request $request): JsonResponse
    {
        return response()->json([
            'module' => 'admin.roles',
            'message' => 'Listado de roles',
            'total' => Role::count(),
            'actor' => $request->user()?->only(['id', 'name', 'email']),
        ]);
    }

    public function permissions(Request $request): JsonResponse
    {
        return response()->json([
            'module' => 'admin.permissions',
            'message' => 'Listado de permisos',
            'total' => Permission::count(),
            'actor' => $request->user()?->only(['id', 'name', 'email']),
        ]);
    }
}