import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Button, Card, CardContent, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Chip, Alert, CircularProgress,
  IconButton, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { storeApi, categoryApi, uploadApi } from '../services/api';
import type { Product, Category } from '../types';

function formatBRL(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

function parseBRLInput(value: string): number {
  const digits = value.replace(/\D/g, '');
  return parseInt(digits || '0', 10);
}

const initialForm = { name: '', description: '', priceCents: 0, stockQuantity: '', categoryId: '', imageUrl: '' };

export default function Products() {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
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

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(false),
  });

  // Flatten categories + subcategories for the select
  const flatCategories = (categories || []).reduce<Category[]>((acc, cat) => {
    acc.push(cat);
    if (cat.subCategories) {
      cat.subCategories.forEach(sub => acc.push(sub));
    }
    return acc;
  }, []);

  const createMutation = useMutation({
    mutationFn: (data: any) => storeApi.createProduct(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); handleClose(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => storeApi.updateProduct(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); handleClose(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => storeApi.deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    setForm(initialForm);
    setPriceDisplay('');
    setImageFile(null);
    setImagePreview(null);
  };

  const handleEdit = (product: Product) => {
    setEditId(product.id);
    const cents = Math.round(product.price * 100);
    setForm({
      name: product.name,
      description: product.description,
      priceCents: cents,
      stockQuantity: String(product.stockQuantity),
      categoryId: product.categoryId || '',
      imageUrl: product.imageUrl || '',
    });
    setPriceDisplay(formatBRL(cents));
    if (product.imageUrl) setImagePreview(product.imageUrl);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja desativar este produto?')) {
      deleteMutation.mutate(id);
    }
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

    const selectedCategory = flatCategories.find(c => c.id === form.categoryId);

    const payload = {
      name: form.name,
      description: form.description,
      price: form.priceCents / 100,
      stockQuantity: parseInt(form.stockQuantity),
      category: selectedCategory?.name || '',
      categoryId: form.categoryId || null,
      imageUrl: imageUrl || null,
    };

    if (editId) {
      updateMutation.mutate({ id: editId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const getCategoryName = (row: Product) => {
    if (row.categoryId) {
      const cat = flatCategories.find(c => c.id === row.categoryId);
      if (cat) return cat.name;
    }
    return row.category || '—';
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Produto', flex: 1, minWidth: 200 },
    { field: 'category', headerName: 'Categoria', width: 150,
      renderCell: (p) => {
        const name = getCategoryName(p.row);
        return <Chip label={name} size="small" variant="outlined" />;
      }
    },
    { field: 'price', headerName: 'Preço', width: 120, type: 'number',
      valueFormatter: (v: number) => `R$ ${v?.toFixed(2)}` },
    { field: 'stockQuantity', headerName: 'Estoque', width: 100, type: 'number' },
    { field: 'isActive', headerName: 'Status', width: 100,
      renderCell: (p) => <Chip label={p.value ? 'Ativo' : 'Inativo'} size="small" color={p.value ? 'success' : 'default'} /> },
    { field: 'createdAt', headerName: 'Criado em', width: 140,
      valueFormatter: (v: string) => v ? new Date(v).toLocaleDateString('pt-BR') : '' },
    {
      field: 'actions', headerName: 'Ações', width: 120, sortable: false,
      renderCell: (p) => (
        <Box>
          <IconButton size="small" onClick={() => handleEdit(p.row)} color="primary"><EditIcon fontSize="small" /></IconButton>
          <IconButton size="small" onClick={() => handleDelete(p.row.id)} color="error"><DeleteIcon fontSize="small" /></IconButton>
        </Box>
      ),
    },
  ];

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>Produtos</Typography>
          <Typography variant="body2" color="text.secondary">Gerenciamento do catálogo</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}>Novo Produto</Button>
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
            sx={{ border: 'none', '& .MuiDataGrid-cell': { borderColor: 'rgba(255,255,255,0.06)' }, '& .MuiDataGrid-virtualScroller': { overflowX: 'auto' }, minWidth: 0 }}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
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

          <FormControl fullWidth required>
            <InputLabel>Categoria</InputLabel>
            <Select
              value={form.categoryId}
              label="Categoria"
              onChange={e => setForm({ ...form, categoryId: e.target.value })}
            >
              {flatCategories.filter(c => c.isActive).map(cat => {
                const parent = cat.parentCategoryId
                  ? flatCategories.find(p => p.id === cat.parentCategoryId)
                  : null;
                return (
                  <MenuItem key={cat.id} value={cat.id}>
                    {parent ? `${parent.name} › ${cat.name}` : cat.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

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
            {!imageFile && !imagePreview && (
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
            disabled={isPending || uploading}
            startIcon={uploading ? <CircularProgress size={16} /> : undefined}
          >
            {uploading ? 'Enviando imagem...' : isPending ? 'Salvando...' : editId ? 'Salvar' : 'Criar Produto'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
