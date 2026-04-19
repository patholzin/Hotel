<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Services\BitacoraService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CashierController extends Controller
{
    public function invoices(Request $request): JsonResponse
    {
        return response()->json(['module' => 'caja.facturacion', 'data' => Invoice::with(['user:id,name,email', 'reservation:id,code'])->latest()->get(), 'actor' => $request->user()?->only(['id', 'name', 'email'])]);
    }

    public function storeInvoice(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['nullable', 'exists:usuarios,id'],
            'reservation_id' => ['nullable', 'exists:reservaciones,id'],
            'status' => ['required', 'in:draft,issued,cancelled'],
            'subtotal' => ['required', 'numeric', 'min:0'],
            'tax' => ['required', 'numeric', 'min:0'],
            'total' => ['required', 'numeric', 'min:0'],
        ]);

        $invoice = Invoice::create(array_merge($validated, [
            'number' => 'INV-' . Str::upper(Str::random(8)),
            'issued_at' => $validated['status'] === 'issued' ? now() : null,
            'cancelled_at' => $validated['status'] === 'cancelled' ? now() : null,
        ]));

        BitacoraService::registrar($request, 'facturas.crear', 'factura', $invoice->id, [
            'numero' => $invoice->number,
            'estado' => $invoice->status,
            'total' => $invoice->total,
        ]);

        return response()->json(['message' => 'Factura creada', 'data' => $invoice->load(['user', 'reservation'])], 201);
    }

    public function updateInvoice(Request $request, Invoice $invoice): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['sometimes', 'in:draft,issued,cancelled'],
            'subtotal' => ['sometimes', 'numeric', 'min:0'],
            'tax' => ['sometimes', 'numeric', 'min:0'],
            'total' => ['sometimes', 'numeric', 'min:0'],
        ]);

        if (($validated['status'] ?? null) === 'issued') {
            $validated['issued_at'] = now();
        }

        if (($validated['status'] ?? null) === 'cancelled') {
            $validated['cancelled_at'] = now();
        }

        $invoice->update($validated);

        BitacoraService::registrar($request, 'facturas.actualizar', 'factura', $invoice->id, [
            'cambios' => array_keys($validated),
            'estado' => $invoice->status,
        ]);

        return response()->json(['message' => 'Factura actualizada', 'data' => $invoice->load(['user', 'reservation'])]);
    }

    public function destroyInvoice(Request $request, Invoice $invoice): JsonResponse
    {
        $invoiceId = $invoice->id;
        $number = $invoice->number;
        $invoice->delete();

        BitacoraService::registrar($request, 'facturas.eliminar', 'factura', $invoiceId, [
            'numero' => $number,
        ]);

        return response()->json(['message' => 'Factura eliminada']);
    }

    public function payments(Request $request): JsonResponse
    {
        return response()->json(['module' => 'caja.pagos', 'data' => Payment::with(['user:id,name,email', 'reservation:id,code', 'invoice:id,number'])->latest()->get(), 'actor' => $request->user()?->only(['id', 'name', 'email'])]);
    }

    public function storePayment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['nullable', 'exists:usuarios,id'],
            'reservation_id' => ['nullable', 'exists:reservaciones,id'],
            'invoice_id' => ['nullable', 'exists:facturas,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'method' => ['required', 'string', 'max:50'],
            'status' => ['required', 'in:pending,paid,failed,refunded'],
            'reference' => ['nullable', 'string', 'max:255'],
        ]);

        $payment = Payment::create(array_merge($validated, [
            'paid_at' => $validated['status'] === 'paid' ? now() : null,
        ]));

        BitacoraService::registrar($request, 'pagos.crear', 'pago', $payment->id, [
            'monto' => $payment->amount,
            'estado' => $payment->status,
            'metodo' => $payment->method,
        ]);

        return response()->json(['message' => 'Pago registrado', 'data' => $payment->load(['user', 'reservation', 'invoice'])], 201);
    }

    public function updatePayment(Request $request, Payment $payment): JsonResponse
    {
        $validated = $request->validate([
            'amount' => ['sometimes', 'numeric', 'min:0.01'],
            'method' => ['sometimes', 'string', 'max:50'],
            'status' => ['sometimes', 'in:pending,paid,failed,refunded'],
            'reference' => ['nullable', 'string', 'max:255'],
        ]);

        if (($validated['status'] ?? null) === 'paid') {
            $validated['paid_at'] = now();
        }

        $payment->update($validated);

        BitacoraService::registrar($request, 'pagos.actualizar', 'pago', $payment->id, [
            'cambios' => array_keys($validated),
            'estado' => $payment->status,
            'monto' => $payment->amount,
        ]);

        return response()->json(['message' => 'Pago actualizado', 'data' => $payment->load(['user', 'reservation', 'invoice'])]);
    }

    public function destroyPayment(Request $request, Payment $payment): JsonResponse
    {
        $paymentId = $payment->id;
        $amount = $payment->amount;
        $payment->delete();

        BitacoraService::registrar($request, 'pagos.eliminar', 'pago', $paymentId, [
            'monto' => $amount,
        ]);

        return response()->json(['message' => 'Pago eliminado']);
    }

    public function closing(Request $request): JsonResponse
    {
        return response()->json(['module' => 'caja.cierre', 'message' => 'Corte de caja', 'actor' => $request->user()?->only(['id', 'name', 'email'])]);
    }

    public function reports(Request $request): JsonResponse
    {
        return response()->json(['module' => 'caja.reportes', 'message' => 'Reportes de ingresos', 'actor' => $request->user()?->only(['id', 'name', 'email'])]);
    }
}