import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

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

@Component({
  standalone: true,
  selector: 'app-panel-page',
  imports: [CommonModule],
  templateUrl: './panel.page.html',
  styleUrl: './panel.page.scss',
})
export class PanelPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly usuario = computed(() => this.auth.usuario());
  readonly rolPrincipal = computed(() => this.usuario()?.roles?.[0] ?? 'Sin rol');

  readonly resumenRol = computed(() => {
    const rol = this.rolPrincipal().toLowerCase();

    if (rol === 'administrador') {
      return 'Control completo de operaciones, usuarios y configuracion general del hotel.';
    }

    if (rol === 'recepcionista') {
      return 'Gestion diaria de ingresos, reservaciones, check-in y atencion a huespedes.';
    }

    if (rol === 'cajero') {
      return 'Seguimiento de cobros, facturacion y control de caja para cierre operativo.';
    }

    if (rol === 'limpieza') {
      return 'Supervision del estado de habitaciones y coordinacion de tareas de limpieza.';
    }

    if (rol === 'cliente') {
      return 'Consulta de reservas, facturas y pagos dentro del portal de clientes.';
    }

    return 'Acceso al panel principal del sistema Hotel Juquilita.';
  });

  readonly menuItems = computed(() => {
    const rol = this.rolPrincipal().toLowerCase();

    if (rol === 'administrador') {
      return this.crearMenu(['Dashboard', 'Usuarios', 'Bitacora', 'Reservaciones', 'Clientes', 'Habitaciones', 'Finanzas', 'Reportes', 'Configuracion']);
    }

    if (rol === 'recepcionista') {
      return this.crearMenu(['Dashboard', 'Reservaciones', 'Disponibilidad', 'Huespedes', 'Check-in / Check-out']);
    }

    if (rol === 'cajero') {
      return this.crearMenu(['Dashboard', 'Facturas', 'Pagos', 'Caja', 'Reportes']);
    }

    if (rol === 'limpieza') {
      return this.crearMenu(['Dashboard', 'Habitaciones', 'Estados', 'Estancias']);
    }

    if (rol === 'cliente') {
      return this.crearMenu(['Dashboard', 'Mis reservas', 'Mis facturas', 'Mis pagos', 'Mi perfil']);
    }

    return this.crearMenu(['Dashboard']);
  });

  readonly metricas = computed(() => {
    const rol = this.rolPrincipal().toLowerCase();
    const permisos = this.usuario()?.permissions?.length ?? 0;

    if (rol === 'administrador') {
      return [
        { etiqueta: 'Reservas del dia', valor: '7' },
        { etiqueta: 'Clientes registrados', valor: '158' },
        { etiqueta: 'Habitaciones ocupadas', valor: '21' },
        { etiqueta: 'Ingresos mensuales', valor: '$185,320' },
      ];
    }

    if (rol === 'recepcionista') {
      return [
        { etiqueta: 'Check-ins hoy', valor: '14' },
        { etiqueta: 'Check-outs hoy', valor: '11' },
        { etiqueta: 'Habitaciones disponibles', valor: '18' },
        { etiqueta: 'Solicitudes pendientes', valor: '6' },
      ];
    }

    if (rol === 'cajero') {
      return [
        { etiqueta: 'Facturas emitidas hoy', valor: '23' },
        { etiqueta: 'Pagos registrados', valor: '31' },
        { etiqueta: 'Cierre parcial', valor: '$42,580' },
        { etiqueta: 'Comprobantes pendientes', valor: '4' },
      ];
    }

    if (rol === 'limpieza') {
      return [
        { etiqueta: 'Habitaciones pendientes', valor: '9' },
        { etiqueta: 'Habitaciones listas', valor: '26' },
        { etiqueta: 'Incidencias activas', valor: '2' },
        { etiqueta: 'Tareas finalizadas', valor: '18' },
      ];
    }

    if (rol === 'cliente') {
      return [
        { etiqueta: 'Reservas activas', valor: '2' },
        { etiqueta: 'Proxima llegada', valor: '26 Abr' },
        { etiqueta: 'Facturas emitidas', valor: '5' },
        { etiqueta: 'Pagos realizados', valor: '$8,540' },
      ];
    }

    return [
      { etiqueta: 'Roles asignados', valor: String(this.usuario()?.roles?.length ?? 0) },
      { etiqueta: 'Permisos cargados', valor: String(permisos) },
      { etiqueta: 'Cambio de contrasena', valor: this.usuario()?.must_change_password ? 'Pendiente' : 'Completado' },
      { etiqueta: 'Estado de sesion', valor: 'Activo' },
    ];
  });

  salir(): void {
    this.auth.cerrarSesion().subscribe({
      next: () => void this.router.navigateByUrl('/ingresar'),
      error: () => void this.router.navigateByUrl('/ingresar'),
    });
  }

  private crearMenu(labels: string[]): MenuItem[] {
    return labels.map((label) => ({
      label,
      icono: this.iconoPorLabel(label),
      route: this.rutaPorLabel(label),
    }));
  }

  navegar(item: MenuItem, event: Event): void {
    if (!item.route) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    void this.router.navigateByUrl(item.route);
  }

  private iconoPorLabel(label: string): MenuIcono {
    const valor = label.toLowerCase();

    if (valor.includes('dashboard')) return 'dashboard';
    if (valor.includes('usuario')) return 'usuarios';
    if (valor.includes('bitacora')) return 'bitacora';
    if (valor.includes('reserva')) return 'reservaciones';
    if (valor.includes('cliente')) return 'clientes';
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

    // Admin
    if (valor.includes('usuario')) return '/admin/usuarios';
    if (valor.includes('bitacora')) return '/admin/bitacora';

    // Recepcionista
    if (valor.includes('reserva')) return '/recepcion/reservas';
    if (valor.includes('disponibilidad')) return '/recepcion/reservas';
    if (valor.includes('huesped')) return '/recepcion/reservas';
    if (valor.includes('check-in')) return '/recepcion/reservas';

    return null;
  }
}