<?php

use App\Http\Controllers\Admin\BitacoraController;
use App\Http\Controllers\Admin\ManagementController as AdminManagementController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('autenticacion')->name('api.autenticacion.')->group(function (): void {
	Route::post('/iniciar-sesion', [AuthController::class, 'login'])->name('iniciar-sesion');
	Route::post('/registro-cliente', [AuthController::class, 'registroCliente'])->name('registro-cliente');

	Route::middleware('auth:sanctum')->group(function (): void {
		Route::post('/cerrar-sesion', [AuthController::class, 'logout'])->name('cerrar-sesion');
		Route::get('/perfil', [AuthController::class, 'me'])->name('perfil');
		Route::put('/cambiar-contrasena', [AuthController::class, 'cambiarContrasena'])->name('cambiar-contrasena');
	});
});

// Compatibilidad temporal con rutas antiguas.
Route::prefix('auth')->name('api.auth.')->group(function (): void {
	Route::post('/login', [AuthController::class, 'login'])->name('login');
	Route::post('/register', [AuthController::class, 'registroCliente'])->name('register');

	Route::middleware('auth:sanctum')->group(function (): void {
		Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
		Route::get('/me', [AuthController::class, 'me'])->name('me');
		Route::put('/change-password', [AuthController::class, 'cambiarContrasena'])->name('change-password');
	});
});

Route::middleware(['auth:sanctum', 'role:Administrador'])->prefix('admin')->name('api.admin.')->group(function (): void {
	Route::get('/usuarios', [AdminManagementController::class, 'users'])->middleware('permission:usuarios.leer')->name('usuarios.index');
	Route::post('/usuarios', [AdminManagementController::class, 'storeUser'])->middleware('permission:usuarios.crear')->name('usuarios.store');
	Route::put('/usuarios/{user}', [AdminManagementController::class, 'updateUser'])->middleware('permission:usuarios.actualizar')->name('usuarios.update');
	Route::patch('/usuarios/{user}/estado', [AdminManagementController::class, 'cambiarEstadoUsuario'])->middleware('permission:usuarios.desactivar')->name('usuarios.estado');
	Route::delete('/usuarios/{user}', [AdminManagementController::class, 'destroyUser'])->middleware('permission:usuarios.desactivar')->name('usuarios.destroy');
	Route::get('/bitacora', [BitacoraController::class, 'index'])->middleware('permission:auditoria.leer')->name('bitacora.index');
	Route::post('/bitacora', [BitacoraController::class, 'store'])->middleware('permission:auditoria.leer')->name('bitacora.store');
});
