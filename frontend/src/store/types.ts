export type UserRole = 'admin' | 'employee';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  mfaEnabled?: boolean;
  createdAt?: string;
}

export type User = AuthUser;

export interface LoginCredentials {
  email: string;
  password: string;
}

export type LoginDto = LoginCredentials;

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<{ user?: AuthUser; mfaRequired?: boolean; mfaToken?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<AuthUser | null>;
  refrescarPerfil: () => Promise<AuthUser | null>;
  esAdmin: () => boolean;
  esEmpleado: () => boolean;
}

export type AuthStore = AuthState & AuthActions;
