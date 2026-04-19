<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bitacora;
use App\Services\BitacoraService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BitacoraController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'usuario_id' => ['nullable', 'integer', 'exists:usuarios,id'],
            'accion' => ['nullable', 'string', 'max:120'],
            'entidad' => ['nullable', 'string', 'max:120'],
            'desde' => ['nullable', 'date'],
            'hasta' => ['nullable', 'date'],
            'q' => ['nullable', 'string', 'max:150'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Bitacora::query()
            ->with('usuario:id,name,email')
            ->latest();

        if (isset($validated['usuario_id'])) {
            $query->where('usuario_id', $validated['usuario_id']);
        }

        if (!empty($validated['accion'])) {
            $query->where('accion', 'like', '%' . $validated['accion'] . '%');
        }

        if (!empty($validated['entidad'])) {
            $query->where('entidad', 'like', '%' . $validated['entidad'] . '%');
        }

        if (!empty($validated['desde'])) {
            $query->where('created_at', '>=', Carbon::parse($validated['desde'])->startOfDay());
        }

        if (!empty($validated['hasta'])) {
            $query->where('created_at', '<=', Carbon::parse($validated['hasta'])->endOfDay());
        }

        if (!empty($validated['q'])) {
            $search = $validated['q'];

            $query->where(function ($builder) use ($search): void {
                $builder
                    ->where('accion', 'like', '%' . $search . '%')
                    ->orWhere('entidad', 'like', '%' . $search . '%')
                    ->orWhere('detalles', 'like', '%' . $search . '%');
            });
        }

        $perPage = $validated['per_page'] ?? 20;
        $data = $query->paginate($perPage)->appends($request->query());

        return response()->json([
            'module' => 'admin.bitacora',
            'message' => 'Listado de bitácora',
            'data' => $data,
            'actor' => $request->user()?->only(['id', 'name', 'email']),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'accion' => ['required', 'string', 'max:120'],
            'entidad' => ['required', 'string', 'max:120'],
            'entidad_id' => ['nullable', 'integer'],
            'detalles' => ['nullable', 'array'],
        ]);

        BitacoraService::registrar(
            $request,
            $validated['accion'],
            $validated['entidad'],
            $validated['entidad_id'] ?? null,
            $validated['detalles'] ?? []
        );

        return response()->json([
            'message' => 'Registro de bitácora guardado',
        ], 201);
    }
}
