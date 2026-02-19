import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Card, Chip, Tooltip, Skeleton, IconButton, alpha,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { systemApi } from '../services/api';

interface ServiceInfo {
  name: string;
  host: string;
  port: number;
  externalPort: number;
  status: string;
  responseTimeMs: number;
  description: string;
  category: string;
}

interface SystemMetrics {
  totalServices: number;
  onlineCount: number;
  offlineCount: number;
  uptimePercent: number;
  avgResponseTimeMs: number;
}

interface KrtIntegration {
  available: boolean;
  methods: string[];
  responseTimeMs: number;
}

interface SystemData {
  services: ServiceInfo[];
  metrics: SystemMetrics;
  krtIntegration: KrtIntegration;
  checkedAt: string;
}

const REFRESH_INTERVAL = 15_000;
const GOLD = '#c9a962';
const GREEN = '#10b981';
const RED = '#ef4444';
const BG_CARD = '#161b22';

export default function System() {
  const [data, setData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const result = await systemApi.getStatus();
      setData(result);
      setLastUpdate(new Date());
    } catch {
      // keep previous data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    intervalRef.current = setInterval(fetchStatus, REFRESH_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchStatus]);

  const coreServices = data?.services.filter(s => s.category === 'Core') ?? [];
  const infraServices = data?.services.filter(s => s.category === 'Infraestrutura') ?? [];
  const krtServices = data?.services.filter(s => s.category === 'Integração') ?? [];

  const methodLabels: Record<string, string> = {
    pix: 'PIX',
    boleto: 'Boleto',
    credit_card: 'Cartão',
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>
            Status do Sistema
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)', mt: 0.5 }}>
            Monitoramento em tempo real dos serviços KLL Platform
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {lastUpdate && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{
                width: 8, height: 8, borderRadius: '50%', bgcolor: GREEN,
                animation: 'livePulse 2s ease-in-out infinite',
                '@keyframes livePulse': {
                  '0%': { boxShadow: `0 0 0 0 rgba(16,185,129,0.7)` },
                  '70%': { boxShadow: `0 0 0 8px rgba(16,185,129,0)` },
                  '100%': { boxShadow: `0 0 0 0 rgba(16,185,129,0)` },
                },
              }} />
              <Typography sx={{ fontSize: 13, color: GREEN, fontWeight: 600, fontFamily: 'monospace' }}>
                LIVE
              </Typography>
              <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                {lastUpdate.toLocaleTimeString('pt-BR')}
              </Typography>
            </Box>
          )}
          <Tooltip title="Atualizar agora">
            <IconButton
              size="small"
              onClick={() => { setLoading(true); fetchStatus(); }}
              sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: GOLD } }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* CORE */}
      <SectionLabel label="CORE" />
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
        {loading && !data
          ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          : coreServices.map(svc => <ServiceCard key={svc.name} service={svc} />)
        }
      </Box>

      {/* INFRAESTRUTURA */}
      <SectionLabel label="INFRAESTRUTURA" />
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
        {loading && !data
          ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          : infraServices.map(svc => <ServiceCard key={svc.name} service={svc} />)
        }
      </Box>

      {/* INTEGRAÇÃO KRT BANK */}
      <SectionLabel label="INTEGRAÇÃO KRT BANK" />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '250px 1fr' }, gap: 2, mb: 3 }}>
        {loading && !data ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            {krtServices.map(svc => <ServiceCard key={svc.name} service={svc} />)}
            {data?.krtIntegration && (
              <Card sx={{
                bgcolor: BG_CARD, border: '1px solid rgba(255,255,255,0.06)',
                borderLeft: `4px solid ${data.krtIntegration.available ? GREEN : RED}`,
                p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'center',
                transition: 'all 0.3s ease',
              }}>
                <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', mb: 1.5, fontWeight: 600, letterSpacing: 1 }}>
                  MÉTODOS DE PAGAMENTO
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                  {data.krtIntegration.available ? (
                    data.krtIntegration.methods.map(m => (
                      <Chip
                        key={m}
                        label={methodLabels[m] || m}
                        size="small"
                        sx={{
                          bgcolor: alpha(GREEN, 0.12),
                          color: GREEN,
                          fontWeight: 600,
                          fontSize: 12,
                          '&::before': { content: '"✓ "' },
                        }}
                      />
                    ))
                  ) : (
                    <Typography sx={{ fontSize: 13, color: RED }}>
                      Indisponível
                    </Typography>
                  )}
                </Box>
                <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>
                  Tempo resposta: {data.krtIntegration.responseTimeMs}ms
                </Typography>
              </Card>
            )}
          </>
        )}
      </Box>

      {/* MÉTRICAS RESUMO */}
      {data?.metrics && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 2 }}>
          <MetricCard label="Uptime" value={`${data.metrics.uptimePercent}%`}
            color={data.metrics.uptimePercent >= 90 ? GREEN : RED} />
          <MetricCard label="Online" value={`${data.metrics.onlineCount}/${data.metrics.totalServices}`}
            color={data.metrics.onlineCount === data.metrics.totalServices ? GREEN : '#f59e0b'} />
          <MetricCard label="Offline" value={`${data.metrics.offlineCount}/${data.metrics.totalServices}`}
            color={data.metrics.offlineCount === 0 ? GREEN : RED} />
          <MetricCard label="Tempo médio" value={`~${data.metrics.avgResponseTimeMs}ms`}
            color={GOLD} />
        </Box>
      )}
    </Box>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <Typography sx={{
      fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)',
      letterSpacing: 1.5, textTransform: 'uppercase', mb: 1.5, mt: 1,
    }}>
      {label}
    </Typography>
  );
}

function ServiceCard({ service }: { service: ServiceInfo }) {
  const isOnline = service.status === 'Online';
  const statusColor = isOnline ? GREEN : RED;
  const displayPort = service.externalPort || service.port;

  return (
    <Card sx={{
      bgcolor: BG_CARD, border: '1px solid rgba(255,255,255,0.06)',
      borderLeft: `4px solid ${statusColor}`,
      p: 2, transition: 'all 0.3s ease',
      '&:hover': { borderColor: alpha(statusColor, 0.3), transform: 'translateY(-1px)' },
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Box sx={{
          width: 8, height: 8, borderRadius: '50%', bgcolor: statusColor,
          boxShadow: `0 0 6px ${statusColor}`,
        }} />
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: statusColor }}>
          {service.status}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#fff', mb: 0.3 }}>
        {service.name}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
          :{displayPort}
        </Typography>
        {isOnline && (
          <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>
            {service.responseTimeMs}ms
          </Typography>
        )}
      </Box>
      {service.description && (
        <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', lineHeight: 1.3, mt: 0.3 }}>
          {service.description}
        </Typography>
      )}
    </Card>
  );
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card sx={{
      bgcolor: BG_CARD, border: '1px solid rgba(255,255,255,0.06)',
      p: 2.5, textAlign: 'center',
    }}>
      <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 1, mb: 0.5 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 24, fontWeight: 700, color, fontFamily: 'monospace' }}>
        {value}
      </Typography>
    </Card>
  );
}

function CardSkeleton() {
  return (
    <Card sx={{ bgcolor: BG_CARD, border: '1px solid rgba(255,255,255,0.06)', p: 2 }}>
      <Skeleton variant="text" width={60} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
      <Skeleton variant="text" width={120} sx={{ bgcolor: 'rgba(255,255,255,0.08)', mt: 1 }} />
      <Skeleton variant="text" width={80} sx={{ bgcolor: 'rgba(255,255,255,0.08)', mt: 0.5 }} />
    </Card>
  );
}
