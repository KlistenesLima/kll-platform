import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Chip,
  Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { storeApi } from '../services/api';
import type { Order } from '../types';

const statusColor: Record<string, 'default' | 'warning' | 'success' | 'info' | 'error'> = {
  Pending: 'warning', Paid: 'info', Processing: 'info', Shipped: 'success', Delivered: 'success', Cancelled: 'error',
};

export default function Orders() {
  const [customerId, setCustomerId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchByCustomer = async () => {
    if (!customerId.trim()) return;
    setLoading(true); setError('');
    try {
      const data = await storeApi.getOrdersByCustomer(customerId);
      setOrders(Array.isArray(data) ? data : [data]);
    } catch { setError('Erro ao buscar pedidos'); }
    setLoading(false);
  };

  const searchById = async () => {
    if (!orderId.trim()) return;
    setLoading(true); setError('');
    try {
      const data = await storeApi.getOrder(orderId);
      setOrders(data ? [data] : []);
    } catch { setError('Pedido não encontrado'); }
    setLoading(false);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Pedidos</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Gestão de pedidos — KLL Store</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField size="small" label="ID do Pedido" value={orderId} onChange={e => setOrderId(e.target.value)} sx={{ minWidth: 300 }} />
          <Button variant="outlined" startIcon={<SearchIcon />} onClick={searchById} disabled={loading}>Buscar</Button>
          <Typography variant="body2" color="text.secondary">ou</Typography>
          <TextField size="small" label="ID do Cliente" value={customerId} onChange={e => setCustomerId(e.target.value)} sx={{ minWidth: 200 }} />
          <Button variant="outlined" startIcon={<SearchIcon />} onClick={searchByCustomer} disabled={loading}>Listar</Button>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {orders.length > 0 && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Rastreio</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map(order => (
                  <TableRow key={order.id} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{order.id.slice(0, 8)}...</TableCell>
                    <TableCell>{order.customerId}</TableCell>
                    <TableCell><Chip label={order.status} size="small" color={statusColor[order.status] || 'default'} /></TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>R$ {order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>{order.trackingCode || '—'}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => setSelectedOrder(order)}>Detalhes</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      <Dialog open={!!selectedOrder} onClose={() => setSelectedOrder(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Pedido {selectedOrder?.id.slice(0, 8)}...</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Status: <Chip label={selectedOrder.status} size="small" color={statusColor[selectedOrder.status] || 'default'} />
              </Typography>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Itens:</Typography>
              <Paper variant="outlined" sx={{ p: 1 }}>
                {selectedOrder.items.map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                    <Typography variant="body2">{item.productName} x{item.quantity}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>R$ {(item.unitPrice * item.quantity).toFixed(2)}</Typography>
                  </Box>
                ))}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Total</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>R$ {selectedOrder.totalAmount.toFixed(2)}</Typography>
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
