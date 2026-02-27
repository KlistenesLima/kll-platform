import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, IconButton, Divider, Avatar,
  Badge, Breadcrumbs, Menu, MenuItem, ListSubheader,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import CategoryIcon from '@mui/icons-material/Category';
import StoreIcon from '@mui/icons-material/Store';
import PeopleIcon from '@mui/icons-material/People';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useAuth } from '../components/AuthProvider';

const DRAWER_WIDTH = 260;

const pageLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  products: 'Produtos',
  categories: 'Categorias',
  orders: 'Pedidos',
  shipments: 'Entregas',
  transactions: 'Transações',
  merchants: 'Merchants',
  users: 'Usuários',
  system: 'Sistema',
};

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

const mainNav: NavItem[] = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Pedidos', icon: <ShoppingCartIcon />, path: '/orders' },
  { label: 'Produtos', icon: <InventoryIcon />, path: '/products' },
  { label: 'Categorias', icon: <CategoryIcon />, path: '/categories' },
  { label: 'Usuários', icon: <PeopleIcon />, path: '/users' },
];

const financeNav: NavItem[] = [
  { label: 'Transações', icon: <PaymentIcon />, path: '/transactions' },
  { label: 'Merchants', icon: <StoreIcon />, path: '/merchants' },
];

const operationsNav: NavItem[] = [
  { label: 'Entregas', icon: <LocalShippingIcon />, path: '/shipments' },
];

const infraNav: NavItem[] = [
  { label: 'Sistema', icon: <MonitorHeartIcon />, path: '/system' },
];

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { username, roles, logout } = useAuth();
  const isAdmin = roles.includes('admin') || roles.includes('Administrador');

  const currentPage = location.pathname.replace('/', '') || 'dashboard';
  const currentLabel = pageLabels[currentPage] || currentPage;

  const renderNavItem = (item: NavItem) => {
    const isActive = location.pathname === item.path;
    return (
      <ListItemButton
        key={item.path}
        onClick={() => { navigate(item.path); setMobileOpen(false); }}
        selected={isActive}
        sx={{
          borderRadius: 2,
          mb: 0.3,
          py: 1,
          pl: 2,
          position: 'relative',
          '&.Mui-selected': {
            bgcolor: 'rgba(201,169,98,0.12)',
            borderLeft: '3px solid #c9a962',
            pl: 1.625,
            '& .MuiListItemIcon-root': { color: '#c9a962' },
            '& .MuiListItemText-primary': { color: '#c9a962', fontWeight: 600 },
          },
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.04)',
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 38, color: 'text.secondary' }}>
          {item.badge ? (
            <Badge badgeContent={item.badge} color="warning" sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 16, height: 16 } }}>
              {item.icon}
            </Badge>
          ) : item.icon}
        </ListItemIcon>
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{ fontSize: 14 }}
        />
      </ListItemButton>
    );
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0c1222' }}>
      {/* Brand */}
      <Box sx={{ px: 3, pt: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 22, color: '#c9a962', letterSpacing: 1 }}>
            AUREA
          </Typography>
          <Typography sx={{ fontWeight: 300, fontSize: 18, color: '#fff', letterSpacing: 0.5 }}>
            Maison
          </Typography>
        </Box>
        <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', mt: 0.3, letterSpacing: 0.5 }}>
          Painel Administrativo
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2 }} />

      {/* Main Navigation */}
      <List sx={{ px: 1.5, pt: 1.5 }}>
        {mainNav.filter(item => item.path !== '/users' || isAdmin).map(renderNavItem)}
      </List>

      {/* Finance Section */}
      <List
        sx={{ px: 1.5, pt: 0.5 }}
        subheader={
          <ListSubheader
            sx={{
              bgcolor: 'transparent',
              color: 'rgba(255,255,255,0.3)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              lineHeight: '32px',
              pl: 2,
            }}
          >
            Financeiro
          </ListSubheader>
        }
      >
        {financeNav.map(renderNavItem)}
      </List>

      {/* Operations Section */}
      <List
        sx={{ px: 1.5, pt: 0.5 }}
        subheader={
          <ListSubheader
            sx={{
              bgcolor: 'transparent',
              color: 'rgba(255,255,255,0.3)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              lineHeight: '32px',
              pl: 2,
            }}
          >
            Operações
          </ListSubheader>
        }
      >
        {operationsNav.map(renderNavItem)}
      </List>

      {/* Infrastructure Section */}
      <List
        sx={{ px: 1.5, pt: 0.5 }}
        subheader={
          <ListSubheader
            sx={{
              bgcolor: 'transparent',
              color: 'rgba(255,255,255,0.3)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              lineHeight: '32px',
              pl: 2,
            }}
          >
            Infraestrutura
          </ListSubheader>
        }
      >
        {infraNav.map(renderNavItem)}
      </List>

      {/* Footer */}
      <Box sx={{ mt: 'auto', p: 2, pt: 1 }}>
        <Divider sx={{ mb: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />
        <Typography sx={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
          v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar
        position="fixed"
        sx={{
          top: '36px',
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.default',
          backgroundImage: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          boxShadow: 'none',
          height: 64,
        }}
      >
        <Toolbar sx={{ height: 64, minHeight: '64px !important' }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Breadcrumb */}
          <Breadcrumbs
            separator={<NavigateNextIcon sx={{ fontSize: 16, color: 'text.disabled' }} />}
            sx={{ '& .MuiBreadcrumbs-li': { fontSize: 14 } }}
          >
            <Typography
              variant="body2"
              sx={{ color: 'text.disabled', cursor: 'pointer', '&:hover': { color: 'text.secondary' } }}
              onClick={() => navigate('/dashboard')}
            >
              AUREA Maison
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
              {currentLabel}
            </Typography>
          </Breadcrumbs>

          <Box sx={{ flexGrow: 1 }} />

          {/* Right side */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" color="inherit" sx={{ color: 'text.secondary' }}>
              <NotificationsNoneIcon fontSize="small" />
            </IconButton>

            <Box
              sx={{
                display: 'flex', alignItems: 'center', gap: 1, ml: 1,
                cursor: 'pointer', borderRadius: 2, px: 1, py: 0.5,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
              }}
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <Avatar sx={{ width: 30, height: 30, bgcolor: '#c9a962', fontSize: 13, fontWeight: 600 }}>
                {username.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body2" sx={{ fontSize: 13, color: 'text.secondary' }}>
                {username}
              </Typography>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={!!anchorEl}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              slotProps={{ paper: { sx: { mt: 1, minWidth: 160 } } }}
            >
              <MenuItem onClick={() => setAnchorEl(null)}>
                <ListItemIcon><PersonOutlineIcon fontSize="small" /></ListItemIcon>
                Perfil
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { setAnchorEl(null); logout(); }}>
                <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                Sair
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, bgcolor: '#0c1222', borderRight: 'none', top: '36px', height: 'calc(100vh - 36px)' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              bgcolor: '#0c1222',
              borderRight: '1px solid rgba(255,255,255,0.06)',
              top: '36px',
              height: 'calc(100vh - 36px)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '100px',
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 100px)',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
