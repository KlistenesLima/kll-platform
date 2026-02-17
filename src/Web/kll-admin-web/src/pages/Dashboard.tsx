import { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Chip, Alert, Skeleton,
  IconButton, Tooltip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import RefreshIcon from '@mui/icons-material/Refresh';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { storeApi, healthApi, payApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import type { Order } from '../types';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  subtitleColor?: string;
  loading?: boolean;
}

function MetricCard({ title, value, icon, color, subtitle, subtitleColor, loading }: MetricCardProps) {
  return (
    <Card sx={{
      height: '100%',
      transition: 'box-shadow 0.2s, transform 0.2s',
      '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, mb: 1 }}>
              {title}
            </Typography>
            {loading ? (
              <Skeleton variant="text" width={100} height={42} />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: 28 }}>{value}</Typography>
            )}
            {subtitle && (
              <Typography variant="caption" sx={{ color: subtitleColor || 'text.secondary', mt: 0.5, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{
            width: 44, height: 44, borderRadius: '50%',
            bgcolor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: color,
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

const statusColor: Record<string, 'default' | 'warning' | 'success' | 'info' | 'error'> = {
  Pending: 'warning', Paid: 'info', Processing: 'info', Shipped: 'success', Delivered: 'success', Cancelled: 'error',
};

const statusLabel: Record<string, string> = {
  Pending: 'Pendente', Paid: 'Pago', Processing: 'Processando', Shipped: 'Enviado', Delivered: 'Entregue', Cancelled: 'Cancelado',
};

const serviceLabels: Record<string, string> = {
  store: 'Loja',
  pay: 'Pagamentos',
  logistics: 'Logística',
};

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [health, setHealth] = useState<Record<string, string> | null>(null);
  const [healthError, setHealthError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
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
      const pending = orderList.filter(o => o.status === 'Pending' || o.status === '0').length;

      setMetrics({
        totalProducts: productCount,
        totalOrders: orderCount,
        pendingOrders: pending,
        totalRevenue: revenue,
      });

      setRecentOrders(
        [...orderList]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
      );

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
      {/* Greeting */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {getGreeting()}, Admin
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
            Aqui está o resumo da sua loja hoje
          </Typography>
        </Box>
        <Tooltip title="Atualizar dados">
          <IconButton onClick={fetchData} disabled={loading} sx={{ color: 'text.secondary' }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Receita Total"
            value={formatCurrency(metrics.totalRevenue)}
            icon={<TrendingUpIcon />}
            color="#10b981"
            subtitle="Total processado"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Pedidos"
            value={metrics.totalOrders}
            icon={<ShoppingCartIcon />}
            color="#6366f1"
            subtitle={metrics.pendingOrders > 0 ? `${metrics.pendingOrders} pendente(s)` : 'Nenhum pendente'}
            subtitleColor={metrics.pendingOrders > 0 ? '#f59e0b' : undefined}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Produtos"
            value={metrics.totalProducts}
            icon={<InventoryIcon />}
            color="#8b5cf6"
            subtitle="Catálogo ativo"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Taxa de Conversão"
            value="—"
            icon={<ShowChartIcon />}
            color="#ec4899"
            subtitle="Em breve"
            loading={false}
          />
        </Grid>
      </Grid>

      {/* Two-column layout */}
      <Box sx={{ display: 'flex', gap: 2.5, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Left: Recent Orders */}
        <Card sx={{ flex: 2 }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, pt: 3, pb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 16 }}>Pedidos Recentes</Typography>
              <Button
                size="small"
                endIcon={<ArrowForwardIcon sx={{ fontSize: '14px !important' }} />}
                onClick={() => navigate('/orders')}
                sx={{ fontSize: 12, textTransform: 'none', color: '#c9a962' }}
              >
                Ver todos
              </Button>
            </Box>
            {loading ? (
              <Box sx={{ px: 3, pb: 3 }}>
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={44} sx={{ mb: 1 }} />
                ))}
              </Box>
            ) : recentOrders.length === 0 ? (
              <Box sx={{ px: 3, pb: 4, textAlign: 'center' }}>
                <Typography color="text.secondary" sx={{ py: 3 }}>Nenhum pedido ainda</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, fontSize: 12, color: 'text.secondary', borderColor: 'rgba(255,255,255,0.06)' }}>Pedido</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 12, color: 'text.secondary', borderColor: 'rgba(255,255,255,0.06)' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 12, color: 'text.secondary', borderColor: 'rgba(255,255,255,0.06)' }} align="right">Valor</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 12, color: 'text.secondary', borderColor: 'rgba(255,255,255,0.06)' }}>Data</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.map(order => (
                      <TableRow key={order.id} hover sx={{ '& td': { borderColor: 'rgba(255,255,255,0.04)' } }}>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                          #{order.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={statusLabel[order.status] || order.status}
                            size="small"
                            color={statusColor[order.status] || 'default'}
                            sx={{ fontSize: 11, height: 22 }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, fontSize: 13 }}>
                          {formatCurrency(order.totalAmount)}
                        </TableCell>
                        <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>
                          {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Right: Service Status */}
        <Card sx={{ flex: 1, alignSelf: 'flex-start' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 16 }}>Status dos Serviços</Typography>
            </Box>

            {healthError ? (
              <Alert severity="warning" sx={{ fontSize: 13 }}>
                Não foi possível verificar os serviços.
              </Alert>
            ) : !health ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={36} />)}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {Object.entries(health).map(([svc, status]) => {
                  const isHealthy = status === 'Healthy';
                  const name = serviceLabels[svc] || svc;
                  return (
                    <Box
                      key={svc}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 1.5,
                        py: 1, px: 1.5, borderRadius: 1.5,
                        bgcolor: 'rgba(255,255,255,0.02)',
                      }}
                    >
                      <FiberManualRecordIcon sx={{
                        fontSize: 10,
                        color: isHealthy ? '#10b981' : '#ef4444',
                        animation: isHealthy ? 'pulse 2s infinite' : 'none',
                        '@keyframes pulse': {
                          '0%, 100%': { opacity: 1 },
                          '50%': { opacity: 0.4 },
                        },
                      }} />
                      <Typography variant="body2" sx={{ flex: 1, fontSize: 13 }}>{name}</Typography>
                      <Typography variant="caption" sx={{
                        color: isHealthy ? '#10b981' : '#ef4444',
                        fontWeight: 500,
                        fontSize: 11,
                      }}>
                        {isHealthy ? 'Online' : 'Offline'}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}

            {lastCheck && (
              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 2, fontSize: 10 }}>
                Verificado às {lastCheck.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
