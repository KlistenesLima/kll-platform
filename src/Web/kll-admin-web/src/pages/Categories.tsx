import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Typography, Button, Card, CardContent, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Chip, Alert, IconButton,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { categoryApi } from '../services/api';
import type { Category } from '../types';

const initialForm = { name: '', description: '', imageUrl: '', parentCategoryId: '' };

export default function Categories() {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const queryClient = useQueryClient();

  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(false),
  });

  const flatCategories = (categories || []).reduce<Category[]>((acc, cat) => {
    acc.push(cat);
    if (cat.subCategories) {
      cat.subCategories.forEach(sub => acc.push(sub));
    }
    return acc;
  }, []);

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; imageUrl?: string; parentCategoryId?: string }) =>
      categoryApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); handleClose(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => categoryApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); handleClose(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    setForm(initialForm);
  };

  const handleEdit = (cat: Category) => {
    setEditId(cat.id);
    setForm({
      name: cat.name,
      description: cat.description || '',
      imageUrl: cat.imageUrl || '',
      parentCategoryId: cat.parentCategoryId || '',
    });
    setOpen(true);
  };

  const handleSubmit = () => {
    const payload = {
      name: form.name,
      description: form.description || undefined,
      imageUrl: form.imageUrl || undefined,
      parentCategoryId: form.parentCategoryId || undefined,
    };

    if (editId) {
      const existing = categories?.find(c => c.id === editId);
      updateMutation.mutate({
        id: editId,
        data: { ...payload, displayOrder: existing?.displayOrder || 0 },
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja desativar esta categoria?')) {
      deleteMutation.mutate(id);
    }
  };

  // Categories available as parent (exclude self and own children when editing)
  const availableParents = flatCategories.filter(c => {
    if (!editId) return true;
    if (c.id === editId) return false;
    if (c.parentCategoryId === editId) return false;
    return true;
  });

  const getParentName = (parentId?: string) => {
    if (!parentId) return '—';
    const parent = flatCategories.find(c => c.id === parentId);
    return parent?.name || '—';
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nome', flex: 1, minWidth: 200 },
    { field: 'parentCategoryId', headerName: 'Categoria Pai', width: 180,
      renderCell: (p) => {
        const name = getParentName(p.value);
        return name !== '—'
          ? <Chip label={name} size="small" variant="outlined" />
          : <Typography variant="body2" color="text.secondary">—</Typography>;
      }
    },
    { field: 'slug', headerName: 'Slug', flex: 1, minWidth: 150 },
    { field: 'displayOrder', headerName: 'Ordem', width: 80, type: 'number' },
    { field: 'isActive', headerName: 'Status', width: 100,
      renderCell: (p) => <Chip label={p.value ? 'Ativa' : 'Inativa'} size="small" color={p.value ? 'success' : 'default'} /> },
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>Categorias</Typography>
          <Typography variant="body2" color="text.secondary">Gerenciamento de categorias</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}
          sx={{ alignSelf: { xs: 'flex-start', sm: 'auto' } }}>
          Nova Categoria
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>Erro ao carregar categorias.</Alert>}

      <Card>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <DataGrid
            rows={flatCategories}
            columns={columns}
            loading={isLoading}
            autoHeight
            pageSizeOptions={[10, 25]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
            sx={{ border: 'none', '& .MuiDataGrid-cell': { borderColor: 'rgba(255,255,255,0.06)' }, '& .MuiDataGrid-virtualScroller': { overflowX: 'auto' }, minWidth: 0 }}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth required />
          <TextField label="Descrição" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} fullWidth multiline rows={2} />

          <FormControl fullWidth>
            <InputLabel>Categoria Pai</InputLabel>
            <Select
              value={form.parentCategoryId}
              label="Categoria Pai"
              onChange={e => setForm({ ...form, parentCategoryId: e.target.value })}
            >
              <MenuItem value="">
                <em>Nenhuma (categoria raiz)</em>
              </MenuItem>
              {availableParents.filter(c => c.isActive).map(cat => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField label="URL da Imagem" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} fullWidth />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Salvando...' : editId ? 'Salvar' : 'Criar Categoria'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
