import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  Box, Paper, TextField, Button, Typography, CircularProgress,
  InputAdornment, IconButton, Alert, Snackbar,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';

const GATEWAY = import.meta.env.VITE_API_URL || '';

function parseJwt(token: string): any {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch { return null; }
}

function extractRoles(decoded: any): string[] {
  const roles: string[] = [];
  // Keycloak tokens
  if (decoded?.realm_roles) roles.push(...decoded.realm_roles);
  // Custom JWT: role claim (plain) or ClaimTypes.Role
  const customRole = decoded?.role ||
    decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || '';
  if (customRole) {
    roles.push(customRole);
    // Map Administrador/Tecnico to 'admin' for backwards compat
    if (customRole === 'Administrador' || customRole === 'Tecnico') {
      if (!roles.includes('admin')) roles.push('admin');
    }
  }
  return roles;
}

function extractUsername(decoded: any): string {
  return decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
    decoded?.name || decoded?.preferred_username || decoded?.email || '';
}

function isAdminRole(roles: string[]): boolean {
  return roles.includes('admin') || roles.includes('Administrador') || roles.includes('Tecnico');
}

function formatIdentifier(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length > 0 && !/[a-zA-Z@]/.test(value)) {
    const d = digits.slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  }
  return value;
}

function isCpfMode(value: string): boolean {
  return value.replace(/\D/g, '').length > 0 && !/[a-zA-Z@]/.test(value);
}

interface AuthContextType {
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
  const [token, setToken] = useState<string | null>(localStorage.getItem('kll_admin_token'));
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        const roles = extractRoles(decoded);
        if (!isAdminRole(roles)) {
          localStorage.removeItem('kll_admin_token');
          setToken(null);
          setError('Acesso restrito a administradores e técnicos');
        }
      } else {
        localStorage.removeItem('kll_admin_token');
        setToken(null);
      }
    }
    setChecking(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${GATEWAY}/api/v1/auth/login`, {
        emailOrDocument: identifier, password,
      });
      // Accept both Keycloak (access_token) and custom JWT (token)
      const accessToken = data.access_token || data.token;
      const decoded = parseJwt(accessToken);
      const roles = extractRoles(decoded);
      if (!isAdminRole(roles)) {
        setError('Acesso restrito a administradores e técnicos');
        setLoading(false);
        return;
      }
      localStorage.setItem('kll_admin_token', accessToken);
      setToken(accessToken);
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Credenciais inválidas');
    } finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem('kll_admin_token');
    setToken(null);
    setIdentifier('');
    setPassword('');
  };

  if (checking) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#c9a962' }} />
      </Box>
    );
  }

  if (!token) {
    const cpfMode = isCpfMode(identifier);
    return (
      <Box sx={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: '#0f172a', p: 2,
      }}>
        <Paper
          elevation={0}
          sx={{
            p: 5, maxWidth: 420, width: '100%', borderRadius: 4,
            bgcolor: 'rgba(30,41,59,0.8)', border: '1px solid rgba(201,169,98,0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{
              width: 56, height: 56, borderRadius: 3, mx: 'auto', mb: 2,
              bgcolor: 'rgba(201,169,98,0.08)', border: '1px solid rgba(201,169,98,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3h12l4 6-10 13L2 9z" /><path d="M11 3l1 6h9" /><path d="M2 9h20" /><path d="M13 3l-1 6H3" />
              </svg>
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: 28, letterSpacing: 1 }}>
              <Box component="span" sx={{ color: '#fff' }}>AUREA </Box>
              <Box component="span" sx={{ color: '#c9a962' }}>Maison</Box>
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, mt: 0.5 }}>
              Painel Administrativo
            </Typography>
          </Box>

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="E-mail ou CPF"
              value={identifier}
              onChange={(e) => setIdentifier(formatIdentifier(e.target.value))}
              placeholder="seuemail@exemplo.com ou CPF"
              inputMode={cpfMode ? 'numeric' : 'email'}
              autoComplete="email"
              required
              helperText={identifier ? (cpfMode ? 'CPF detectado' : 'E-mail') : ' '}
              FormHelperTextProps={{ sx: { color: 'rgba(201,169,98,0.5)', fontSize: 11 } }}
              sx={{
                mb: 1.5,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(201,169,98,0.15)' },
                  '&:hover fieldset': { borderColor: 'rgba(201,169,98,0.3)' },
                  '&.Mui-focused fieldset': { borderColor: '#c9a962' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#c9a962' },
              }}
            />

            <TextField
              fullWidth
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ color: showPassword ? '#c9a962' : 'text.secondary' }}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(201,169,98,0.15)' },
                  '&:hover fieldset': { borderColor: 'rgba(201,169,98,0.3)' },
                  '&.Mui-focused fieldset': { borderColor: '#c9a962' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#c9a962' },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5, fontWeight: 700, fontSize: 13, letterSpacing: 2,
                textTransform: 'uppercase', borderRadius: 2.5,
                background: 'linear-gradient(135deg, #c9a962 0%, #a68b4b 100%)',
                color: '#0f172a',
                '&:hover': { background: 'linear-gradient(135deg, #d4b872 0%, #b89a5a 100%)' },
                '&.Mui-disabled': { opacity: 0.6 },
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: '#0f172a' }} /> : 'Entrar'}
            </Button>
          </form>
        </Paper>

        <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert onClose={() => setError('')} severity="error" variant="filled" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  const decoded = parseJwt(token);
  const value: AuthContextType = {
    authenticated: true,
    token,
    username: extractUsername(decoded),
    roles: extractRoles(decoded),
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
