import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Button, Card, CardContent, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Chip, Alert, CircularProgress,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { storeApi, uploadApi } from '../services/api';
import type { Product } from '../types';

function formatBRL(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

function parseBRLInput(value: string): number {
  const digits = value.replace(/\D/g, '');
  return parseInt(digits || '0', 10);
}

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

const initialForm = { name: '', description: '', priceCents: 0, stockQuantity: '', category: '', imageUrl: '' };

export default function Products() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [priceDisplay, setPriceDisplay] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => storeApi.getProducts(),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => storeApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      handleClose();
    },
  });

  const handleClose = () => {
    setOpen(false);
    setForm(initialForm);
    setPriceDisplay('');
    setImageFile(null);
    setImagePreview(null);
  };

  const handlePriceChange = (value: string) => {
    const cents = parseBRLInput(value);
    setForm({ ...form, priceCents: cents });
    setPriceDisplay(cents > 0 ? formatBRL(cents) : '');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    let imageUrl = form.imageUrl;

    if (imageFile) {
      setUploading(true);
      try {
        const result = await uploadApi.uploadImage(imageFile);
        imageUrl = result.url;
      } catch {
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    mutation.mutate({
      name: form.name,
      description: form.description,
      price: form.priceCents / 100,
      stockQuantity: parseInt(form.stockQuantity),
      category: form.category,
      imageUrl: imageUrl || null,
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

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Novo Produto</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth required />
          <TextField label="Descrição" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} fullWidth multiline rows={2} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Preço (R$)"
              value={priceDisplay}
              onChange={e => handlePriceChange(e.target.value)}
              placeholder="R$ 0,00"
              fullWidth
              required
            />
            <TextField label="Estoque" value={form.stockQuantity} onChange={e => setForm({ ...form, stockQuantity: e.target.value })} type="number" fullWidth required />
          </Box>
          <TextField label="Categoria" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} fullWidth required />

          <Box>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              fullWidth
              sx={{ py: 1.5, borderStyle: 'dashed' }}
            >
              {imageFile ? imageFile.name : 'Selecionar Imagem (máx 5MB)'}
            </Button>
            {imagePreview && (
              <Box sx={{ mt: 1.5, textAlign: 'center' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 8, objectFit: 'contain' }}
                />
              </Box>
            )}
            {!imageFile && (
              <TextField
                label="Ou cole a URL da imagem"
                value={form.imageUrl}
                onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                fullWidth
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={mutation.isPending || uploading}
            startIcon={uploading ? <CircularProgress size={16} /> : undefined}
          >
            {uploading ? 'Enviando imagem...' : mutation.isPending ? 'Criando...' : 'Criar Produto'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
