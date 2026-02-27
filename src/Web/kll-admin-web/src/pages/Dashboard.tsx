import { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Chip, Skeleton,
  IconButton, Tooltip, Alert, Button, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
// Grid removed — using flex for KPI layout
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PeopleIcon from '@mui/icons-material/People';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import InventoryIcon from '@mui/icons-material/Inventory';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useNavigate } from 'react-router-dom';
import { dashboardApi, healthApi } from '../services/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

// ---------- Types ----------

interface RevenueDay {
  date: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  id: string;
  name: string;
  imageUrl?: string;
  soldCount: number;
  revenue: number;
}

interface RecentOrder {
  id: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  averageTicket: number;
  totalCustomers: number;
  pendingOrders: number;
  lowStockProducts: number;
  revenueByDay: RevenueDay[];
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
  ordersByStatus: Record<string, number>;
}

// ---------- Helpers ----------

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatCompact = (value: number) => {
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}k`;
  return formatCurrency(value);
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return `${diffMin}min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d`;
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
  logistics: 'Logistica',
};

// ---------- KPI Card ----------

const kpiColors: Record<string, { bg: string; text: string }> = {
  gold: { bg: 'rgba(201,169,98,0.12)', text: '#c9a962' },
  blue: { bg: 'rgba(99,102,241,0.12)', text: '#6366f1' },
  green: { bg: 'rgba(16,185,129,0.12)', text: '#10b981' },
  purple: { bg: 'rgba(139,92,246,0.12)', text: '#8b5cf6' },
  amber: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' },
};

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorKey: string;
  subtitle?: string;
  loading?: boolean;
}

function KpiCard({ title, value, icon, colorKey, subtitle, loading }: KpiCardProps) {
  const colors = kpiColors[colorKey] || kpiColors.gold;
  return (
    <Card sx={{
      height: '100%',
      background: `linear-gradient(135deg, ${colors.bg} 0%, transparent 60%)`,
      border: `1px solid ${colors.text}15`,
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: `0 0 20px ${colors.text}20`,
        transform: 'translateY(-3px)',
        borderColor: `${colors.text}30`,
      },
      '@keyframes fadeInUp': {
        from: { opacity: 0, transform: 'translateY(12px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
      },
      animation: 'fadeInUp 0.5s ease-out',
    }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontSize: 11, mb: 0.8, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
              {title}
            </Typography>
            {loading ? (
              <Skeleton variant="text" width={100} height={40} />
            ) : (
              <Typography variant="h5" sx={{ fontWeight: 700, fontSize: 24, color: '#fff', lineHeight: 1.2 }}>
                {value}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block', fontSize: 11 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{
            width: 42, height: 42, borderRadius: '12px',
            bgcolor: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: colors.text, flexShrink: 0, ml: 1,
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// ---------- Chart Tooltip ----------

function ChartTooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  const dateObj = new Date(label + 'T12:00:00');
  const formatted = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  return (
    <Box sx={{
      bgcolor: '#1e293b', border: '1px solid rgba(201,169,98,0.2)', borderRadius: 1.5, p: 1.5,
      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    }}>
      <Typography sx={{ fontSize: 12, color: '#c9a962', fontWeight: 600, mb: 0.5 }}>{formatted}</Typography>
      <Typography sx={{ fontSize: 12, color: '#fff' }}>Receita: {formatCurrency(data.revenue)}</Typography>
      <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{data.orders} pedido(s)</Typography>
    </Box>
  );
}

// ---------- Main Dashboard ----------

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [health, setHealth] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [statsData, healthData] = await Promise.allSettled([
        dashboardApi.getStats(),
        healthApi.getAll(),
      ]);

      if (statsData.status === 'fulfilled') {
        setStats(statsData.value);
      } else {
        setError(true);
      }

      if (healthData.status === 'fulfilled') {
        setHealth(healthData.value);
      }
    } catch {
      setError(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (error && !stats) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <WarningAmberIcon sx={{ fontSize: 48, color: '#f59e0b', mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>Erro ao carregar dados</Typography>
        <Typography color="text.secondary" sx={{ mb: 3, fontSize: 14 }}>
          Nao foi possivel conectar ao servidor
        </Typography>
        <Button variant="contained" onClick={fetchData} sx={{ bgcolor: '#c9a962', '&:hover': { bgcolor: '#b8944f' } }}>
          Tentar novamente
        </Button>
      </Box>
    );
  }

  const maxSold = stats?.topProducts?.[0]?.soldCount || 1;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            {getGreeting()}, Admin
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
            Visao geral da AUREA Maison
          </Typography>
        </Box>
        <Tooltip title="Atualizar dados">
          <IconButton onClick={fetchData} disabled={loading} sx={{ color: 'text.secondary' }}>
            <RefreshIcon sx={{ animation: loading ? 'spin 1s linear infinite' : 'none', '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } } }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: 0, sm: 160 }, maxWidth: { xs: 'calc(50% - 8px)', sm: 'none' } }}>
          <KpiCard
            title="Receita do Mes"
            value={stats ? formatCurrency(stats.totalRevenue) : '...'}
            icon={<TrendingUpIcon sx={{ fontSize: 22 }} />}
            colorKey="gold"
            subtitle="Pedidos pagos/entregues"
            loading={loading}
          />
        </Box>
        <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: 0, sm: 160 }, maxWidth: { xs: 'calc(50% - 8px)', sm: 'none' } }}>
          <KpiCard
            title="Pedidos"
            value={stats?.totalOrders ?? 0}
            icon={<ShoppingCartIcon sx={{ fontSize: 22 }} />}
            colorKey="blue"
            subtitle={`${stats?.pendingOrders ?? 0} pendente(s)`}
            loading={loading}
          />
        </Box>
        <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: 0, sm: 160 }, maxWidth: { xs: 'calc(50% - 8px)', sm: 'none' } }}>
          <KpiCard
            title="Ticket Medio"
            value={stats ? formatCurrency(stats.averageTicket) : '...'}
            icon={<ReceiptLongIcon sx={{ fontSize: 22 }} />}
            colorKey="green"
            subtitle="Receita / pedidos"
            loading={loading}
          />
        </Box>
        <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: 0, sm: 160 }, maxWidth: { xs: 'calc(50% - 8px)', sm: 'none' } }}>
          <KpiCard
            title="Clientes"
            value={stats?.totalCustomers ?? 0}
            icon={<PeopleIcon sx={{ fontSize: 22 }} />}
            colorKey="purple"
            subtitle="Unicos este mes"
            loading={loading}
          />
        </Box>
        <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: 0, sm: 160 }, maxWidth: { xs: 'calc(50% - 8px)', sm: 'none' } }}>
          <KpiCard
            title="Alertas"
            value={`${stats?.lowStockProducts ?? 0} + ${stats?.pendingOrders ?? 0}`}
            icon={<WarningAmberIcon sx={{ fontSize: 22 }} />}
            colorKey="amber"
            subtitle="Estoque baixo + pendentes"
            loading={loading}
          />
        </Box>
      </Box>

      {/* Sales Chart */}
      <Card sx={{ mb: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 16, mb: 2.5 }}>
            Vendas dos Ultimos 30 Dias
          </Typography>
          {loading ? (
            <Skeleton variant="rounded" height={280} />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={stats?.revenueByDay || []} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c9a962" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c9a962" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v: string) => {
                    const d = new Date(v + 'T12:00:00');
                    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                  }}
                  stroke="rgba(255,255,255,0.2)"
                  tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }}
                  interval="preserveStartEnd"
                  minTickGap={40}
                />
                <YAxis
                  tickFormatter={(v: number) => formatCompact(v)}
                  stroke="rgba(255,255,255,0.2)"
                  tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }}
                  width={65}
                />
                <RechartsTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#c9a962"
                  strokeWidth={2}
                  fill="url(#goldGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#c9a962', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Row 1: Top Products + Recent Orders (side by side) */}
      <Box sx={{ display: 'flex', gap: 2.5, mb: 2.5, flexDirection: { xs: 'column', md: 'row' } }}>

        {/* Top Products */}
        <Card sx={{ flex: 1, border: '1px solid rgba(255,255,255,0.06)', minWidth: 0 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 16 }}>Top Produtos</Typography>
              <Button
                size="small"
                endIcon={<ArrowForwardIcon sx={{ fontSize: '14px !important' }} />}
                onClick={() => navigate('/products')}
                sx={{ fontSize: 12, textTransform: 'none', color: '#c9a962' }}
              >
                Ver todos
              </Button>
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[...Array(5)].map((_, i) => <Skeleton key={i} variant="rounded" height={48} />)}
              </Box>
            ) : !stats?.topProducts?.length ? (
              <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center', fontSize: 13 }}>
                Nenhuma venda registrada
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {stats.topProducts.map((product, index) => (
                  <Box
                    key={product.id}
                    onClick={() => navigate('/products')}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5,
                      p: 1.5, borderRadius: 1.5, cursor: 'pointer',
                      bgcolor: 'rgba(255,255,255,0.02)',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: 'rgba(201,169,98,0.06)' },
                    }}
                  >
                    <Typography sx={{
                      fontSize: 13, fontWeight: 700, color: index === 0 ? '#c9a962' : 'text.secondary',
                      width: 20, textAlign: 'center', flexShrink: 0,
                    }}>
                      {index + 1}
                    </Typography>
                    {product.imageUrl ? (
                      <Box
                        component="img"
                        src={product.imageUrl}
                        sx={{ width: 36, height: 36, borderRadius: 1, objectFit: 'cover', flexShrink: 0 }}
                      />
                    ) : (
                      <Box sx={{
                        width: 36, height: 36, borderRadius: 1, flexShrink: 0,
                        bgcolor: 'rgba(201,169,98,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <InventoryIcon sx={{ fontSize: 18, color: '#c9a962' }} />
                      </Box>
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
                        {product.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(product.soldCount / maxSold) * 100}
                          sx={{
                            flex: 1, height: 4, borderRadius: 2,
                            bgcolor: 'rgba(255,255,255,0.05)',
                            '& .MuiLinearProgress-bar': { bgcolor: '#c9a962', borderRadius: 2 },
                          }}
                        />
                        <Typography sx={{ fontSize: 11, color: 'text.secondary', flexShrink: 0 }}>
                          {product.soldCount}x
                        </Typography>
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#c9a962', flexShrink: 0, ml: 1 }}>
                      {formatCompact(product.revenue)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card sx={{ flex: 1, border: '1px solid rgba(255,255,255,0.06)', minWidth: 0 }}>
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
                {[...Array(5)].map((_, i) => <Skeleton key={i} variant="rounded" height={44} sx={{ mb: 1 }} />)}
              </Box>
            ) : !stats?.recentOrders?.length ? (
              <Box sx={{ px: 3, pb: 4, textAlign: 'center' }}>
                <Typography color="text.secondary" sx={{ py: 3, fontSize: 13 }}>Nenhum pedido ainda</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, fontSize: 11, color: 'text.secondary', borderColor: 'rgba(255,255,255,0.06)', textTransform: 'uppercase' }}>Cliente</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 11, color: 'text.secondary', borderColor: 'rgba(255,255,255,0.06)', textTransform: 'uppercase' }} align="right">Valor</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 11, color: 'text.secondary', borderColor: 'rgba(255,255,255,0.06)', textTransform: 'uppercase' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 11, color: 'text.secondary', borderColor: 'rgba(255,255,255,0.06)', textTransform: 'uppercase', display: { xs: 'none', lg: 'table-cell' } }} align="right">Quando</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recentOrders.map(order => (
                      <TableRow
                        key={order.id}
                        hover
                        onClick={() => navigate('/orders')}
                        sx={{ cursor: 'pointer', '& td': { borderColor: 'rgba(255,255,255,0.04)' } }}
                      >
                        <TableCell sx={{ fontSize: 13, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {order.customerName}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>
                          {formatCurrency(order.total)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={statusLabel[order.status] || order.status}
                            size="small"
                            color={statusColor[order.status] || 'default'}
                            sx={{ fontSize: 11, height: 22 }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: 12, color: 'text.secondary', display: { xs: 'none', lg: 'table-cell' } }}>
                          {timeAgo(order.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Row 2: Service Health + Alerts (full width, horizontal) */}
      <Card sx={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 16 }}>Servicos</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            {!health ? (
              [1, 2, 3].map(i => <Skeleton key={i} variant="rounded" width={140} height={36} />)
            ) : (
              Object.entries(health).map(([svc, status]) => {
                const isHealthy = status === 'Healthy';
                const name = serviceLabels[svc] || svc;
                return (
                  <Box
                    key={svc}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1,
                      py: 1, px: 2, borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isHealthy ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.2)'}`,
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
                    <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 500 }}>{name}</Typography>
                    <Typography variant="caption" sx={{
                      color: isHealthy ? '#10b981' : '#ef4444',
                      fontWeight: 600, fontSize: 11,
                    }}>
                      {isHealthy ? 'Online' : 'Offline'}
                    </Typography>
                  </Box>
                );
              })
            )}

            {/* Inline Alerts */}
            {stats && stats.lowStockProducts > 0 && (
              <Box
                onClick={() => navigate('/products')}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1, py: 1, px: 2, borderRadius: 2,
                  cursor: 'pointer',
                  bgcolor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
                  '&:hover': { bgcolor: 'rgba(245,158,11,0.12)' },
                }}
              >
                <InventoryIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                <Typography sx={{ fontSize: 12, color: '#f59e0b', fontWeight: 500 }}>
                  {stats.lowStockProducts} estoque baixo
                </Typography>
              </Box>
            )}
            {stats && stats.pendingOrders > 0 && (
              <Box
                onClick={() => navigate('/orders')}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1, py: 1, px: 2, borderRadius: 2,
                  cursor: 'pointer',
                  bgcolor: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
                  '&:hover': { bgcolor: 'rgba(99,102,241,0.12)' },
                }}
              >
                <ShoppingCartIcon sx={{ fontSize: 16, color: '#6366f1' }} />
                <Typography sx={{ fontSize: 12, color: '#6366f1', fontWeight: 500 }}>
                  {stats.pendingOrders} pendente(s)
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
