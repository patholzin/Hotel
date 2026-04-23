import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AdminBitacoraService, RegistroBitacora } from '../../core/admin/admin-bitacora.service';
import { AuthService } from '../../core/auth/auth.service';

type MenuIcono =
  | 'dashboard'
  | 'usuarios'
  | 'bitacora'
  | 'reservaciones'
  | 'huespedes'
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

@Component({
  standalone: true,
  selector: 'app-admin-bitacora-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-bitacora.page.html',
  styleUrl: './admin-bitacora.page.scss',
})
export class AdminBitacoraPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly service = inject(AdminBitacoraService);
  private readonly fb = inject(FormBuilder);

  readonly usuario = computed(() => this.auth.usuario());
  readonly rolPrincipal = computed(() => this.usuario()?.roles?.[0] ?? 'Sin rol');

  readonly registros = signal<RegistroBitacora[]>([]);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly total = signal(0);

  readonly menuItems = computed(() => this.crearMenu(['Dashboard', 'Usuarios', 'Bitacora', 'Reservaciones', 'Huespedes', 'Habitaciones', 'Finanzas', 'Reportes', 'Configuracion']));

  readonly filtros = this.fb.nonNullable.group({
    usuario_id: [''],
    accion: [''],
    entidad: [''],
    desde: [''],
    hasta: [''],
    q: [''],
  });

  ngOnInit(): void {
    this.buscar();
  }

  buscar(): void {
    this.cargando.set(true);
    this.error.set(null);

    const filtrosRaw = this.filtros.getRawValue();

    const usuarioId = filtrosRaw.usuario_id ? Number(filtrosRaw.usuario_id) : null;

    this.service.listar({
      usuario_id: Number.isNaN(usuarioId ?? NaN) ? null : usuarioId,
      accion: filtrosRaw.accion,
      entidad: filtrosRaw.entidad,
      desde: filtrosRaw.desde,
      hasta: filtrosRaw.hasta,
      q: filtrosRaw.q,
      per_page: 50,
    }).subscribe({
      next: (response) => {
        this.registros.set(response.data.data ?? []);
        this.total.set(response.data.total ?? 0);
      },
      error: (response) => {
        this.error.set(response?.error?.message ?? 'No se pudo cargar la bitácora.');
        this.cargando.set(false);
      },
      complete: () => this.cargando.set(false),
    });
  }

  limpiar(): void {
    this.filtros.reset({
      usuario_id: '',
      accion: '',
      entidad: '',
      desde: '',
      hasta: '',
      q: '',
    });

    this.buscar();
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

  formatearDetalles(detalles: Record<string, unknown> | null): string {
    if (!detalles || !Object.keys(detalles).length) {
      return '-';
    }

    return Object.entries(detalles)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(' | ');
  }

  private crearMenu(labels: string[]): MenuItem[] {
    return labels.map((label) => ({
      label,
      icono: this.iconoPorLabel(label),
      route: this.rutaPorLabel(label),
    }));
  }

  private iconoPorLabel(label: string): MenuIcono {
    const valor = label.toLowerCase();

    if (valor.includes('dashboard')) return 'dashboard';
    if (valor.includes('usuario')) return 'usuarios';
    if (valor.includes('bitacora')) return 'bitacora';
    if (valor.includes('reserva')) return 'reservaciones';
    if (valor.includes('huesped')) return 'huespedes';
    if (valor.includes('habitacion')) return 'habitaciones';
    if (valor.includes('finanza')) return 'finanzas';
    if (valor.includes('reporte')) return 'reportes';
    if (valor.includes('configuracion')) return 'configuracion';
    if (valor.includes('disponibilidad')) return 'disponibilidad';
    if (valor.includes('huesped')) return 'huespedes';
    if (valor.includes('check-in')) return 'checkin';
    if (valor.includes('factura')) return 'facturas';
    if (valor.includes('pago')) return 'pagos';
    if (valor.includes('caja')) return 'caja';
    if (valor.includes('estado')) return 'estados';
    if (valor.includes('estancia')) return 'estancias';
    if (valor.includes('perfil')) return 'perfil';

    return 'dashboard';
  }

  private rutaPorLabel(label: string): string | null {
    const valor = label.toLowerCase();

    if (valor.includes('dashboard')) return '/panel';
    if (valor.includes('usuario')) return '/admin/usuarios';
    if (valor.includes('bitacora')) return '/admin/bitacora';

    return null;
  }
}
