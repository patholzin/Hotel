import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-registro-huesped-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro-huesped.page.html',
  styleUrl: './registro-huesped.page.scss',
})
export class RegistroHuespedPage {
  private static readonly passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  readonly formulario = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(RegistroHuespedPage.passwordPolicy)]],
    password_confirmation: ['', [Validators.required]],
  }, { validators: this.passwordsMatchValidator() });

  get nombreControl(): AbstractControl {
    return this.formulario.controls.name;
  }

  get emailControl(): AbstractControl {
    return this.formulario.controls.email;
  }

  get passwordControl(): AbstractControl {
    return this.formulario.controls.password;
  }

  get passwordConfirmControl(): AbstractControl {
    return this.formulario.controls.password_confirmation;
  }

  private passwordsMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password')?.value;
      const confirmation = control.get('password_confirmation')?.value;

      if (!password || !confirmation || password === confirmation) {
        return null;
      }

      return { passwordMismatch: true };
    };
  }

  enviar(): void {
    if (this.formulario.invalid || this.cargando()) {
      this.formulario.markAllAsTouched();
      return;
    }

    const payload = this.formulario.getRawValue();

    this.cargando.set(true);
    this.error.set(null);

    this.auth.registrarHuesped(payload).subscribe({
      next: () => {
        void this.router.navigateByUrl('/panel');
      },
      error: (response) => {
        const errores = response?.error?.errors;
        const primerError = errores ? Object.values(errores).flat().at(0) : null;
        this.error.set(primerError ?? response?.error?.message ?? 'No se pudo crear la cuenta.');
        this.cargando.set(false);
      },
      complete: () => this.cargando.set(false),
    });
  }
}
