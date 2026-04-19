import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ENDPOINTS_API } from '../api/endpoints';

export interface RegistroBitacora {
  id: number;
  accion: string;
  entidad: string;
  entidad_id: number | null;
  detalles: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  usuario: {
    id: number;
    name: string;
    email: string;
  } | null;
}

interface RespuestaBitacora {
  data: {
    data: RegistroBitacora[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  message: string;
}

export interface FiltrosBitacora {
  usuario_id?: number | null;
  accion?: string;
  entidad?: string;
  desde?: string;
  hasta?: string;
  q?: string;
  per_page?: number;
}

@Injectable({ providedIn: 'root' })
export class AdminBitacoraService {
  private readonly http = inject(HttpClient);

  listar(filtros: FiltrosBitacora = {}): Observable<RespuestaBitacora> {
    let params = new HttpParams();

    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<RespuestaBitacora>(ENDPOINTS_API.admin.bitacora, { params });
  }
}
