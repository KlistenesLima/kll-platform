import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Chip,
  Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Paper, Skeleton,
  MenuItem, Select, FormControl, InputLabel, InputAdornment, TablePagination,
  Grid, Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { storeApi, logisticsApi } from '../services/api';
import type { Order, Shipment, TrackingEvent } from '../types';

const statusColor: Record<string, 'default' | 'warning' | 'success' | 'info' | 'error'> = {
  Pending: 'warning', Paid: 'info', Processing: 'info', Shipped: 'success', Delivered: 'success', Cancelled: 'error',
};

const statusLabel: Record<string, string> = {
  Pending: 'Pendente', Paid: 'Pago', Processing: 'Processando', Shipped: 'Enviado', Delivered: 'Entregue', Cancelled: 'Cancelado',
};

const statusValues = ['Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDateTime = (d?: string) => d ? new Date(d).toLocaleString('pt-BR', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
}) : '—';

export default function Orders() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Status update
  const [statusUpdateOrder, setStatusUpdateOrder] = useState<Order | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState('');
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState(false);

  // Cancel
  const [cancelOrder, setCancelOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Shipment info in dialog
  const [orderShipment, setOrderShipment] = useState<Shipment | null>(null);
  const [loadingShipment, setLoadingShipment] = useState(false);

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

  // Summary counts
  const pendingCount = allOrders.filter(o => o.status === 'Pending').length;
  const paidCount = allOrders.filter(o => o.status === 'Paid' || o.status === 'Processing').length;
  const shippedCount = allOrders.filter(o => o.status === 'Shipped').length;
  const deliveredCount = allOrders.filter(o => o.status === 'Delivered').length;

  const handleOpenDetails = async (order: Order) => {
    setSelectedOrder(order);
    setOrderShipment(null);
    if (order.trackingCode) {
      setLoadingShipment(true);
      try {
        const ship = await logisticsApi.getShipmentByOrder(order.id);
        setOrderShipment(ship);
      } catch { /* no shipment */ }
      setLoadingShipment(false);
    }
  };

  const handleOpenStatusUpdate = (order: Order) => {
    setStatusUpdateOrder(order);
    setNewOrderStatus(order.status);
  };

  const handleSaveStatus = async () => {
    if (!statusUpdateOrder) return;
    setUpdatingOrderStatus(true);
    try {
      await storeApi.updateOrderStatus(statusUpdateOrder.id, newOrderStatus);
      setStatusUpdateOrder(null);
      setSelectedOrder(null);
      await fetchOrders();
    } catch {
      setError('Erro ao atualizar status do pedido.');
    }
    setUpdatingOrderStatus(false);
  };

  const handleOpenCancel = (order: Order) => {
    setCancelOrder(order);
    setCancelReason('');
  };

  const handleConfirmCancel = async () => {
    if (!cancelOrder) return;
    setCancelling(true);
    try {
      await storeApi.cancelOrder(cancelOrder.id, cancelReason.trim() || undefined);
      setCancelOrder(null);
      setSelectedOrder(null);
      await fetchOrders();
    } catch {
      setError('Erro ao cancelar pedido.');
    }
    setCancelling(false);
  };

  const summaryCards = [
    { label: 'Total Pedidos', value: allOrders.length, color: '#90caf9' },
    { label: 'Pendentes', value: pendingCount, color: '#ffa726' },
    { label: 'Pagos / Processando', value: paidCount, color: '#42a5f5' },
    { label: 'Enviados', value: shippedCount, color: '#66bb6a' },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Pedidos</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Gestão de pedidos — {allOrders.length} pedido(s) — Receita total: {formatCurrency(totalRevenue)}
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryCards.map(c => (
          <Grid item xs={6} md={3} key={c.label}>
            <Card sx={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)' }}>
              <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                  {c.label}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: c.color, mt: 0.5 }}>
                  {c.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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
                      <TableCell>
                        {order.trackingCode ? (
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12, color: 'primary.main' }}>
                            {order.trackingCode}
                          </Typography>
                        ) : '—'}
                      </TableCell>
                      <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Button size="small" variant="text" onClick={() => handleOpenDetails(order)}>Detalhes</Button>
                          <Button size="small" variant="text" color="warning" onClick={() => handleOpenStatusUpdate(order)}>Status</Button>
                          {(order.status === 'Pending' || order.status === 'Paid') && (
                            <Button size="small" variant="text" color="error" onClick={() => handleOpenCancel(order)}>
                              Cancelar
                            </Button>
                          )}
                        </Box>
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
      <Dialog open={!!selectedOrder} onClose={() => setSelectedOrder(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Pedido #{selectedOrder?.id.slice(0, 8).toUpperCase()}
            </Typography>
          </Box>
          {selectedOrder && (
            <Chip
              label={statusLabel[selectedOrder.status] || selectedOrder.status}
              color={statusColor[selectedOrder.status] || 'default'}
            />
          )}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 1 }}>
              {/* Order Info */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Cliente</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{selectedOrder.customerId}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Data</Typography>
                  <Typography variant="body2">{formatDateTime(selectedOrder.createdAt)}</Typography>
                </Grid>
              </Grid>

              {/* Items */}
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Itens</Typography>
              <Paper variant="outlined" sx={{ p: 1.5, mb: 3 }}>
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

              {/* Shipment Section */}
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalShippingIcon fontSize="small" /> Envio
              </Typography>

              {!selectedOrder.trackingCode && !loadingShipment && (
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Envio não criado para este pedido.</Typography>
                </Paper>
              )}

              {loadingShipment && (
                <Skeleton variant="rounded" height={80} />
              )}

              {orderShipment && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {orderShipment.trackingCode}
                    </Typography>
                    <Chip
                      label={
                        orderShipment.status === 'Created' ? 'Criado' :
                        orderShipment.status === 'InTransit' ? 'Em Trânsito' :
                        orderShipment.status === 'OutForDelivery' ? 'Saiu para Entrega' :
                        orderShipment.status === 'Delivered' ? 'Entregue' :
                        orderShipment.status === 'Returned' ? 'Devolvido' :
                        orderShipment.status
                      }
                      size="small"
                      color={
                        orderShipment.status === 'Delivered' ? 'success' :
                        orderShipment.status === 'InTransit' ? 'info' :
                        orderShipment.status === 'Returned' ? 'error' : 'default'
                      }
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Destino: {orderShipment.destinationCity} · Previsão: {orderShipment.estimatedDelivery ? new Date(orderShipment.estimatedDelivery).toLocaleDateString('pt-BR') : '—'}
                  </Typography>

                  {/* Mini timeline - last 3 events */}
                  {orderShipment.trackingEvents.length > 0 && (
                    <Box sx={{ mt: 1.5, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
                      {[...orderShipment.trackingEvents].reverse().slice(0, 3).map((ev: TrackingEvent, i: number) => (
                        <Box key={i} sx={{ mb: 1, position: 'relative' }}>
                          <Box sx={{
                            position: 'absolute', left: -13, top: 4,
                            width: 8, height: 8, borderRadius: '50%',
                            bgcolor: i === 0 ? 'primary.main' : 'text.disabled',
                          }} />
                          <Typography variant="caption" sx={{ fontWeight: i === 0 ? 700 : 400 }}>
                            {ev.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {ev.location} · {formatDateTime(ev.timestamp)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Paper>
              )}

              {selectedOrder.trackingCode && !loadingShipment && !orderShipment && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    Rastreio: {selectedOrder.trackingCode}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Dados detalhados do envio não encontrados.
                  </Typography>
                </Paper>
              )}

              {/* Quick Actions */}
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                  size="small" variant="outlined" color="warning"
                  onClick={() => handleOpenStatusUpdate(selectedOrder)}
                >
                  Atualizar Status
                </Button>
                {(selectedOrder.status === 'Pending' || selectedOrder.status === 'Paid') && (
                  <Button
                    size="small" variant="outlined" color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => handleOpenCancel(selectedOrder)}
                  >
                    Cancelar Pedido
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedOrder(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={!!statusUpdateOrder} onClose={() => setStatusUpdateOrder(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Atualizar Status do Pedido</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Pedido: #{statusUpdateOrder?.id.slice(0, 8).toUpperCase()}
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Novo Status</InputLabel>
              <Select value={newOrderStatus} label="Novo Status" onChange={e => setNewOrderStatus(e.target.value)}>
                {statusValues.map(s => (
                  <MenuItem key={s} value={s}>{statusLabel[s]}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusUpdateOrder(null)}>Cancelar</Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveStatus}
            disabled={updatingOrderStatus}
          >
            {updatingOrderStatus ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={!!cancelOrder} onClose={() => setCancelOrder(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: 'error.main' }}>Cancelar Pedido</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Esta ação não pode ser desfeita. O pedido #{cancelOrder?.id.slice(0, 8).toUpperCase()} será cancelado.
            </Alert>
            <TextField
              size="small"
              label="Motivo do cancelamento"
              placeholder="Informe o motivo..."
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelOrder(null)}>Voltar</Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<CancelIcon />}
            onClick={handleConfirmCancel}
            disabled={cancelling}
          >
            {cancelling ? 'Cancelando...' : 'Confirmar Cancelamento'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
