<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortalController extends Controller
{
    public function profile(Request $request): JsonResponse
    {
        return response()->json(['module' => 'cliente.perfil', 'data' => $request->user(), 'actor' => $request->user()?->only(['id', 'name', 'email'])]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', 'unique:usuarios,email,' . $request->user()->id],
        ]);

        $request->user()->update($validated);

        return response()->json(['message' => 'Perfil actualizado', 'data' => $request->user()->fresh()]);
    }

    public function reservations(Request $request): JsonResponse
    {
        return response()->json(['module' => 'cliente.reservas', 'data' => Reservation::query()->where('user_id', $request->user()->id)->with('room:id,number,type,status')->latest()->get(), 'actor' => $request->user()?->only(['id', 'name', 'email'])]);
    }

    public function storeReservation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'room_id' => ['nullable', 'exists:habitaciones,id'],
            'check_in_date' => ['required', 'date'],
            'check_out_date' => ['required', 'date', 'after:check_in_date'],
            'guests_count' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string'],
        ]);

        $reservation = Reservation::create([
            'user_id' => $request->user()->id,
            'room_id' => $validated['room_id'] ?? null,
            'code' => 'RSV-' . strtoupper(str()->random(8)),
            'check_in_date' => $validated['check_in_date'],
            'check_out_date' => $validated['check_out_date'],
            'guests_count' => $validated['guests_count'],
            'status' => 'pending',
            'total_amount' => 0,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json(['message' => 'Reserva creada', 'data' => $reservation], 201);
    }

    public function destroyReservation(Request $request, Reservation $reservation): JsonResponse
    {
        abort_unless($reservation->user_id === $request->user()->id, 403);

        $reservation->delete();

        return response()->json(['message' => 'Reserva cancelada']);
    }

    public function invoices(Request $request): JsonResponse
    {
        return response()->json(['module' => 'cliente.facturas', 'data' => Invoice::query()->where('user_id', $request->user()->id)->latest()->get(), 'actor' => $request->user()?->only(['id', 'name', 'email'])]);
    }

    public function payments(Request $request): JsonResponse
    {
        return response()->json(['module' => 'cliente.pagos', 'data' => Payment::query()->where('user_id', $request->user()->id)->latest()->get(), 'actor' => $request->user()?->only(['id', 'name', 'email'])]);
    }
}