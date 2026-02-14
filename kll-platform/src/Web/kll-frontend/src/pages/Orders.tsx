import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { useAuthStore } from '../store/useAuthStore';

const mockOrders = [
  { id: 'abc-123-def', status: 'Shipped', totalAmount: 6499.90, trackingCode: 'KLL20250213A1B2C3D4', createdAt: '2025-02-13T10:30:00Z', itemCount: 1 },
  { id: 'ghi-456-jkl', status: 'Paid', totalAmount: 1299.80, trackingCode: null, createdAt: '2025-02-12T15:45:00Z', itemCount: 3 },
  { id: 'mno-789-pqr', status: 'Delivered', totalAmount: 549.90, trackingCode: 'KLL20250210E5F6G7H8', createdAt: '2025-02-10T09:00:00Z', itemCount: 1 },
];

export default function Orders() {
  const { isLoggedIn } = useAuthStore();
  const formatPrice = (p: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p);

  if (!isLoggedIn) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold mb-4">Faça login para ver seus pedidos</h2>
        <Link to="/login" className="btn-primary">Entrar</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-8">Meus Pedidos</h1>

      <div className="space-y-4">
        {mockOrders.map((order) => (
          <div key={order.id} className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm text-gray-500">Pedido </span>
                <span className="font-mono text-sm font-medium">{order.id}</span>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString('pt-BR')} · {order.itemCount} {order.itemCount === 1 ? 'item' : 'itens'}
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold">{formatPrice(order.totalAmount)}</span>
                {order.trackingCode && (
                  <Link to={`/tracking?code=${order.trackingCode}`} className="text-sm text-primary-600 hover:underline">
                    Rastrear
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}