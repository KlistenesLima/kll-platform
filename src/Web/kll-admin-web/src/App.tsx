import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Shipments from './pages/Shipments';
import Transactions from './pages/Transactions';
import Merchants from './pages/Merchants';
import Categories from './pages/Categories';
import System from './pages/System';
import Portfolio from './pages/Portfolio';

export default function App() {
  return (
    <Routes>
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="orders" element={<Orders />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="merchants" element={<Merchants />} />
        <Route path="shipments" element={<Shipments />} />
        <Route path="system" element={<System />} />
      </Route>
    </Routes>
  );
}
