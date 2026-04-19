import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthStorageService } from './auth-storage.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const storage = inject(AuthStorageService);
  const token = storage.token;

  if (!token) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  }));
};
