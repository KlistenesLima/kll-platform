import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Chip, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Paper, Skeleton,
  MenuItem, Select, FormControl, InputLabel, InputAdornment, TablePagination,
  Tooltip, IconButton, Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import UndoIcon from '@mui/icons-material/Undo';
import CancelIcon from '@mui/icons-material/Cancel';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import SaveIcon from '@mui/icons-material/Save';
import { logisticsApi } from '../services/api';
import type { Shipment, TrackingEvent } from '../types';

const shipmentStatusMap: Record<string, { label: string; color: 'default' | 'warning' | 'success' | 'info' | 'error'; value: number }> = {
  Created: { label: 'Criado', color: 'default', value: 0 },
  Processing: { label: 'Processando', color: 'warning', value: 1 },
  InTransit: { label: 'Em Trânsito', color: 'info', value: 2 },
  OutForDelivery: { label: 'Saiu para Entrega', color: 'warning', value: 3 },
  Delivered: { label: 'Entregue', color: 'success', value: 4 },
  Returned: { label: 'Devolvido', color: 'error', value: 5 },
};

const statusOptions = [
  { value: 0, label: 'Criado' },
  { value: 1, label: 'Processando' },
  { value: 2, label: 'Em Trânsito' },
  { value: 3, label: 'Saiu para Entrega' },
  { value: 4, label: 'Entregue' },
  { value: 5, label: 'Devolvido' },
];

function getStatusIcon(status: string) {
  switch (status) {
    case 'Created': return <Inventory2Icon fontSize="small" />;
    case 'Processing': return <InventoryIcon fontSize="small" />;
    case 'InTransit': return <LocalShippingIcon fontSize="small" />;
    case 'OutForDelivery': return <DeliveryDiningIcon fontSize="small" />;
    case 'Delivered': return <CheckCircleIcon fontSize="small" />;
    case 'Returned': return <UndoIcon fontSize="small" />;
    default: return <LocalShippingIcon fontSize="small" />;
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'Created': return '#9e9e9e';
    case 'Processing': return '#ff9800';
    case 'InTransit': return '#2196f3';
    case 'OutForDelivery': return '#ff5722';
    case 'Delivered': return '#4caf50';
    case 'Returned': return '#f44336';
    default: return '#9e9e9e';
  }
}

const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '—';
const formatDateTime = (d?: string) => d ? new Date(d).toLocaleString('pt-BR', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
}) : '—';

