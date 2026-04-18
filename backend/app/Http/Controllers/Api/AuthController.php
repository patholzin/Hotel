<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:255'],
        ]);

        /** @var User|null $user */
        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales no son correctas.'],
            ]);
        }

        $tokenName = $validated['device_name'] ?? 'frontend';
        $abilities = $user->permissions_list;

        $token = $user->createToken($tokenName, $abilities)->plainTextToken;

        return response()->json([
            'message' => 'Login exitoso',
            'token_type' => 'Bearer',
            'token' => $token,
            'user' => $this->formatUser($user->fresh(['roles', 'permissions'])),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()?->currentAccessToken();

        if ($token) {
            $token->delete();
        }

        return response()->json([
            'message' => 'Sesión cerrada correctamente',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        abort_if(! $user, 401);

        return response()->json([
            'message' => 'Usuario autenticado',
            'user' => $this->formatUser($user->fresh(['roles', 'permissions'])),
        ]);
    }

    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user->roles_list,
            'permissions' => $user->permissions_list,
            'must_change_password' => $user->must_change_password_flag,
            'password_changed_at' => $user->password_changed_at,
        ];
    }
}