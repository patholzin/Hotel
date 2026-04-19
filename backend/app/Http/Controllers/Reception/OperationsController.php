<?php

namespace App\Http\Controllers\Reception;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Room;
use App\Services\BitacoraService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OperationsController extends Controller
{
    public function reservations(Request $request): JsonResponse
    {
        return response()->json(['module' => 'recepcion.reservas', 'data' => Reservation::with(['user:id,name,email', 'room:id,number,type,status'])->latest()->get(), 'actor' => $request->user()?->only(['id', 'name', 'email'])]);
    }

    public function storeReservation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:usuarios,id'],
            'room_id' => ['nullable', 'exists:habitaciones,id'],
            'check_in_date' => ['required', 'date'],
            'check_out_date' => ['required', 'date', 'after:check_in_date'],
            'guests_count' => ['required', 'integer', 'min:1'],
            'status' => ['required', 'in:pending,confirmed,checked_in,checked_out,cancelled'],
            'total_amount' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        $reservation = Reservation::create(array_merge($validated, ['code' => 'RSV-' . Str::upper(Str::random(8))]));

        BitacoraService::registrar($request, 'reservas.crear', 'reservacion', $reservation->id, [
            'codigo' => $reservation->code,
            'estado' => $reservation->status,
            'room_id' => $reservation->room_id,
        ]);

        return response()->json(['message' => 'Reserva creada', 'data' => $reservation->load(['user', 'room'])], 201);
    }

    public function updateReservation(Request $request, Reservation $reservation): JsonResponse
    {
        $validated = $request->validate([
            'room_id' => ['nullable', 'exists:habitaciones,id'],
            'check_in_date' => ['sometimes', 'date'],
            'check_out_date' => ['sometimes', 'date'],
            'guests_count' => ['sometimes', 'integer', 'min:1'],
            'status' => ['sometimes', 'in:pending,confirmed,checked_in,checked_out,cancelled'],
            'total_amount' => ['sometimes', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        $reservation->update($validated);

        BitacoraService::registrar($request, 'reservas.actualizar', 'reservacion', $reservation->id, [
            'cambios' => array_keys($validated),
            'estado' => $reservation->status,
        ]);

        return response()->json(['message' => 'Reserva actualizada', 'data' => $reservation->load(['user', 'room'])]);
    }

    public function destroyReservation(Request $request, Reservation $reservation): JsonResponse
    {
        $reservationId = $reservation->id;
        $code = $reservation->code;
        $reservation->delete();

        BitacoraService::registrar($request, 'reservas.eliminar', 'reservacion', $reservationId, [
            'codigo' => $code,
        ]);

        return response()->json(['message' => 'Reserva eliminada']);
    }

    public function availability(Request $request): JsonResponse
    {
        return response()->json(['module' => 'recepcion.disponibilidad', 'data' => Room::query()->where('status', 'available')->latest()->get(), 'actor' => $request->user()?->only(['id', 'name', 'email'])]);
    }

    public function guests(Request $request): JsonResponse
    {
        return response()->json(['module' => 'recepcion.invitados', 'message' => 'Invitados', 'actor' => $request->user()?->only(['id', 'name', 'email'])]);
    }

    public function checkin(Request $request): JsonResponse
    {
        BitacoraService::registrar($request, 'alojamientos.checkin', 'alojamiento', null, [
            'origen' => 'modulo-recepcion',
        ]);

        return response()->json(['module' => 'recepcion.checkin', 'message' => 'Check-in', 'actor' => $request->user()?->only(['id', 'name', 'email'])]);
    }

    public function checkout(Request $request): JsonResponse
    {
        BitacoraService::registrar($request, 'alojamientos.checkout', 'alojamiento', null, [
            'origen' => 'modulo-recepcion',
        ]);

        return response()->json(['module' => 'recepcion.checkout', 'message' => 'Check-out', 'actor' => $request->user()?->only(['id', 'name', 'email'])]);
    }
}