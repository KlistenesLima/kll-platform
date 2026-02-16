import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type KeycloakType from 'keycloak-js';
import keycloak from '../services/keycloak';
import { Box, CircularProgress, Typography } from '@mui/material';

interface AuthContextType {
  keycloak: KeycloakType;
  authenticated: boolean;
  token: string | undefined;
  username: string;
  roles: string[];
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    keycloak.init({ onLoad: 'login-required', pkceMethod: 'S256' })
      .then((auth) => {
        setAuthenticated(auth);
        setReady(true);
        setInterval(() => {
          keycloak.updateToken(30).catch(() => keycloak.logout());
        }, 30_000);
      })
      .catch((err) => {
        console.error('Keycloak init failed', err);
        setReady(true);
      });
  }, []);

  if (!ready) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 2 }}>
        <CircularProgress sx={{ color: '#6366f1' }} />
        <Typography variant="body2" color="text.secondary">Autenticando...</Typography>
      </Box>
    );
  }

  if (!authenticated) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Typography color="error">Falha na autenticacao. Recarregue a pagina.</Typography>
      </Box>
    );
  }

  const tokenParsed = keycloak.tokenParsed as Record<string, any> | undefined;
  const value: AuthContextType = {
    keycloak,
    authenticated,
    token: keycloak.token,
    username: tokenParsed?.preferred_username || '',
    roles: tokenParsed?.realm_roles || [],
    logout: () => keycloak.logout({ redirectUri: window.location.origin }),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
