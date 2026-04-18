<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::rename('rooms', 'habitaciones');
        Schema::rename('reservations', 'reservaciones');
        Schema::rename('invoices', 'facturas');
        Schema::rename('payments', 'pagos');
        Schema::rename('users', 'usuarios');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::rename('usuarios', 'users');
        Schema::rename('pagos', 'payments');
        Schema::rename('facturas', 'invoices');
        Schema::rename('reservaciones', 'reservations');
        Schema::rename('habitaciones', 'rooms');
    }
};