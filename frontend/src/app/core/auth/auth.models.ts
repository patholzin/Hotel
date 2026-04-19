export interface UsuarioAutenticado {
  id: number;
  name: string;
  email: string;
  activo: boolean;
  roles: string[];
  permissions: string[];
  must_change_password: boolean;
  password_changed_at: string | null;
}

export interface RespuestaAutenticacion {
  message: string;
  token?: string;
  token_type?: string;
  user: UsuarioAutenticado;
}

export interface RespuestaMe {
  message: string;
  user: UsuarioAutenticado;
}
