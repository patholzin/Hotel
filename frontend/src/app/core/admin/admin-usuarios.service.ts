import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ENDPOINTS_API } from '../api/endpoints';

export interface UsuarioAdmin {
  id: number;
  name: string;
  email: string;
  activo: boolean;
  roles: Array<{ id?: number; name: string }>;
}

interface RespuestaUsuarios {
  data: UsuarioAdmin[];
  message: string;
}

interface RespuestaUsuario {
  data: UsuarioAdmin;
  message: string;
}

interface PayloadCrearUsuario {
  name: string;
  email: string;
  role: string;
  password: string;
  password_confirmation: string;
}

interface PayloadActualizarUsuario {
  name: string;
  email: string;
  role: string;
  password?: string;
  password_confirmation?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminUsuariosService {
  private readonly http = inject(HttpClient);

  listar(): Observable<RespuestaUsuarios> {
    return this.http.get<RespuestaUsuarios>(ENDPOINTS_API.admin.usuarios);
  }

  crear(payload: PayloadCrearUsuario): Observable<RespuestaUsuario> {
    return this.http.post<RespuestaUsuario>(ENDPOINTS_API.admin.usuarios, payload);
  }

  actualizar(id: number, payload: PayloadActualizarUsuario): Observable<RespuestaUsuario> {
    return this.http.put<RespuestaUsuario>(`${ENDPOINTS_API.admin.usuarios}/${id}`, payload);
  }

  eliminar(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${ENDPOINTS_API.admin.usuarios}/${id}`);
  }

  cambiarEstado(id: number, activo: boolean): Observable<RespuestaUsuario> {
    return this.http.patch<RespuestaUsuario>(ENDPOINTS_API.admin.estadoUsuario(id), { activo });
  }
}
