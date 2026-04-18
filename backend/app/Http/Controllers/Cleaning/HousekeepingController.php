<?php

namespace App\Http\Controllers\Cleaning;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HousekeepingController extends Controller
{
    public function rooms(Request $request): JsonResponse
    {
        return response()->json(['module' => 'limpieza.habitaciones', 'data' => Room::latest()->get(), 'actor' => $request->user()?->only(['id', 'name', 'email'])]);
    }

    public function changeRoomStatus(Request $request, Room $room): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:available,dirty,occupied,out_of_service'],
        ]);

        $room->update(['status' => $validated['status']]);

        return response()->json(['message' => 'Estado actualizado', 'data' => $room]);
    }

    public function storeRoom(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'number' => ['required', 'string', 'max:50', 'unique:habitaciones,number'],
            'type' => ['required', 'string', 'max:100'],
            'status' => ['required', 'in:available,occupied,dirty,out_of_service'],
            'floor' => ['nullable', 'integer', 'min:0'],
            'capacity' => ['required', 'integer', 'min:1'],
            'price_per_night' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        $room = Room::create($validated);

        return response()->json(['message' => 'Habitación creada', 'data' => $room], 201);
    }

    public function updateRoom(Request $request, Room $room): JsonResponse
    {
        $validated = $request->validate([
            'number' => ['sometimes', 'string', 'max:50', 'unique:habitaciones,number,' . $room->id],
            'type' => ['sometimes', 'string', 'max:100'],
            'status' => ['sometimes', 'in:available,occupied,dirty,out_of_service'],
            'floor' => ['nullable', 'integer', 'min:0'],
            'capacity' => ['sometimes', 'integer', 'min:1'],
            'price_per_night' => ['sometimes', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        $room->update($validated);

        return response()->json(['message' => 'Habitación actualizada', 'data' => $room]);
    }

    public function destroyRoom(Room $room): JsonResponse
    {
        $room->delete();

        return response()->json(['message' => 'Habitación eliminada']);
    }

    public function statuses(Request $request): JsonResponse
    {
        return response()->json(['module' => 'limpieza.estados', 'message' => 'Cambio de estado de habitaciones', 'data' => Room::query()->select(['id', 'number', 'status'])->latest()->get(), 'actor' => $request->user()?->only(['id', 'name', 'email'])]);
    }
}