import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Card, CardContent, Button, Chip, TextField, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
  Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, InputAdornment, IconButton, Tooltip, TablePagination,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { payApi } from '../services/api';
import type { Merchant, Transaction } from '../types';

const statusColor: Record<string, 'default' | 'warning' | 'success' | 'info' | 'error'> = {
  Pending: 'warning', Confirmed: 'success', Failed: 'error', Refunded: 'info', Expired: 'default',
};

const statusLabel: Record<string, string> = {
  Pending: 'Pendente', Confirmed: 'Confirmado', Failed: 'Falhou', Refunded: 'Reembolsado', Expired: 'Expirado',
};

const typeLabel: Record<string, string> = {
  Pix: 'PIX', Boleto: 'Boleto', CreditCard: 'Cartão de Crédito',
};

const typeColor: Record<string, 'primary' | 'secondary' | 'default'> = {
  Pix: 'primary', Boleto: 'secondary', CreditCard: 'default',
};

export default function Transactions() {
  const [chargeOpen, setChargeOpen] = useState(false);
  const [merchantOpen, setMerchantOpen] = useState(false);
  const [chargeForm, setChargeForm] = useState({ merchantId: '', amount: '', type: 'Pix', description: '', payerDocument: '' });
  const [merchantForm, setMerchantForm] = useState({ name: '', document: '', email: '', webhookUrl: '' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const queryClient = useQueryClient();

  const { data: merchants } = useQuery<Merchant[]>({
    queryKey: ['merchants'],
    queryFn: () => payApi.getMerchants(),
  });

  const { data: transactions, isLoading, error, refetch } = useQuery<Transaction[]>({
    queryKey: ['all-transactions'],
    queryFn: () => payApi.getAllTransactions(),
  });

  const chargeMutation = useMutation({
    mutationFn: (data: any) => payApi.createCharge(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-transactions'] });
      setChargeOpen(false);
      setChargeForm({ merchantId: '', amount: '', type: 'Pix', description: '', payerDocument: '' });
    },
  });

  const merchantMutation = useMutation({
    mutationFn: (data: any) => payApi.createMerchant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchants'] });
      setMerchantOpen(false);
      setMerchantForm({ name: '', document: '', email: '', webhookUrl: '' });
    },
  });

  const filtered = (transactions || [])
    .filter(tx => !filterType || tx.type === filterType)
    .filter(tx => !filterStatus || tx.status === filterStatus)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalAmount = filtered.filter(t => t.status === 'Confirmed').reduce((s, t) => s + t.amount, 0);
  const pendingCount = filtered.filter(t => t.status === 'Pending').length;
  const confirmedCount = filtered.filter(t => t.status === 'Confirmed').length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Transações</Typography>
          <Typography variant="body2" color="text.secondary">Todos os pagamentos processados</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Atualizar"><IconButton onClick={() => refetch()}><RefreshIcon /></IconButton></Tooltip>
          <Button variant="outlined" onClick={() => setMerchantOpen(true)}>Novo Merchant</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setChargeOpen(true)}>Nova Cobrança</Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary">Total Transações</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{filtered.length}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary">Receita Confirmada</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50' }}>
              R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary">Pendentes / Confirmados</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              <Chip label={pendingCount} size="small" color="warning" sx={{ mr: 1 }} />
              <Chip label={confirmedCount} size="small" color="success" />
            </Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField select size="small" label="Tipo" value={filterType}
            onChange={e => { setFilterType(e.target.value); setPage(0); }} sx={{ minWidth: 160 }}>
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="Pix">PIX</MenuItem>
            <MenuItem value="Boleto">Boleto</MenuItem>
            <MenuItem value="CreditCard">Cartão</MenuItem>
          </TextField>
          <TextField select size="small" label="Status" value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(0); }} sx={{ minWidth: 160 }}>
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="Pending">Pendente</MenuItem>
            <MenuItem value="Confirmed">Confirmado</MenuItem>
            <MenuItem value="Failed">Falhou</MenuItem>
            <MenuItem value="Expired">Expirado</MenuItem>
          </TextField>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>Erro ao carregar transações. Verifique se o Pay API está rodando.</Alert>}

      {/* Transactions Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Valor</TableCell>
                <TableCell>Charge ID</TableCell>
                <TableCell>Data</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} align="center">Carregando...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={6} align="center">Nenhuma transação encontrada</TableCell></TableRow>
              ) : filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(tx => (
                <TableRow key={tx.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{tx.id.slice(0, 8)}...</TableCell>
                  <TableCell><Chip label={typeLabel[tx.type] || tx.type} size="small" color={typeColor[tx.type] || 'default'} /></TableCell>
                  <TableCell><Chip label={statusLabel[tx.status] || tx.status} size="small" color={statusColor[tx.status] || 'default'} /></TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                    {tx.bankChargeId ? tx.bankChargeId.slice(0, 8) + '...' : '—'}
                  </TableCell>
                  <TableCell>{new Date(tx.createdAt).toLocaleString('pt-BR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div" count={filtered.length} page={page} onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage} onRowsPerPageChange={e => { setRowsPerPage(+e.target.value); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50]} labelRowsPerPage="Por página"
        />
      </Card>

      {/* New Charge Dialog */}
      <Dialog open={chargeOpen} onClose={() => setChargeOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nova Cobrança</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField select label="Merchant" value={chargeForm.merchantId}
            onChange={e => setChargeForm({...chargeForm, merchantId: e.target.value})} fullWidth required>
            {(merchants || []).map(m => <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>)}
          </TextField>
          <TextField label="Valor (R$)" value={chargeForm.amount} type="number"
            onChange={e => setChargeForm({...chargeForm, amount: e.target.value})} fullWidth required
            InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }} />
          <TextField select label="Tipo" value={chargeForm.type}
            onChange={e => setChargeForm({...chargeForm, type: e.target.value})} fullWidth>
            <MenuItem value="Pix">PIX</MenuItem>
            <MenuItem value="Boleto">Boleto</MenuItem>
            <MenuItem value="CreditCard">Cartão de Crédito</MenuItem>
          </TextField>
          <TextField label="Descrição" value={chargeForm.description}
            onChange={e => setChargeForm({...chargeForm, description: e.target.value})} fullWidth />
          <TextField label="CPF/CNPJ do Pagador" value={chargeForm.payerDocument}
            onChange={e => setChargeForm({...chargeForm, payerDocument: e.target.value})} fullWidth />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setChargeOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => chargeMutation.mutate({
            ...chargeForm, amount: parseFloat(chargeForm.amount),
          })} disabled={chargeMutation.isPending}>
            {chargeMutation.isPending ? 'Processando...' : 'Criar Cobrança'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Merchant Dialog */}
      <Dialog open={merchantOpen} onClose={() => setMerchantOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Novo Merchant</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Nome" value={merchantForm.name}
            onChange={e => setMerchantForm({...merchantForm, name: e.target.value})} fullWidth required />
          <TextField label="CNPJ" value={merchantForm.document}
            onChange={e => setMerchantForm({...merchantForm, document: e.target.value})} fullWidth required />
          <TextField label="Email" value={merchantForm.email} type="email"
            onChange={e => setMerchantForm({...merchantForm, email: e.target.value})} fullWidth required />
          <TextField label="Webhook URL (opcional)" value={merchantForm.webhookUrl}
            onChange={e => setMerchantForm({...merchantForm, webhookUrl: e.target.value})} fullWidth />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setMerchantOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => merchantMutation.mutate(merchantForm)}
            disabled={merchantMutation.isPending}>
            {merchantMutation.isPending ? 'Criando...' : 'Criar Merchant'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
