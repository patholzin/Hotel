import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'ingresar',
	},
	{
		path: 'ingresar',
		loadComponent: () => import('./paginas/ingresar/ingresar.page').then((m) => m.IngresarPage),
	},
	{
		path: 'registro-cliente',
		loadComponent: () => import('./paginas/registro-cliente/registro-cliente.page').then((m) => m.RegistroClientePage),
	},
	{
		path: 'cambiar-contrasena',
		canActivate: [authGuard],
		loadComponent: () => import('./paginas/cambiar-contrasena/cambiar-contrasena.page').then((m) => m.CambiarContrasenaPage),
	},
	{
		path: 'panel',
		canActivate: [authGuard],
		loadComponent: () => import('./paginas/panel/panel.page').then((m) => m.PanelPage),
	},
	{
		path: 'admin/usuarios',
		canActivate: [authGuard],
		loadComponent: () => import('./paginas/admin-usuarios/admin-usuarios.page').then((m) => m.AdminUsuariosPage),
	},
	{
		path: 'admin/bitacora',
		canActivate: [authGuard],
		loadComponent: () => import('./paginas/admin-bitacora/admin-bitacora.page').then((m) => m.AdminBitacoraPage),
	},
	{
		path: '**',
		redirectTo: 'ingresar',
	},
];
