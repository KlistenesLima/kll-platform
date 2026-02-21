import { useQuery } from '@tanstack/react-query';
import {
  Box, Typography, Card, CardContent, Chip, Alert, Skeleton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { payApi } from '../services/api';
import type { Merchant } from '../types';

export default function Merchants() {
  const { data: merchants, isLoading, error } = useQuery<Merchant[]>({
    queryKey: ['merchants'],
    queryFn: () => payApi.getMerchants(),
  });

  const copyApiKey = (key: string) => navigator.clipboard.writeText(key);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Merchants</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Gerenciamento de lojistas</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>Erro ao carregar merchants.</Alert>}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>CNPJ</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>API Key</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Cadastro</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !merchants?.length ? (
                <TableRow><TableCell colSpan={6} align="center">Nenhum merchant cadastrado</TableCell></TableRow>
              ) : merchants.map(m => (
                <TableRow key={m.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{m.name}</TableCell>
                  <TableCell>{m.document}</TableCell>
                  <TableCell>{m.email}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                        {m.apiKey.slice(0, 16)}...
                      </Typography>
                      <Tooltip title="Copiar API Key">
                        <IconButton size="small" onClick={() => copyApiKey(m.apiKey)}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={m.isActive ? 'Ativo' : 'Inativo'} size="small"
                      color={m.isActive ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell>{new Date(m.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
