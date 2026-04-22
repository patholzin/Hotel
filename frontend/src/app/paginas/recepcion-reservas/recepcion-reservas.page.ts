import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { RecepcionService, Reservacion, Habitacion } from '../../core/recepcion/recepcion.service';

type MenuIcono =
  | 'dashboard'
  | 'usuarios'
  | 'bitacora'
  | 'reservaciones'
  | 'clientes'
  | 'habitaciones'
  | 'finanzas'
  | 'reportes'
  | 'configuracion'
  | 'disponibilidad'
  | 'huespedes'
  | 'checkin'
  | 'facturas'
  | 'pagos'
  | 'caja'
  | 'estados'
  | 'estancias'
  | 'perfil';

interface MenuItem {
  label: string;
  icono: MenuIcono;
  route: string | null;
}

type TabActiva = 'reservas' | 'disponibilidad';

@Component({
  standalone: true,
  selector: 'app-recepcion-reservas-page',
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './recepcion-reservas.page.html',
  styleUrl: './recepcion-reservas.page.scss',
})
export class RecepcionReservasPage implements OnInit {
String(arg0: number): string|undefined {
throw new Error('Method not implemented.');
}
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly service = inject(RecepcionService);
  private readonly fb = inject(FormBuilder);

  readonly usuario = computed(() => this.auth.usuario());
  readonly rolPrincipal = computed(() => this.usuario()?.roles?.[0] ?? 'Sin rol');

