import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, IconButton, Tabs, Tab, Badge, Dialog,
  DialogTitle, DialogContent, DialogActions, Button, Select,
  MenuItem, FormControl, InputLabel, CircularProgress, Alert,
  Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import BlockIcon from '@mui/icons-material/Block';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import type { AppUser } from '../types';
import { usersApi } from '../services/api';
import { useAuth } from '../components/AuthProvider';

const statusColors: Record<string, 'default' | 'warning' | 'success' | 'error' | 'info'> = {
  PendingEmailConfirmation: 'default',
  PendingApproval: 'warning',
  Active: 'success',
  Inactive: 'info',
  Rejected: 'error',
};
const statusLabels: Record<string, string> = {
  PendingEmailConfirmation: 'Email pendente',
  PendingApproval: 'Aguardando aprovação',
  Active: 'Ativo',
  Inactive: 'Inativo',
  Rejected: 'Rejeitado',
};
const roleLabels: Record<string, string> = {
  Cliente: 'Cliente',
  Tecnico: 'Técnico',
  Administrador: 'Administrador',
};

function formatDoc(doc: string) {
  if (doc.length === 11) return `${doc.slice(0, 3)}.${doc.slice(3, 6)}.${doc.slice(6, 9)}-${doc.slice(9)}`;
  return doc;
}

export default function Users() {
  const { roles } = useAuth();
  const navigate = useNavigate();
  const isAdmin = roles.includes('admin') || roles.includes('Administrador');

  const [users, setUsers] = useState<AppUser[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionDialog, setActionDialog] = useState<{ type: string; user: AppUser } | null>(null);
  const [selectedRole, setSelectedRole] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) navigate('/dashboard', { replace: true });
  }, [isAdmin, navigate]);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const all = await usersApi.getAll();
      setUsers(all);
      setPendingCount(all.filter((u: AppUser) => u.status === 'PendingApproval').length);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar usuários');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, []);

  const filteredUsers = (() => {
    switch (tab) {
      case 1: return users.filter(u => u.status === 'PendingApproval');
      case 2: return users.filter(u => u.status === 'Active');
      case 3: return users.filter(u => u.status === 'Inactive' || u.status === 'Rejected');
      default: return users;
    }
  })();

  const handleAction = async () => {
    if (!actionDialog) return;
    setActionLoading(true);
    try {
      const { type, user } = actionDialog;
      switch (type) {
        case 'approve': await usersApi.approve(user.id); break;
        case 'reject': await usersApi.reject(user.id); break;
        case 'activate': await usersApi.changeStatus(user.id, true); break;
        case 'deactivate': await usersApi.changeStatus(user.id, false); break;
        case 'role': await usersApi.changeRole(user.id, selectedRole); break;
      }
      setActionDialog(null);
      await loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao executar ação');
    } finally { setActionLoading(false); }
  };

  const actionLabels: Record<string, string> = {
    approve: 'Aprovar Usuário',
    reject: 'Rejeitar Usuário',
    activate: 'Ativar Usuário',
    deactivate: 'Desativar Usuário',
    role: 'Alterar Role',
  };

  if (!isAdmin) return null;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>Usuários</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{
            borderBottom: '1px solid rgba(255,255,255,0.06)', px: 2,
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 500 },
            '& .Mui-selected': { color: '#c9a962 !important' },
            '& .MuiTabs-indicator': { backgroundColor: '#c9a962' },
          }}>
          <Tab label="Todos" />
          <Tab label={
            <Badge badgeContent={pendingCount} color="warning" sx={{ '& .MuiBadge-badge': { fontSize: 10 } }}>
              Pendentes
            </Badge>
          } />
          <Tab label="Ativos" />
          <Tab label="Inativos" />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: '#c9a962' }} />
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>CPF</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Criado em</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              )}
              {filteredUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell sx={{ fontSize: 13, display: { xs: 'none', sm: 'table-cell' } }}>{user.email}</TableCell>
                  <TableCell sx={{ fontSize: 13, display: { xs: 'none', md: 'table-cell' } }}>{formatDoc(user.document)}</TableCell>
                  <TableCell>
                    <Chip label={roleLabels[user.role] || user.role} size="small"
                      sx={{ fontSize: 11, fontWeight: 600,
                        bgcolor: user.role === 'Administrador' ? 'rgba(201,169,98,0.15)' :
                                 user.role === 'Tecnico' ? 'rgba(33,150,243,0.15)' : 'rgba(255,255,255,0.06)',
                        color: user.role === 'Administrador' ? '#c9a962' :
                               user.role === 'Tecnico' ? '#2196f3' : 'text.secondary',
                      }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={statusLabels[user.status] || user.status} size="small"
                      color={statusColors[user.status] || 'default'}
                      sx={{ fontSize: 11, fontWeight: 600 }} />
                  </TableCell>
                  <TableCell sx={{ fontSize: 12, color: 'text.secondary', display: { xs: 'none', md: 'table-cell' } }}>
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {user.status === 'PendingApproval' && (
                      <>
                        <Tooltip title="Aprovar">
                          <IconButton size="small" color="success"
                            onClick={() => setActionDialog({ type: 'approve', user })}>
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Rejeitar">
                          <IconButton size="small" color="error"
                            onClick={() => setActionDialog({ type: 'reject', user })}>
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    {user.status === 'Active' && (
                      <Tooltip title="Desativar">
                        <IconButton size="small" color="warning"
                          onClick={() => setActionDialog({ type: 'deactivate', user })}>
                          <BlockIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {(user.status === 'Inactive' || user.status === 'Rejected') && (
                      <Tooltip title="Ativar">
                        <IconButton size="small" color="success"
                          onClick={() => setActionDialog({ type: 'activate', user })}>
                          <PlayArrowIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Alterar Role">
                      <IconButton size="small" sx={{ color: '#c9a962' }}
                        onClick={() => {
                          setSelectedRole(user.role === 'Cliente' ? 0 : user.role === 'Tecnico' ? 1 : 2);
                          setActionDialog({ type: 'role', user });
                        }}>
                        <PersonIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </Box>
        )}
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={!!actionDialog} onClose={() => setActionDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {actionDialog ? actionLabels[actionDialog.type] : ''}
        </DialogTitle>
        <DialogContent>
          {actionDialog && actionDialog.type !== 'role' && (
            <Typography>
              Confirma a ação para <strong>{actionDialog.user.fullName}</strong> ({actionDialog.user.email})?
            </Typography>
          )}
          {actionDialog?.type === 'role' && (
            <Box sx={{ mt: 1 }}>
              <Typography sx={{ mb: 2 }}>
                Alterar role de <strong>{actionDialog.user.fullName}</strong>:
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel>Novo Role</InputLabel>
                <Select value={selectedRole} label="Novo Role"
                  onChange={(e) => setSelectedRole(Number(e.target.value))}>
                  <MenuItem value={0}>Cliente</MenuItem>
                  <MenuItem value={1}>Técnico</MenuItem>
                  <MenuItem value={2}>Administrador</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(null)} disabled={actionLoading}>Cancelar</Button>
          <Button onClick={handleAction} variant="contained" disabled={actionLoading}
            sx={{
              background: 'linear-gradient(135deg, #c9a962 0%, #a68b4b 100%)',
              color: '#0f172a', fontWeight: 600,
              '&:hover': { background: 'linear-gradient(135deg, #d4b872 0%, #b89a5a 100%)' },
            }}>
            {actionLoading ? <CircularProgress size={20} sx={{ color: '#0f172a' }} /> : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
