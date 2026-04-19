import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.estaAutenticado) {
    return router.parseUrl('/ingresar');
  }

  if (auth.requiereCambioContrasena && state.url !== '/cambiar-contrasena') {
    return router.parseUrl('/cambiar-contrasena');
  }

  return true;
};
