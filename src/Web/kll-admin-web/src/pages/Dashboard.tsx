import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip, Alert, Skeleton } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentIcon from '@mui/icons-material/Payment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { healthApi } from '../services/api';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

function MetricCard({ title, value, icon, color, subtitle }: MetricCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>{title}</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{value}</Typography>
            {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
          </Box>
          <Box sx={{
            width: 48, height: 48, borderRadius: 2,
            bgcolor: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: color,
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [health, setHealth] = useState<Record<string, string> | null>(null);
  const [healthError, setHealthError] = useState(false);

  useEffect(() => {
    healthApi.getAll()
      .then(setHealth)
      .catch(() => setHealthError(true));
  }, []);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Dashboard</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Visão geral do ecossistema KLL Platform
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Produtos" value="—" icon={<InventoryIcon />} color="#6366f1" subtitle="Catálogo ativo" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Pedidos" value="—" icon={<ShoppingCartIcon />} color="#10b981" subtitle="Total processado" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Transações" value="—" icon={<PaymentIcon />} color="#f59e0b" subtitle="KLL Pay" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Entregas" value="—" icon={<LocalShippingIcon />} color="#ec4899" subtitle="Em andamento" />
        </Grid>
      </Grid>

      {/* Service Health */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Status dos Microserviços</Typography>
          {healthError ? (
            <Alert severity="warning">
              Serviços indisponíveis. Execute <code>docker compose up -d</code> para iniciar a infraestrutura.
            </Alert>
          ) : !health ? (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Skeleton variant="rounded" width={120} height={32} />
              <Skeleton variant="rounded" width={120} height={32} />
              <Skeleton variant="rounded" width={120} height={32} />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {Object.entries(health).map(([svc, status]) => (
                <Chip
                  key={svc}
                  label={`${svc}: ${status}`}
                  icon={status === 'Healthy' ? <CheckCircleIcon /> : <ErrorIcon />}
                  color={status === 'Healthy' ? 'success' : 'error'}
                  variant="outlined"
                />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Architecture Overview */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Arquitetura</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { label: 'Clean Architecture', desc: 'Domain → Application → Infrastructure → API' },
                  { label: 'CQRS + MediatR', desc: 'Commands e Queries separados com pipeline' },
                  { label: 'Event-Driven', desc: 'Kafka para integração, RabbitMQ para notificações' },
                  { label: 'Saga Pattern', desc: 'Orquestração com compensação automática' },
                  { label: 'Outbox Pattern', desc: 'Garantia de entrega de eventos' },
                ].map((item) => (
                  <Box key={item.label} sx={{ display: 'flex', gap: 1 }}>
                    <Chip label={item.label} size="small" color="primary" variant="outlined" sx={{ minWidth: 140 }} />
                    <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Tech Stack</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {[
                  '.NET 8', 'React 18', 'TypeScript', 'PostgreSQL', 'Redis',
                  'Kafka', 'RabbitMQ', 'Docker', 'EF Core', 'SignalR',
                  'Polly', 'Serilog', 'SEQ', 'FluentValidation', 'YARP Gateway',
                  'Material UI', 'xUnit', 'Keycloak'
                ].map((tech) => (
                  <Chip key={tech} label={tech} size="small" sx={{ bgcolor: 'rgba(99,102,241,0.1)' }} />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