export default function Shipments() {
  const [allShipments, setAllShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [copiedId, setCopiedId] = useState('');

  // Status update dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(0);
  const [statusDescription, setStatusDescription] = useState('');
  const [statusLocation, setStatusLocation] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchShipments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await logisticsApi.getAllShipments();
      setAllShipments(Array.isArray(data) ? data : []);
    } catch {
      setError('Erro ao carregar entregas. Verifique se o serviço Logistics está online.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchShipments(); }, []);

  const filteredShipments = allShipments.filter(s => {
    const matchesSearch = !search ||
      s.trackingCode.toLowerCase().includes(search.toLowerCase()) ||
      s.orderId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedShipments = filteredShipments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const totalCount = allShipments.length;
  const inTransitCount = allShipments.filter(s => s.status === 'InTransit' || s.status === 'OutForDelivery').length;
  const deliveredCount = allShipments.filter(s => s.status === 'Delivered').length;
  const pendingCount = allShipments.filter(s => s.status === 'Created' || s.status === 'Processing').length;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const handleViewDetails = async (shipment: Shipment) => {
    try {
      const detailed = await logisticsApi.getShipment(shipment.id);
      setSelectedShipment(detailed);
    } catch {
      setSelectedShipment(shipment);
    }
  };

  const handleOpenStatusDialog = () => {
    if (!selectedShipment) return;
    const currentVal = shipmentStatusMap[selectedShipment.status]?.value ?? 0;
    setNewStatus(currentVal);
    setStatusDescription('');
    setStatusLocation('');
    setStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedShipment || !statusDescription.trim()) return;
    setUpdatingStatus(true);
    try {
      await logisticsApi.updateShipmentStatus(selectedShipment.id, {
        status: newStatus,
        description: statusDescription.trim(),
        location: statusLocation.trim() || undefined,
      });
      setStatusDialogOpen(false);
      setSelectedShipment(null);
      await fetchShipments();
    } catch {
      setError('Erro ao atualizar status do envio.');
    }
    setUpdatingStatus(false);
  };

  const summaryCards = [
    { label: 'Total de Envios', value: totalCount, color: '#90caf9' },
    { label: 'Em Trânsito', value: inTransitCount, color: '#42a5f5' },
    { label: 'Entregues', value: deliveredCount, color: '#66bb6a' },
    { label: 'Pendentes', value: pendingCount, color: '#ffa726' },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>Entregas</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {totalCount} envio(s) registrados
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
            placeholder="Buscar por código de rastreio ou pedido..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            sx={{ minWidth: { xs: 0, sm: 280 }, flex: { xs: '1 1 100%', sm: '1 1 280px' } }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
            }}
          />
          <FormControl size="small" sx={{ minWidth: { xs: 0, sm: 180 }, flex: { xs: '1 1 calc(50% - 8px)', sm: '0 0 180px' } }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={e => { setStatusFilter(e.target.value); setPage(0); }}>
              <MenuItem value="all">Todos</MenuItem>
              {Object.entries(shipmentStatusMap).map(([key, val]) => (
                <MenuItem key={key} value={key}>{val.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchShipments} disabled={loading}
            sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: '0 0 auto' } }}>
            Atualizar
          </Button>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Shipments Table */}
      <Card>
        {loading ? (
          <Box sx={{ p: 3 }}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="rounded" height={48} sx={{ mb: 1 }} />
            ))}
          </Box>
        ) : filteredShipments.length === 0 ? (
          <CardContent>
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              {allShipments.length === 0 ? 'Nenhum envio registrado.' : 'Nenhum envio corresponde aos filtros.'}
            </Typography>
          </CardContent>
        ) : (
          <>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Rastreio</TableCell>
                    <TableCell sx={{ fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }}>Pedido</TableCell>
                    <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Destino</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Destinatário</TableCell>
                    <TableCell sx={{ fontWeight: 600, display: { xs: 'none', lg: 'table-cell' } }}>Previsão</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedShipments.map(shipment => {
                    const st = shipmentStatusMap[shipment.status] || { label: shipment.status, color: 'default' as const };
                    return (
                      <TableRow key={shipment.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                              {shipment.trackingCode}
                            </Typography>
                            <Tooltip title={copiedId === shipment.trackingCode ? 'Copiado!' : 'Copiar'}>
                              <IconButton size="small" onClick={() => handleCopy(shipment.trackingCode)}>
                                <ContentCopyIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 13, cursor: 'pointer', color: 'primary.main' }}>
                            {shipment.orderId.slice(0, 8)}...
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{shipment.destinationCity}</TableCell>
                        <TableCell>
                          <Chip label={st.label} size="small" color={st.color} icon={getStatusIcon(shipment.status)} />
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{shipment.recipientName}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{formatDate(shipment.estimatedDelivery)}</TableCell>
                        <TableCell>
                          <Button size="small" variant="text" startIcon={<VisibilityIcon />} onClick={() => handleViewDetails(shipment)}>
                            Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredShipments.length}
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

      {/* Shipment Details Dialog */}
      <Dialog open={!!selectedShipment} onClose={() => setSelectedShipment(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
              {selectedShipment?.trackingCode}
            </Typography>
          </Box>
          {selectedShipment && (
            <Chip
              label={shipmentStatusMap[selectedShipment.status]?.label || selectedShipment.status}
              color={shipmentStatusMap[selectedShipment.status]?.color || 'default'}
              icon={getStatusIcon(selectedShipment.status)}
            />
          )}
        </DialogTitle>
        <DialogContent>
          {selectedShipment && (
            <Box sx={{ pt: 1 }}>
              {/* Info Grid */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Pedido</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{selectedShipment.orderId.slice(0, 8)}...</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Destinatário</Typography>
                  <Typography variant="body2">{selectedShipment.recipientName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Destino</Typography>
                  <Typography variant="body2">{selectedShipment.destinationCity}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Peso</Typography>
                  <Typography variant="body2">{selectedShipment.weight ? `${selectedShipment.weight}kg` : '—'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Data Criação</Typography>
                  <Typography variant="body2">
                    {selectedShipment.trackingEvents.length > 0
                      ? formatDateTime(selectedShipment.trackingEvents[0]?.timestamp)
                      : '—'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Previsão Entrega</Typography>
                  <Typography variant="body2">{formatDate(selectedShipment.estimatedDelivery)}</Typography>
                </Grid>
                {selectedShipment.deliveredAt && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Entregue em</Typography>
                    <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 600 }}>
                      {formatDateTime(selectedShipment.deliveredAt)}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              {/* Tracking Timeline */}
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
                Timeline de Rastreamento
              </Typography>
              <Box sx={{ position: 'relative', pl: 3 }}>
                {[...selectedShipment.trackingEvents].reverse().map((event: TrackingEvent, i: number) => {
                  const isLatest = i === 0;
                  const dotColor = isLatest ? getStatusColor(selectedShipment.status) : '#555';
                  return (
                    <Box key={i} sx={{ position: 'relative', pb: 3, '&:last-child': { pb: 0 } }}>
                      {/* Connecting line */}
                      {i < selectedShipment.trackingEvents.length - 1 && (
                        <Box sx={{
                          position: 'absolute', left: -19, top: 12, bottom: -12,
                          width: 2, bgcolor: 'divider',
                        }} />
                      )}
                      {/* Dot */}
                      <Box sx={{
                        position: 'absolute', left: -24, top: 4,
                        width: 12, height: 12, borderRadius: '50%',
                        bgcolor: dotColor, border: '2px solid', borderColor: 'background.paper',
                        boxShadow: isLatest ? `0 0 8px ${dotColor}` : 'none',
                      }} />
                      <Paper variant="outlined" sx={{ p: 1.5, bgcolor: isLatest ? 'action.hover' : 'transparent' }}>
                        <Typography variant="body2" sx={{ fontWeight: isLatest ? 700 : 500 }}>
                          {event.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {event.location}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDateTime(event.timestamp)}
                          </Typography>
                        </Box>
                      </Paper>
                    </Box>
                  );
                })}
                {selectedShipment.trackingEvents.length === 0 && (
                  <Typography variant="body2" color="text.secondary">Nenhum evento de rastreamento registrado.</Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="contained" onClick={handleOpenStatusDialog} disabled={selectedShipment?.status === 'Delivered'}>
            Atualizar Status
          </Button>
          <Button onClick={() => setSelectedShipment(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Sub-Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Atualizar Status do Envio</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Novo Status</InputLabel>
              <Select value={newStatus} label="Novo Status" onChange={e => setNewStatus(Number(e.target.value))}>
                {statusOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Descrição *"
              placeholder="Ex: Pacote saiu do centro de distribuição"
              value={statusDescription}
              onChange={e => setStatusDescription(e.target.value)}
              fullWidth
            />
            <TextField
              size="small"
              label="Localização"
              placeholder="Ex: São Paulo - SP"
              value={statusLocation}
              onChange={e => setStatusLocation(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleUpdateStatus}
            disabled={updatingStatus || !statusDescription.trim()}
          >
            {updatingStatus ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
