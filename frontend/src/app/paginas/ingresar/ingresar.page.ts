import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-ingresar-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './ingresar.page.html',
  styleUrl: './ingresar.page.scss',
})
export class IngresarPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  readonly formulario = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  enviar(): void {
    if (this.formulario.invalid || this.cargando()) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    this.auth.iniciarSesion(this.formulario.getRawValue()).subscribe({
      next: (respuesta) => {
        if (respuesta.user.must_change_password) {
          void this.router.navigateByUrl('/cambiar-contrasena');
          return;
        }

        void this.router.navigateByUrl('/panel');
      },
      error: (response) => {
        this.error.set(response?.error?.message ?? 'No se pudo iniciar sesión.');
        this.cargando.set(false);
      },
      complete: () => this.cargando.set(false),
    });
  }
}
