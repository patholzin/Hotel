<?php

use App\Http\Controllers\Admin\ManagementController as AdminManagementController;
use App\Http\Controllers\Cashier\CashierController;
use App\Http\Controllers\Auth\PasswordChangeController;
use App\Http\Controllers\Cleaning\HousekeepingController;
use App\Http\Controllers\Customer\PortalController;
use App\Http\Controllers\Reception\OperationsController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::middleware(['auth', 'password.changed'])->group(function () {
    Route::get('/dashboard', fn () => response()->json(['message' => 'Dashboard']));
});

Route::get('/password/change', [PasswordChangeController::class, 'edit'])
    ->middleware('auth')
    ->name('password.change');

Route::put('/password/change', [PasswordChangeController::class, 'update'])
    ->middleware('auth')
    ->name('password.change.update');

Route::middleware(['auth', 'password.changed', 'role:Administrador|Gerente'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/usuarios', [AdminManagementController::class, 'users'])->middleware('permission:usuarios.leer')->name('usuarios.index');
    Route::post('/usuarios', [AdminManagementController::class, 'storeUser'])->middleware('permission:usuarios.crear')->name('usuarios.store');
    Route::put('/usuarios/{user}', [AdminManagementController::class, 'updateUser'])->middleware('permission:usuarios.actualizar')->name('usuarios.update');
    Route::patch('/usuarios/{user}/estado', [AdminManagementController::class, 'cambiarEstadoUsuario'])->middleware('permission:usuarios.desactivar')->name('usuarios.estado');
    Route::delete('/usuarios/{user}', [AdminManagementController::class, 'destroyUser'])->middleware('permission:usuarios.desactivar')->name('usuarios.destroy');
    Route::get('/roles', [AdminManagementController::class, 'roles'])->middleware('permission:roles.leer')->name('roles.index');
    Route::get('/permisos', [AdminManagementController::class, 'permissions'])->middleware('permission:permisos.leer')->name('permisos.index');
});

Route::middleware(['auth', 'password.changed', 'role:Recepcionista|Administrador|Gerente'])->prefix('recepcion')->name('recepcion.')->group(function () {
    Route::get('/reservas', [OperationsController::class, 'reservations'])->middleware('permission:reservas.leer')->name('reservas.index');
    Route::post('/reservas', [OperationsController::class, 'storeReservation'])->middleware('permission:reservas.crear')->name('reservas.store');
    Route::put('/reservas/{reservation}', [OperationsController::class, 'updateReservation'])->middleware('permission:reservas.actualizar')->name('reservas.update');
    Route::delete('/reservas/{reservation}', [OperationsController::class, 'destroyReservation'])->middleware('permission:reservas.cancelar')->name('reservas.destroy');
    Route::get('/disponibilidad', [OperationsController::class, 'availability'])->middleware('permission:disponibilidad.leer')->name('disponibilidad.index');
    Route::get('/invitados', [OperationsController::class, 'guests'])->middleware('permission:invitados.leer')->name('invitados.index');
    Route::get('/checkin', [OperationsController::class, 'checkin'])->middleware('permission:alojamientos.checkin')->name('checkin.index');
    Route::get('/checkout', [OperationsController::class, 'checkout'])->middleware('permission:alojamientos.checkout')->name('checkout.index');
});

Route::middleware(['auth', 'password.changed', 'role:Recepcionista|Administrador|Gerente'])->prefix('caja')->name('caja.')->group(function () {
    Route::get('/facturacion', [CashierController::class, 'invoices'])->middleware('permission:facturas.leer')->name('facturacion.index');
    Route::post('/facturacion', [CashierController::class, 'storeInvoice'])->middleware('permission:facturas.generar')->name('facturacion.store');
    Route::put('/facturacion/{invoice}', [CashierController::class, 'updateInvoice'])->middleware('permission:facturas.emitir')->name('facturacion.update');
    Route::delete('/facturacion/{invoice}', [CashierController::class, 'destroyInvoice'])->middleware('permission:facturas.cancelar')->name('facturacion.destroy');
    Route::get('/pagos', [CashierController::class, 'payments'])->middleware('permission:pagos.leer')->name('pagos.index');
    Route::post('/pagos', [CashierController::class, 'storePayment'])->middleware('permission:pagos.crear')->name('pagos.store');
    Route::put('/pagos/{payment}', [CashierController::class, 'updatePayment'])->middleware('permission:pagos.crear')->name('pagos.update');
    Route::delete('/pagos/{payment}', [CashierController::class, 'destroyPayment'])->middleware('permission:pagos.crear')->name('pagos.destroy');
    Route::get('/corte', [CashierController::class, 'closing'])->middleware('permission:cierre_de_efectivo.leer')->name('corte.index');
    Route::get('/reportes', [CashierController::class, 'reports'])->middleware('permission:informes.leer')->name('reportes.index');
});

Route::middleware(['auth', 'password.changed', 'role:Limpieza|Administrador|Gerente'])->prefix('limpieza')->name('limpieza.')->group(function () {
    Route::get('/habitaciones', [HousekeepingController::class, 'rooms'])->middleware('permission:habitaciones.leer')->name('habitaciones.index');
    Route::post('/habitaciones', [HousekeepingController::class, 'storeRoom'])->middleware('permission:habitaciones.crear')->name('habitaciones.store');
    Route::put('/habitaciones/{room}', [HousekeepingController::class, 'updateRoom'])->middleware('permission:habitaciones.actualizar')->name('habitaciones.update');
    Route::delete('/habitaciones/{room}', [HousekeepingController::class, 'destroyRoom'])->middleware('permission:habitaciones.desactivar')->name('habitaciones.destroy');
    Route::patch('/habitaciones/{room}/estado', [HousekeepingController::class, 'changeRoomStatus'])->middleware('permission:rooms.change_status')->name('habitaciones.estado');
    Route::get('/estados', [HousekeepingController::class, 'statuses'])->middleware('permission:rooms.change_status')->name('estados.index');
});

Route::middleware(['auth', 'password.changed', 'role:Huesped'])->prefix('huesped')->name('huesped.')->group(function () {
    Route::get('/perfil', [PortalController::class, 'profile'])->middleware('permission:perfil.leer')->name('perfil.show');
    Route::put('/perfil', [PortalController::class, 'updateProfile'])->middleware('permission:perfil.actualizar')->name('perfil.update');
    Route::get('/reservas', [PortalController::class, 'reservations'])->middleware('permission:reservas.leer_own')->name('reservas.index');
    Route::post('/reservas', [PortalController::class, 'storeReservation'])->middleware('permission:reservas.crear')->name('reservas.store');
    Route::delete('/reservas/{reservation}', [PortalController::class, 'destroyReservation'])->middleware('permission:reservas.cancelar_own')->name('reservas.destroy');
    Route::get('/facturas', [PortalController::class, 'invoices'])->middleware('permission:facturas.leer_own')->name('facturas.index');
    Route::get('/pagos', [PortalController::class, 'payments'])->middleware('permission:pagos.crear_own')->name('pagos.index');
});