  readonly tabActiva = signal<TabActiva>('reservas');
  readonly reservaciones = signal<Reservacion[]>([]);
  readonly habitacionesDisponibles = signal<Habitacion[]>([]);

  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);
  readonly exito = signal<string | null>(null);
  readonly editandoId = signal<number | null>(null);
  readonly filtroEstado = signal<string>('todos');

  readonly estadosReservacion: Array<{ valor: string; etiqueta: string }> = [
    { valor: 'pending', etiqueta: 'Pendiente' },
    { valor: 'confirmed', etiqueta: 'Confirmada' },
    { valor: 'checked_in', etiqueta: 'Check-in' },
    { valor: 'checked_out', etiqueta: 'Check-out' },
    { valor: 'cancelled', etiqueta: 'Cancelada' },
  ];

  readonly reservacionesFiltradas = computed(() => {
    const filtro = this.filtroEstado();
    if (filtro === 'todos') return this.reservaciones();
    return this.reservaciones().filter((r) => r.status === filtro);
  });

  readonly menuItems = computed(() =>
    this.crearMenu(['Dashboard', 'Reservaciones', 'Disponibilidad', 'Huespedes', 'Facturas'])
  );

  readonly formulario = this.fb.nonNullable.group({
    user_id: ['', [Validators.required]],
    room_id: [''],
    check_in_date: ['', [Validators.required]],
    check_out_date: ['', [Validators.required]],
    guests_count: [1, [Validators.required, Validators.min(1)]],
    status: ['pending', [Validators.required]],
    total_amount: [0, [Validators.required, Validators.min(0)]],
    notes: [''],
  });

  ngOnInit(): void {
    this.cargarReservaciones();
    this.cargarDisponibilidad();
  }

  get esEdicion(): boolean {
    return this.editandoId() !== null;
  }

  cambiarTab(tab: TabActiva): void {
    this.tabActiva.set(tab);
  }

  enviar(): void {
    if (this.formulario.invalid || this.guardando()) {
      this.formulario.markAllAsTouched();
      return;
    }

    const raw = this.formulario.getRawValue();
    this.guardando.set(true);
    this.error.set(null);
    this.exito.set(null);

    const payload = {
      user_id: Number(raw.user_id),
      room_id: raw.room_id ? Number(raw.room_id) : null,
      check_in_date: raw.check_in_date,
      check_out_date: raw.check_out_date,
      guests_count: Number(raw.guests_count),
      status: raw.status,
      total_amount: Number(raw.total_amount),
      notes: raw.notes || undefined,
    };

    if (this.esEdicion) {
      const id = this.editandoId()!;
      this.service.actualizarReservacion(id, payload).subscribe({
        next: () => {
          this.exito.set('Reservación actualizada correctamente.');
          this.restablecerFormulario();
          this.cargarReservaciones();
        },
        error: (res) => {
          this.error.set(res?.error?.message ?? 'No se pudo actualizar la reservación.');
          this.guardando.set(false);
        },
        complete: () => this.guardando.set(false),
      });
      return;
    }

    this.service.crearReservacion(payload).subscribe({
      next: () => {
        this.exito.set('Reservación creada correctamente.');
        this.restablecerFormulario();
        this.cargarReservaciones();
      },
      error: (res) => {
        this.error.set(res?.error?.message ?? 'No se pudo crear la reservación.');
        this.guardando.set(false);
      },
      complete: () => this.guardando.set(false),
    });
  }

  editar(reservacion: Reservacion): void {
    this.editandoId.set(reservacion.id);
    this.error.set(null);
    this.exito.set(null);
    this.tabActiva.set('reservas');

    this.formulario.setValue({
      user_id: String(reservacion.user_id),
      room_id: reservacion.room_id ? String(reservacion.room_id) : '',
      check_in_date: reservacion.check_in_date,
      check_out_date: reservacion.check_out_date,
      guests_count: reservacion.guests_count,
      status: reservacion.status,
      total_amount: Number(reservacion.total_amount),
      notes: reservacion.notes ?? '',
    });
  }

  cancelarEdicion(): void {
    this.restablecerFormulario();
    this.error.set(null);
    this.exito.set(null);
  }

  eliminar(reservacion: Reservacion): void {
    const confirmado = window.confirm(`¿Eliminar la reservación ${reservacion.code}?`);
    if (!confirmado || this.guardando()) return;

    this.guardando.set(true);
    this.error.set(null);
    this.exito.set(null);

    this.service.eliminarReservacion(reservacion.id).subscribe({
      next: () => {
        this.exito.set('Reservación eliminada correctamente.');
        this.cargarReservaciones();
      },
      error: (res) => {
        this.error.set(res?.error?.message ?? 'No se pudo eliminar la reservación.');
        this.guardando.set(false);
      },
      complete: () => this.guardando.set(false),
    });
  }

  cambiarEstadoRapido(reservacion: Reservacion, nuevoEstado: string): void {
    if (this.guardando()) return;

    this.guardando.set(true);
    this.error.set(null);
    this.exito.set(null);

    this.service.actualizarReservacion(reservacion.id, { status: nuevoEstado }).subscribe({
      next: () => {
        this.exito.set('Estado actualizado.');
        this.cargarReservaciones();
      },
      error: (res) => {
        this.error.set(res?.error?.message ?? 'No se pudo actualizar el estado.');
        this.guardando.set(false);
      },
      complete: () => this.guardando.set(false),
    });
  }

  etiquetaEstado(status: string): string {
    return this.estadosReservacion.find((e) => e.valor === status)?.etiqueta ?? status;
  }

  navegar(item: MenuItem, event: Event): void {
    if (!item.route) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    void this.router.navigateByUrl(item.route);
  }

  salir(): void {
    this.auth.cerrarSesion().subscribe({
      next: () => void this.router.navigateByUrl('/ingresar'),
      error: () => void this.router.navigateByUrl('/ingresar'),
    });
  }

  private cargarReservaciones(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.service.listarReservaciones().subscribe({
      next: (res) => this.reservaciones.set(res.data ?? []),
      error: (res) => {
        this.error.set(res?.error?.message ?? 'No se pudo cargar las reservaciones.');
        this.cargando.set(false);
      },
      complete: () => this.cargando.set(false),
    });
  }

  private cargarDisponibilidad(): void {
    this.service.listarDisponibilidad().subscribe({
      next: (res) => this.habitacionesDisponibles.set(res.data ?? []),
      error: () => {},
    });
  }

  private restablecerFormulario(): void {
    this.editandoId.set(null);
    this.formulario.reset({
      user_id: '',
      room_id: '',
      check_in_date: '',
      check_out_date: '',
      guests_count: 1,
      status: 'pending',
      total_amount: 0,
      notes: '',
    });
  }

  private crearMenu(labels: string[]): MenuItem[] {
    return labels.map((label) => ({
      label,
      icono: this.iconoPorLabel(label),
      route: this.rutaPorLabel(label),
    }));
  }

  private iconoPorLabel(label: string): MenuIcono {
    const v = label.toLowerCase();
    if (v.includes('dashboard')) return 'dashboard';
    if (v.includes('reserva')) return 'reservaciones';
    if (v.includes('disponibilidad')) return 'disponibilidad';
    if (v.includes('huesped')) return 'huespedes';
    if (v.includes('factura')) return 'facturas';
    return 'dashboard';
  }

  private rutaPorLabel(label: string): string | null {
    const v = label.toLowerCase();
    if (v.includes('dashboard')) return '/panel';
    if (v.includes('reserva')) return '/recepcion/reservas';
    return null;
  }
}