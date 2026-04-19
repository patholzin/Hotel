import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { ENDPOINTS_API } from '../api/endpoints';
import { AuthStorageService } from './auth-storage.service';
import { RespuestaAutenticacion, RespuestaMe, UsuarioAutenticado } from './auth.models';

interface CredencialesLogin {
  email: string;
  password: string;
}

interface RegistroClientePayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface CambioContrasena {
  current_password: string;
  password: string;
  password_confirmation: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(AuthStorageService);
  private readonly router = inject(Router);

  readonly usuario = signal<UsuarioAutenticado | null>(this.storage.user);
  readonly token = signal<string | null>(this.storage.token);

  constructor() {
    if (this.storage.token && !this.usuario()) {
      this.refrescarSesion().subscribe({
        error: () => this.limpiarSesion(),
      });
    }
  }

  get estaAutenticado(): boolean {
    return Boolean(this.token());
  }

  get requiereCambioContrasena(): boolean {
    return Boolean(this.usuario()?.must_change_password);
  }

  iniciarSesion(credenciales: CredencialesLogin): Observable<RespuestaAutenticacion> {
    return this.http.post<RespuestaAutenticacion>(ENDPOINTS_API.autenticacion.iniciarSesion, {
      ...credenciales,
      device_name: 'frontend',
    }).pipe(
      tap((respuesta) => this.persistirSesion(respuesta.user, respuesta.token ?? null))
    );
  }

  registrarCliente(payload: RegistroClientePayload): Observable<RespuestaAutenticacion> {
    return this.http.post<RespuestaAutenticacion>(ENDPOINTS_API.autenticacion.registroCliente, {
      ...payload,
      device_name: 'frontend',
    }).pipe(
      tap((respuesta) => this.persistirSesion(respuesta.user, respuesta.token ?? null))
    );
  }

  cerrarSesion(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(ENDPOINTS_API.autenticacion.cerrarSesion, {}).pipe(
      tap(() => this.limpiarSesion())
    );
  }

  refrescarSesion(): Observable<RespuestaMe> {
    return this.http.get<RespuestaMe>(ENDPOINTS_API.autenticacion.perfil).pipe(
      tap((respuesta) => this.persistirUsuario(respuesta.user))
    );
  }

  cambiarContrasena(payload: CambioContrasena): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(ENDPOINTS_API.autenticacion.cambiarContrasena, payload).pipe(
      tap(() => {
        const usuarioActual = this.usuario();

        if (usuarioActual) {
          this.persistirUsuario({
            ...usuarioActual,
            must_change_password: false,
            password_changed_at: new Date().toISOString(),
          });
        }
      })
    );
  }

  irAlDestinoInicial(): void {
    const usuario = this.usuario();

    if (!usuario) {
      void this.router.navigateByUrl('/ingresar');
      return;
    }

    if (usuario.must_change_password) {
      void this.router.navigateByUrl('/cambiar-contrasena');
      return;
    }

    void this.router.navigateByUrl('/panel');
  }

  private persistirSesion(usuario: UsuarioAutenticado, token: string | null): void {
    this.token.set(token);
    this.usuario.set(usuario);
    this.storage.token = token;
    this.storage.user = usuario;
  }

  private persistirUsuario(usuario: UsuarioAutenticado): void {
    this.usuario.set(usuario);
    this.storage.user = usuario;
  }

  private limpiarSesion(): void {
    this.token.set(null);
    this.usuario.set(null);
    this.storage.clear();
  }
}
