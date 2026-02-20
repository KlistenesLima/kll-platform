import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { useAuthStore } from '../store/useAuthStore';
import { orderApi } from '../services/api';
import type { Order } from '../types';

export default function Orders() {
  const { isLoggedIn, customerId } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const formatPrice = (p: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p);

  useEffect(() => {
    if (isLoggedIn && customerId) {
      setLoading(true);
      orderApi.getByCustomer(customerId)
        .then((res) => setOrders(res.data))
        .catch(() => setOrders([]))
        .finally(() => setLoading(false));
    }
  }, [isLoggedIn, customerId]);

  if (!isLoggedIn) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold mb-4">Faça login para ver seus pedidos</h2>
        <Link to="/login" className="btn-primary">Entrar</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Carregando pedidos...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-8">Meus Pedidos</h1>
        <EmptyState title="Nenhum pedido" description="Você ainda não fez nenhum pedido." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-8">Meus Pedidos</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm text-gray-500">Pedido </span>
                <span className="font-mono text-sm font-medium">{order.id.slice(0, 8)}</span>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString('pt-BR')} · {order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'item' : 'itens'}
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
