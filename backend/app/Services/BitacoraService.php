<?php

namespace App\Services;

use App\Models\Bitacora;
use Illuminate\Http\Request;

class BitacoraService
{
    public static function registrar(?Request $request, string $accion, string $entidad, int|string|null $entidadId = null, array $detalles = []): void
    {
        try {
            Bitacora::create([
                'usuario_id' => $request?->user()?->id,
                'accion' => $accion,
                'entidad' => $entidad,
                'entidad_id' => $entidadId !== null ? (int) $entidadId : null,
                'detalles' => $detalles,
                'ip_address' => $request?->ip(),
                'user_agent' => $request?->userAgent(),
            ]);
        } catch (\Throwable) {
            // Evita que una falla en bitácora afecte la operación principal.
        }
    }
}
