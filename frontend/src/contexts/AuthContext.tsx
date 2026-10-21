import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { UNAUTHORIZED_EVENT } from '@/services/api';

export type UserRole = 'FORMATEUR' | 'ETUDIANT';

interface User {
  id?: number;
  username: string;
  email?: string;
  nom?: string;
  prenom?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  /**
   * Vrai tant que la session n'est pas lue. La session est lue de façon synchrone dès le premier
   * rendu : toujours faux ensuite (un F5 sur une route protégée ne redirige donc plus vers le tableau de bord).
   */
  isLoading: boolean;
  isFormateur: boolean;
  isEtudiant: boolean;
  login: (token: string, username: string, role: string) => void;
  logout: () => void;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface Session {
  token: string | null;
  user: User | null;
}

/** Date d'expiration (ms) lue dans le jeton JWT, ou null si illisible. */
function tokenExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const exp = (JSON.parse(json) as { exp?: number }).exp;
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
}

function clearStoredSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // stockage indisponible
  }
}

/** Lecture synchrone de la session mémorisée ; un jeton expiré ou corrompu est écarté. */
function readSession(): Session {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const rawUser = localStorage.getItem(USER_KEY);
    if (!token || !rawUser) return { token: null, user: null };

    const expiry = tokenExpiry(token);
    if (expiry !== null && expiry <= Date.now()) {
      clearStoredSession();
      return { token: null, user: null };
    }
    return { token, user: JSON.parse(rawUser) as User };
  } catch {
    clearStoredSession();
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(readSession);

  const login = useCallback((newToken: string, username: string, role: string) => {
    const user: User = { username, role: role.replace('ROLE_', '') as UserRole };
    try {
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // stockage indisponible : la session ne survivra pas à un rechargement
    }
    setSession({ token: newToken, user });
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
    setSession({ token: null, user: null });
  }, []);

  // Le serveur a refusé le jeton (expiré ou révoqué) : retour à la connexion avec explication.
  useEffect(() => {
    const onUnauthorized = () => {
      if (!session.token) return;
      logout();
      toast.error('Votre session a expiré. Veuillez vous reconnecter.');
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [logout, session.token]);

  const value = useMemo<AuthContextType>(
    () => ({
      user: session.user,
      token: session.token,
      isAuthenticated: !!session.token && !!session.user,
      isLoading: false,
      isFormateur: session.user?.role === 'FORMATEUR',
      isEtudiant: session.user?.role === 'ETUDIANT',
      login,
      logout,
    }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
