import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-cambiar-contrasena-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cambiar-contrasena.page.html',
  styleUrl: './cambiar-contrasena.page.scss',
})
export class CambiarContrasenaPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly cargando = signal(false);
  readonly mensaje = signal<string | null>(null);

  readonly formulario = this.formBuilder.nonNullable.group({
    current_password: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', [Validators.required]],
  });

  guardar(): void {
    if (this.formulario.invalid || this.cargando()) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.mensaje.set(null);

    this.auth.cambiarContrasena(this.formulario.getRawValue()).subscribe({
      next: () => {
        this.mensaje.set('Contraseña actualizada correctamente.');
        void this.router.navigateByUrl('/panel');
      },
      error: (response) => {
        this.mensaje.set(response?.error?.message ?? 'No se pudo actualizar la contraseña.');
        this.cargando.set(false);
      },
      complete: () => this.cargando.set(false),
    });
  }

  salir(): void {
    void this.router.navigateByUrl('/ingresar');
  }
}
