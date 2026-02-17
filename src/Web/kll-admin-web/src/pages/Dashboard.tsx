import { useState, useEffect, useCallback } from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip, Alert, Skeleton, IconButton, Tooltip } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentIcon from '@mui/icons-material/Payment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { storeApi, healthApi, payApi } from '../services/api';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  loading?: boolean;
}

function MetricCard({ title, value, icon, color, subtitle, loading }: MetricCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>{title}</Typography>
            {loading ? (
              <Skeleton variant="text" width={80} height={42} />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{value}</Typography>
            )}
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

const serviceLabels: Record<string, { name: string; port: number }> = {
  store: { name: 'KLL Store', port: 5200 },
  pay: { name: 'KLL Pay', port: 5300 },
  logistics: { name: 'KLL Logistics', port: 5400 },
};

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Dashboard() {
  const [health, setHealth] = useState<Record<string, string> | null>(null);
  const [healthError, setHealthError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalTransactions: 0,
    transactionsOnline: false,
    totalShipments: '—',
    shipmentsOnline: false,
  });
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [products, orders, healthData] = await Promise.allSettled([
        storeApi.getProducts(),
        storeApi.getAllOrders(),
        healthApi.getAll(),
      ]);

      const productCount = products.status === 'fulfilled' ? products.value.length : 0;
      const orderList = orders.status === 'fulfilled' ? orders.value : [];
      const orderCount = orderList.length;
      const revenue = orderList.reduce((sum, o) => sum + o.totalAmount, 0);

      let transactionCount = 0;
      let transactionsOnline = false;
      try {
        const merchants = await payApi.getMerchants();
        transactionsOnline = true;
        for (const m of merchants) {
          try {
            const txs = await payApi.getTransactions(m.id);
            transactionCount += txs.length;
          } catch { /* skip */ }
        }
      } catch { /* pay offline */ }

      setMetrics({
        totalProducts: productCount,
        totalOrders: orderCount,
        totalRevenue: revenue,
        totalTransactions: transactionCount,
        transactionsOnline,
        totalShipments: '—',
        shipmentsOnline: healthData.status === 'fulfilled' && healthData.value.logistics === 'Healthy',
      });

      if (healthData.status === 'fulfilled') {
        setHealth(healthData.value);
        setHealthError(false);
      } else {
        setHealthError(true);
      }

      setLastCheck(new Date());
    } catch {
      setHealthError(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Dashboard</Typography>
        <Tooltip title="Atualizar dados">
          <IconButton onClick={fetchData} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Visão geral do ecossistema Aurea Maison
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Produtos"
            value={metrics.totalProducts}
            icon={<InventoryIcon />}
            color="#6366f1"
            subtitle="Catálogo ativo"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Pedidos"
            value={metrics.totalOrders}
            icon={<ShoppingCartIcon />}
            color="#10b981"
            subtitle={`Receita: ${formatCurrency(metrics.totalRevenue)}`}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Transações"
            value={metrics.transactionsOnline ? metrics.totalTransactions : 'Offline'}
            icon={<PaymentIcon />}
            color="#f59e0b"
            subtitle="KLL Pay"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Entregas"
            value={metrics.shipmentsOnline ? metrics.totalShipments : 'Offline'}
            icon={<LocalShippingIcon />}
            color="#ec4899"
            subtitle="KLL Logistics"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Service Health */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Status dos Microserviços</Typography>
            {lastCheck && (
              <Typography variant="caption" color="text.secondary">
                Última verificação: {lastCheck.toLocaleTimeString('pt-BR')}
              </Typography>
            )}
          </Box>
          {healthError ? (
            <Alert severity="warning">
              Não foi possível verificar os serviços. Verifique se o Gateway está rodando na porta 5100.
            </Alert>
          ) : !health ? (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Skeleton variant="rounded" width={180} height={40} />
              <Skeleton variant="rounded" width={180} height={40} />
              <Skeleton variant="rounded" width={180} height={40} />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {Object.entries(health).map(([svc, status]) => {
                const info = serviceLabels[svc] || { name: svc, port: '?' };
                const isHealthy = status === 'Healthy';
                return (
                  <Card key={svc} variant="outlined" sx={{
                    px: 2, py: 1.5, minWidth: 200,
                    borderColor: isHealthy ? 'success.main' : 'error.main',
                    borderWidth: 1,
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FiberManualRecordIcon sx={{
                        fontSize: 12,
                        color: isHealthy ? 'success.main' : 'error.main',
                        animation: isHealthy ? 'pulse 2s infinite' : 'none',
                        '@keyframes pulse': {
                          '0%, 100%': { opacity: 1 },
                          '50%': { opacity: 0.4 },
                        },
                      }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{info.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Porta {info.port} — {isHealthy ? 'Online' : 'Offline'}
                        </Typography>
                      </Box>
                      {isHealthy ? (
                        <CheckCircleIcon sx={{ ml: 'auto', color: 'success.main', fontSize: 20 }} />
                      ) : (
                        <ErrorIcon sx={{ ml: 'auto', color: 'error.main', fontSize: 20 }} />
                      )}
                    </Box>
                  </Card>
                );
              })}
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
