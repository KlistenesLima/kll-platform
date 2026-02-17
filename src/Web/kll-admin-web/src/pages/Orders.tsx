import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Chip,
  Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Paper, Skeleton,
  MenuItem, Select, FormControl, InputLabel, InputAdornment, TablePagination,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { storeApi } from '../services/api';
import type { Order } from '../types';

const statusColor: Record<string, 'default' | 'warning' | 'success' | 'info' | 'error'> = {
  Pending: 'warning', Paid: 'info', Processing: 'info', Shipped: 'success', Delivered: 'success', Cancelled: 'error',
};

const statusLabel: Record<string, string> = {
  Pending: 'Pendente', Paid: 'Pago', Processing: 'Processando', Shipped: 'Enviado', Delivered: 'Entregue', Cancelled: 'Cancelado',
};

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Orders() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await storeApi.getAllOrders();
      setAllOrders(Array.isArray(data) ? data : []);
    } catch {
      setError('Erro ao carregar pedidos. Verifique se o serviço Store está online.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const filteredOrders = allOrders.filter(order => {
    const matchesSearch = !search ||
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customerId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedOrders = filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const totalRevenue = allOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const uniqueStatuses = [...new Set(allOrders.map(o => o.status))];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Pedidos</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Gestão de pedidos — {allOrders.length} pedido(s) — Receita total: {formatCurrency(totalRevenue)}
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Buscar por ID do pedido ou cliente..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            sx={{ minWidth: 320 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
            }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
            >
              <MenuItem value="all">Todos</MenuItem>
              {uniqueStatuses.map(s => (
                <MenuItem key={s} value={s}>{statusLabel[s] || s}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchOrders} disabled={loading}>
            Atualizar
          </Button>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Orders Table */}
      <Card>
        {loading ? (
          <Box sx={{ p: 3 }}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="rounded" height={48} sx={{ mb: 1 }} />
            ))}
          </Box>
        ) : filteredOrders.length === 0 ? (
          <CardContent>
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              {allOrders.length === 0 ? 'Nenhum pedido encontrado.' : 'Nenhum pedido corresponde aos filtros.'}
            </Typography>
          </CardContent>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Cliente</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Total</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Rastreio</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Data</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedOrders.map(order => (
                    <TableRow key={order.id} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{order.id.slice(0, 8)}...</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{order.customerId.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <Chip
                          label={statusLabel[order.status] || order.status}
                          size="small"
                          color={statusColor[order.status] || 'default'}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(order.totalAmount)}</TableCell>
                      <TableCell>{order.trackingCode || '—'}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}</TableCell>
                      <TableCell>
                        <Button size="small" variant="text" onClick={() => setSelectedOrder(order)}>Detalhes</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredOrders.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage="Por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </>
        )}
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onClose={() => setSelectedOrder(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Pedido {selectedOrder?.id.slice(0, 8)}...</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 1 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Typography variant="body2">
                  Status: <Chip label={statusLabel[selectedOrder.status] || selectedOrder.status} size="small" color={statusColor[selectedOrder.status] || 'default'} />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cliente: <code>{selectedOrder.customerId}</code>
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Data: {new Date(selectedOrder.createdAt).toLocaleString('pt-BR')}
              </Typography>
              {selectedOrder.trackingCode && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Rastreio: <code>{selectedOrder.trackingCode}</code>
                </Typography>
              )}
              <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>Itens:</Typography>
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                {selectedOrder.items.map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                    <Typography variant="body2">{item.productName} x{item.quantity}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(item.unitPrice * item.quantity)}</Typography>
                  </Box>
                ))}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1.5, mt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Total</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(selectedOrder.totalAmount)}</Typography>
                </Box>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setSelectedOrder(null)}>Fechar</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
