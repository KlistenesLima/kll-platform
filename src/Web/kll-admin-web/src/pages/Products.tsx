import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Button, Card, CardContent, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Chip, Alert,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import { storeApi } from '../services/api';
import type { Product } from '../types';

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Produto', flex: 1, minWidth: 200 },
  { field: 'category', headerName: 'Categoria', width: 130,
    renderCell: (p) => <Chip label={p.value} size="small" variant="outlined" /> },
  { field: 'price', headerName: 'Preço', width: 120, type: 'number',
    valueFormatter: (v: number) => `R$ ${v?.toFixed(2)}` },
  { field: 'stockQuantity', headerName: 'Estoque', width: 100, type: 'number' },
  { field: 'isActive', headerName: 'Status', width: 100,
    renderCell: (p) => <Chip label={p.value ? 'Ativo' : 'Inativo'} size="small" color={p.value ? 'success' : 'default'} /> },
  { field: 'createdAt', headerName: 'Criado em', width: 160,
    valueFormatter: (v: string) => v ? new Date(v).toLocaleDateString('pt-BR') : '' },
];

const initialForm = { name: '', description: '', price: '', stockQuantity: '', category: '', imageUrl: '' };

export default function Products() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const queryClient = useQueryClient();

  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => storeApi.getProducts(),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => storeApi.createProduct(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); setOpen(false); setForm(initialForm); },
  });

  const handleSubmit = () => {
    mutation.mutate({
      ...form,
      price: parseFloat(form.price),
      stockQuantity: parseInt(form.stockQuantity),
      imageUrl: form.imageUrl || null,
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Produtos</Typography>
          <Typography variant="body2" color="text.secondary">Gerenciamento do catálogo — KLL Store</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Novo Produto</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>Erro ao carregar produtos. Verifique se o Store API está rodando.</Alert>}

      <Card>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <DataGrid
            rows={products || []}
            columns={columns}
            loading={isLoading}
            autoHeight
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
            sx={{ border: 'none', '& .MuiDataGrid-cell': { borderColor: 'rgba(255,255,255,0.06)' } }}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Novo Produto</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth required />
          <TextField label="Descrição" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} fullWidth multiline rows={2} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Preço (R$)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} type="number" fullWidth required />
            <TextField label="Estoque" value={form.stockQuantity} onChange={e => setForm({ ...form, stockQuantity: e.target.value })} type="number" fullWidth required />
          </Box>
          <TextField label="Categoria" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} fullWidth required />
          <TextField label="URL da Imagem" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} fullWidth />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Criando...' : 'Criar Produto'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
