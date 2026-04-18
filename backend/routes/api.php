<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('autenticacion')->name('api.autenticacion.')->group(function (): void {
	Route::post('/iniciar-sesion', [AuthController::class, 'login'])->name('iniciar-sesion');

	Route::middleware('auth:sanctum')->group(function (): void {
		Route::post('/cerrar-sesion', [AuthController::class, 'logout'])->name('cerrar-sesion');
		Route::get('/perfil', [AuthController::class, 'me'])->name('perfil');
	});
});

// Compatibilidad temporal con rutas antiguas.
Route::prefix('auth')->name('api.auth.')->group(function (): void {
	Route::post('/login', [AuthController::class, 'login'])->name('login');

	Route::middleware('auth:sanctum')->group(function (): void {
		Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
		Route::get('/me', [AuthController::class, 'me'])->name('me');
	});
});
