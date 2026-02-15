import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Card, CardContent, Button, Chip, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
  Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { payApi } from '../services/api';
import type { Merchant, Transaction } from '../types';

const statusColor: Record<string, 'default' | 'warning' | 'success' | 'info' | 'error'> = {
  Pending: 'warning', Confirmed: 'success', Failed: 'error', Refunded: 'info', Expired: 'default',
};

const typeColor: Record<string, 'primary' | 'secondary' | 'default'> = {
  Pix: 'primary', Boleto: 'secondary', CreditCard: 'default',
};

export default function Transactions() {
  const [merchantId, setMerchantId] = useState('');
  const [chargeOpen, setChargeOpen] = useState(false);
  const [merchantOpen, setMerchantOpen] = useState(false);
  const [chargeForm, setChargeForm] = useState({ merchantId: '', amount: '', type: 'Pix', description: '', payerDocument: '' });
  const [merchantForm, setMerchantForm] = useState({ name: '', document: '', email: '', webhookUrl: '' });
  const queryClient = useQueryClient();

  const { data: merchants } = useQuery<Merchant[]>({
    queryKey: ['merchants'],
    queryFn: () => payApi.getMerchants(),
  });

  const { data: transactions, isLoading, error } = useQuery<Transaction[]>({
    queryKey: ['transactions', merchantId],
    queryFn: () => payApi.getTransactions(merchantId),
    enabled: !!merchantId,
  });

  const chargeMutation = useMutation({
    mutationFn: (data: any) => payApi.createCharge(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Transações</Typography>
          <Typography variant="body2" color="text.secondary">Gateway de Pagamentos — KLL Pay</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => setMerchantOpen(true)}>Novo Merchant</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setChargeOpen(true)}>Nova Cobrança</Button>
        </Box>
      </Box>

      {/* Merchant Selector */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            select size="small" label="Selecionar Merchant" value={merchantId}
            onChange={e => setMerchantId(e.target.value)} sx={{ minWidth: 300 }}
          >
            <MenuItem value="">— Selecione —</MenuItem>
            {(merchants || []).map(m => (
              <MenuItem key={m.id} value={m.id}>{m.name} ({m.document})</MenuItem>
            ))}
          </TextField>
          {merchants && (
            <Typography variant="body2" color="text.secondary">
              {merchants.length} merchant(s) cadastrado(s)
            </Typography>
          )}
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>Erro ao carregar transações. Verifique se o Pay API está rodando.</Alert>}

      {/* Transactions Table */}
      {merchantId && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Valor</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>PIX QR Code</TableCell>
                  <TableCell>Data</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} align="center">Carregando...</TableCell></TableRow>
                ) : !transactions?.length ? (
                  <TableRow><TableCell colSpan={7} align="center">Nenhuma transação encontrada</TableCell></TableRow>
                ) : transactions.map(tx => (
                  <TableRow key={tx.id} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{tx.id.slice(0, 8)}...</TableCell>
                    <TableCell><Chip label={tx.type} size="small" color={typeColor[tx.type] || 'default'} /></TableCell>
                    <TableCell><Chip label={tx.status} size="small" color={statusColor[tx.status] || 'default'} /></TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>R$ {tx.amount.toFixed(2)}</TableCell>
                    <TableCell>{tx.pixQrCode ? tx.pixQrCode.slice(0, 30) + '...' : '—'}</TableCell>
                    <TableCell>{tx.bankChargeId || '—'}</TableCell>
                    <TableCell>{new Date(tx.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* New Charge Dialog */}
      <Dialog open={chargeOpen} onClose={() => setChargeOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nova Cobrança</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField
            select label="Merchant" value={chargeForm.merchantId}
            onChange={e => setChargeForm({...chargeForm, merchantId: e.target.value})} fullWidth required
          >
            {(merchants || []).map(m => <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>)}
          </TextField>
          <TextField
            label="Valor (R$)" value={chargeForm.amount} type="number"
            onChange={e => setChargeForm({...chargeForm, amount: e.target.value})} fullWidth required
            InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
          />
          <TextField
            select label="Tipo" value={chargeForm.type}
            onChange={e => setChargeForm({...chargeForm, type: e.target.value})} fullWidth
          >
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
