import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Chip, Alert,
  Stepper, Step, StepLabel, StepContent, Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { logisticsApi } from '../services/api';
import type { Shipment } from '../types';

const statusColor: Record<string, 'default' | 'warning' | 'success' | 'info' | 'error'> = {
  Created: 'default', Processing: 'warning', InTransit: 'info', OutForDelivery: 'info', Delivered: 'success', Returned: 'error',
};

export default function Shipments() {
  const [trackingCode, setTrackingCode] = useState('');
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async () => {
    if (!trackingCode.trim()) return;
    setLoading(true); setError(''); setShipment(null);
    try {
      const data = await logisticsApi.trackShipment(trackingCode);
      setShipment(data);
    } catch { setError('Código de rastreio não encontrado'); }
    setLoading(false);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Rastreio de Entregas</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>KLL Logistics — Acompanhamento em tempo real</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <LocalShippingIcon color="primary" />
          <TextField
            size="small" label="Código de Rastreio" placeholder="KLL20250213..."
            value={trackingCode} onChange={e => setTrackingCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleTrack()}
            sx={{ minWidth: 300 }}
          />
          <Button variant="contained" startIcon={<SearchIcon />} onClick={handleTrack} disabled={loading}>
            {loading ? 'Buscando...' : 'Rastrear'}
          </Button>
        </CardContent>
      </Card>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      {shipment && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{shipment.trackingCode}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Para: {shipment.recipientName} · {shipment.destinationCity}
                </Typography>
              </Box>
              <Chip label={shipment.status} color={statusColor[shipment.status] || 'default'} />
            </Box>

            <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
              <Paper variant="outlined" sx={{ p: 2, flex: 1, minWidth: 200 }}>
                <Typography variant="caption" color="text.secondary">Previsão</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toLocaleDateString('pt-BR') : 'Calculando...'}
                </Typography>
              </Paper>
              {shipment.deliveredAt && (
                <Paper variant="outlined" sx={{ p: 2, flex: 1, minWidth: 200 }}>
                  <Typography variant="caption" color="text.secondary">Entregue em</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#10b981' }}>
                    {new Date(shipment.deliveredAt).toLocaleDateString('pt-BR')}
                  </Typography>
                </Paper>
              )}
            </Box>

            <Typography variant="subtitle2" sx={{ mb: 2 }}>Histórico de Rastreio</Typography>
            <Stepper orientation="vertical" activeStep={shipment.trackingEvents.length - 1}>
              {[...shipment.trackingEvents].reverse().map((event, i) => (
                <Step key={i} completed>
                  <StepLabel>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{event.description}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {event.location} · {new Date(event.timestamp).toLocaleString('pt-BR')}
                    </Typography>
                  </StepLabel>
                  <StepContent />
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
