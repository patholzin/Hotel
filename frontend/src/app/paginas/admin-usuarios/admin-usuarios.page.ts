import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { AdminUsuariosService, UsuarioAdmin } from '../../core/admin/admin-usuarios.service';

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
  selector: 'app-admin-usuarios-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-usuarios.page.html',
  styleUrl: './admin-usuarios.page.scss',
})
export class AdminUsuariosPage implements OnInit {
  private static readonly ROL_OCULTO = 'huesped';
  private static readonly ROLES_VISIBLES = new Set(['administrador', 'gerente', 'recepcionista', 'limpieza']);

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly service = inject(AdminUsuariosService);
  private readonly fb = inject(FormBuilder);

  readonly usuario = computed(() => this.auth.usuario());
  readonly rolPrincipal = computed(() => this.usuario()?.roles?.[0] ?? 'Sin rol');

  readonly usuarios = signal<UsuarioAdmin[]>([]);
  readonly usuariosVisibles = computed(() =>
    this.usuarios().filter((usuario) => {
      const rol = usuario.roles?.[0]?.name?.toLowerCase();
      return Boolean(rol && AdminUsuariosPage.ROLES_VISIBLES.has(rol));
    })
  );
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);
  readonly exito = signal<string | null>(null);
  readonly editandoId = signal<number | null>(null);

  readonly rolesDisponibles = ['Administrador', 'Gerente', 'Recepcionista', 'Limpieza'];

  readonly menuItems = computed(() => this.crearMenu(['Dashboard', 'Usuarios', 'Bitacora', 'Reservaciones', 'Huespedes', 'Habitaciones', 'Finanzas', 'Reportes', 'Configuracion']));

  readonly formulario = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['Administrador', [Validators.required]],
    password: [''],
    password_confirmation: [''],
  });

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  get esEdicion(): boolean {
    return this.editandoId() !== null;
  }

  enviar(): void {
    if (this.formulario.invalid || this.guardando()) {
      this.formulario.markAllAsTouched();
      return;
    }

    const payload = this.formulario.getRawValue();

    if (!this.esEdicion && payload.password.length < 8) {
      this.error.set('La contraseña debe tener al menos 8 caracteres para crear el usuario.');
      return;
    }

    if ((payload.password || payload.password_confirmation) && payload.password !== payload.password_confirmation) {
      this.error.set('La confirmación de contraseña no coincide.');
      return;
    }

    this.guardando.set(true);
    this.error.set(null);
    this.exito.set(null);

    if (this.esEdicion) {
      const id = this.editandoId();

      if (!id) {
        this.guardando.set(false);
        return;
      }

      const updatePayload: {
        name: string;
        email: string;
        role: string;
        password?: string;
        password_confirmation?: string;
      } = {
        name: payload.name,
        email: payload.email,
        role: payload.role,
      };

      if (payload.password) {
        updatePayload.password = payload.password;
        updatePayload.password_confirmation = payload.password_confirmation;
      }

      this.service.actualizar(id, updatePayload).subscribe({
        next: () => {
          this.exito.set('Usuario actualizado correctamente.');
          this.restablecerFormulario();
          this.cargarUsuarios();
        },
        error: (response) => {
          this.error.set(response?.error?.message ?? 'No se pudo actualizar el usuario.');
          this.guardando.set(false);
        },
        complete: () => this.guardando.set(false),
      });

      return;
    }

    this.service.crear({
      name: payload.name,
      email: payload.email,
      role: payload.role,
      password: payload.password,
      password_confirmation: payload.password_confirmation,
    }).subscribe({
      next: () => {
        this.exito.set('Usuario creado correctamente.');
        this.restablecerFormulario();
        this.cargarUsuarios();
      },
      error: (response) => {
        this.error.set(response?.error?.message ?? 'No se pudo crear el usuario.');
        this.guardando.set(false);
      },
      complete: () => this.guardando.set(false),
    });
  }

  editar(usuario: UsuarioAdmin): void {
    this.editandoId.set(usuario.id);
    this.error.set(null);
    this.exito.set(null);

    this.formulario.setValue({
      name: usuario.name,
      email: usuario.email,
      role: this.obtenerRolEditable(usuario),
      password: '',
      password_confirmation: '',
    });
  }

  cancelarEdicion(): void {
    this.restablecerFormulario();
    this.error.set(null);
  }

  eliminar(usuario: UsuarioAdmin): void {
    const confirmado = window.confirm(`¿Eliminar al usuario ${usuario.name}?`);

    if (!confirmado || this.guardando()) {
      return;
    }

    this.guardando.set(true);
    this.error.set(null);
    this.exito.set(null);

    this.service.eliminar(usuario.id).subscribe({
      next: () => {
        this.exito.set('Usuario eliminado correctamente.');
        this.cargarUsuarios();
      },
      error: (response) => {
        this.error.set(response?.error?.message ?? 'No se pudo eliminar el usuario.');
        this.guardando.set(false);
      },
      complete: () => this.guardando.set(false),
    });
  }

  cambiarEstado(usuario: UsuarioAdmin): void {
    if (this.guardando()) {
      return;
    }

    const nuevoEstado = !usuario.activo;
    const accion = nuevoEstado ? 'activar' : 'inactivar';
    const confirmado = window.confirm(`¿Desea ${accion} al usuario ${usuario.name}?`);

    if (!confirmado) {
      return;
    }

    this.guardando.set(true);
    this.error.set(null);
    this.exito.set(null);

    this.service.cambiarEstado(usuario.id, nuevoEstado).subscribe({
      next: () => {
        this.exito.set(nuevoEstado ? 'Usuario activado correctamente.' : 'Usuario inactivado correctamente.');
        this.cargarUsuarios();
      },
      error: (response) => {
        this.error.set(response?.error?.message ?? 'No se pudo cambiar el estado del usuario.');
        this.guardando.set(false);
      },
      complete: () => this.guardando.set(false),
    });
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

  private cargarUsuarios(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.service.listar().subscribe({
      next: (response) => {
        this.usuarios.set(response.data ?? []);
      },
      error: (response) => {
        this.error.set(response?.error?.message ?? 'No se pudo cargar el listado de usuarios.');
        this.cargando.set(false);
      },
      complete: () => this.cargando.set(false),
    });
  }

  private restablecerFormulario(): void {
    this.editandoId.set(null);
    this.formulario.reset({
      name: '',
      email: '',
      role: 'Administrador',
      password: '',
      password_confirmation: '',
    });
  }

  rolVisible(usuario: UsuarioAdmin): string {
    const rol = usuario.roles?.[0]?.name;

    if (!rol || rol.toLowerCase() === AdminUsuariosPage.ROL_OCULTO) {
      return 'Sin rol';
    }

    return rol;
  }

  private obtenerRolEditable(usuario: UsuarioAdmin): string {
    const rolActual = usuario.roles?.[0]?.name;

    if (!rolActual || rolActual.toLowerCase() === AdminUsuariosPage.ROL_OCULTO) {
      return 'Administrador';
    }

    return rolActual;
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
