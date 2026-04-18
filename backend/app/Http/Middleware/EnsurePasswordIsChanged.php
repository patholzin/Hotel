<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordIsChanged
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! method_exists($user, 'needsPasswordChange') || ! $user->needsPasswordChange()) {
            return $next($request);
        }

        if ($request->routeIs(
            'password.change',
            'password.change.update',
            'logout',
            'api.autenticacion.iniciar-sesion',
            'api.autenticacion.cerrar-sesion',
            'api.autenticacion.perfil',
            'api.auth.login',
            'api.auth.logout',
            'api.auth.me'
        )) {
            return $next($request);
        }

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Debe cambiar la contraseña antes de continuar.',
                'code' => 'password_change_required',
            ], 423);
        }

        return redirect()->route('password.change');
    }
}