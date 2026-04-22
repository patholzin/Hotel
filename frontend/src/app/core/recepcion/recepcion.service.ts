import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface Habitacion {
  id: number;
  number: string;
  type: string;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  floor: number | null;
  capacity: number;
  price_per_night: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Reservacion {
  id: number;
  code: string;
  user_id: number;
  room_id: number | null;
  check_in_date: string;
  check_out_date: string;
  guests_count: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  total_amount: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  user?: { id: number; name: string; email: string };
  room?: { id: number; number: string; type: string; status: string } | null;
}

export interface PayloadCrearReservacion {
  user_id: number;
  room_id?: number | null;
  check_in_date: string;
  check_out_date: string;
  guests_count: number;
  status: string;
  total_amount: number;
  notes?: string;
}

export interface PayloadActualizarReservacion {
  room_id?: number | null;
  check_in_date?: string;
  check_out_date?: string;
  guests_count?: number;
  status?: string;
  total_amount?: number;
  notes?: string;
}

interface RespuestaReservaciones {
  data: Reservacion[];
  module: string;
}

interface RespuestaReservacion {
  data: Reservacion;
  message: string;
}

interface RespuestaDisponibilidad {
  data: Habitacion[];
  module: string;
}

@Injectable({ providedIn: 'root' })
export class RecepcionService {
  private readonly http = inject(HttpClient);

  private readonly BASE = '/api';

  listarReservaciones(): Observable<RespuestaReservaciones> {
    return this.http.get<RespuestaReservaciones>(`${this.BASE}/recepcion/reservas`);
  }

  crearReservacion(payload: PayloadCrearReservacion): Observable<RespuestaReservacion> {
    return this.http.post<RespuestaReservacion>(`${this.BASE}/recepcion/reservas`, payload);
  }

  actualizarReservacion(id: number, payload: PayloadActualizarReservacion): Observable<RespuestaReservacion> {
    return this.http.put<RespuestaReservacion>(`${this.BASE}/recepcion/reservas/${id}`, payload);
  }

  eliminarReservacion(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.BASE}/recepcion/reservas/${id}`);
  }

  listarDisponibilidad(): Observable<RespuestaDisponibilidad> {
    return this.http.get<RespuestaDisponibilidad>(`${this.BASE}/recepcion/disponibilidad`);
  }
}