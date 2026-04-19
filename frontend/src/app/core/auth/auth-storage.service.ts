import { Injectable } from '@angular/core';

import { UsuarioAutenticado } from './auth.models';

const TOKEN_KEY = 'hotel.token';
const USER_KEY = 'hotel.user';

@Injectable({ providedIn: 'root' })
export class AuthStorageService {
  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  set token(value: string | null) {
    if (!value) {
      localStorage.removeItem(TOKEN_KEY);
      return;
    }

    localStorage.setItem(TOKEN_KEY, value);
  }

  get user(): UsuarioAutenticado | null {
    const value = localStorage.getItem(USER_KEY);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as UsuarioAutenticado;
    } catch {
      return null;
    }
  }

  set user(value: UsuarioAutenticado | null) {
    if (!value) {
      localStorage.removeItem(USER_KEY);
      return;
    }

    localStorage.setItem(USER_KEY, JSON.stringify(value));
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}
