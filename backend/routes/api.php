<?php

use App\Http\Controllers\Admin\BitacoraController;
use App\Http\Controllers\Admin\ManagementController as AdminManagementController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Cashier\CashierController;
use App\Http\Controllers\Cleaning\HousekeepingController;
use App\Http\Controllers\Customer\PortalController;
use App\Http\Controllers\Reception\OperationsController;
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

Route::middleware(['auth:sanctum', 'role:Recepcionista|Administrador'])->prefix('recepcion')->name('api.recepcion.')->group(function (): void {
	Route::get('/reservas', [OperationsController::class, 'reservations'])->middleware('permission:reservas.leer')->name('reservas.index');
	Route::post('/reservas', [OperationsController::class, 'storeReservation'])->middleware('permission:reservas.crear')->name('reservas.store');
	Route::put('/reservas/{reservation}', [OperationsController::class, 'updateReservation'])->middleware('permission:reservas.actualizar')->name('reservas.update');
	Route::delete('/reservas/{reservation}', [OperationsController::class, 'destroyReservation'])->middleware('permission:reservas.cancelar')->name('reservas.destroy');
	Route::get('/disponibilidad', [OperationsController::class, 'availability'])->middleware('permission:disponibilidad.leer')->name('disponibilidad.index');
	Route::get('/invitados', [OperationsController::class, 'guests'])->middleware('permission:invitados.leer')->name('invitados.index');
	Route::post('/checkin', [OperationsController::class, 'checkin'])->middleware('permission:alojamientos.checkin')->name('checkin');
	Route::post('/checkout', [OperationsController::class, 'checkout'])->middleware('permission:alojamientos.checkout')->name('checkout');
});

Route::middleware(['auth:sanctum', 'role:Cajero|Administrador'])->prefix('caja')->name('api.caja.')->group(function (): void {
	Route::get('/facturacion', [CashierController::class, 'invoices'])->middleware('permission:facturas.leer')->name('facturas.index');
	Route::post('/facturacion', [CashierController::class, 'storeInvoice'])->middleware('permission:facturas.generar')->name('facturas.store');
	Route::put('/facturacion/{invoice}', [CashierController::class, 'updateInvoice'])->middleware('permission:facturas.emitir')->name('facturas.update');
	Route::delete('/facturacion/{invoice}', [CashierController::class, 'destroyInvoice'])->middleware('permission:facturas.cancelar')->name('facturas.destroy');
	Route::get('/pagos', [CashierController::class, 'payments'])->middleware('permission:pagos.leer')->name('pagos.index');
	Route::post('/pagos', [CashierController::class, 'storePayment'])->middleware('permission:pagos.crear')->name('pagos.store');
	Route::put('/pagos/{payment}', [CashierController::class, 'updatePayment'])->middleware('permission:pagos.crear')->name('pagos.update');
	Route::delete('/pagos/{payment}', [CashierController::class, 'destroyPayment'])->middleware('permission:pagos.crear')->name('pagos.destroy');
	Route::get('/corte', [CashierController::class, 'closing'])->middleware('permission:cierre_de_efectivo.leer')->name('corte');
	Route::get('/reportes', [CashierController::class, 'reports'])->middleware('permission:informes.leer')->name('reportes');
});

Route::middleware(['auth:sanctum', 'role:Limpieza|Administrador'])->prefix('limpieza')->name('api.limpieza.')->group(function (): void {
	Route::get('/habitaciones', [HousekeepingController::class, 'rooms'])->middleware('permission:habitaciones.leer')->name('habitaciones.index');
	Route::patch('/habitaciones/{room}/estado', [HousekeepingController::class, 'changeStatus'])->middleware('permission:rooms.change_status')->name('habitaciones.estado');
});

Route::middleware(['auth:sanctum', 'role:Cliente'])->prefix('cliente')->name('api.cliente.')->group(function (): void {
	Route::get('/perfil', [PortalController::class, 'profile'])->middleware('permission:perfil.leer')->name('perfil');
	Route::get('/reservas', [PortalController::class, 'reservations'])->middleware('permission:reservas.leer_own')->name('reservas.index');
	Route::post('/reservas', [PortalController::class, 'storeReservation'])->middleware('permission:reservas.crear')->name('reservas.store');
	Route::delete('/reservas/{reservation}', [PortalController::class, 'cancelReservation'])->middleware('permission:reservas.cancelar_own')->name('reservas.cancel');
	Route::get('/facturas', [PortalController::class, 'invoices'])->middleware('permission:facturas.leer_own')->name('facturas.index');
});