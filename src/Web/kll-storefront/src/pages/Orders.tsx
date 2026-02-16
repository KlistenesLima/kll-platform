import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { orderApi } from "../services/api";
import { useAuthStore } from "../store/authStore";
import type { Order } from "../types";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();
  const nav = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) { nav("/login"); return; }
    orderApi.getMine().then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, [isAuthenticated]);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const statusColor: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-800", Confirmed: "bg-blue-100 text-blue-800",
    Shipped: "bg-purple-100 text-purple-800", Delivered: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kll-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Meus Pedidos</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow">
          <p className="text-6xl mb-4">ðŸ“¦</p>
          <p className="text-xl text-gray-500 mb-4">Nenhum pedido realizado</p>
          <Link to="/" className="inline-block bg-kll-600 text-white px-6 py-3 rounded-lg font-semibold">Ir as Compras</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} to={`/order/${order.id}`}
              className="block bg-white rounded-xl shadow p-5 hover:shadow-lg transition">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-mono text-sm text-gray-400">#{order.id.slice(0, 8)}</p>
                  <p className="font-bold text-lg">{fmt(order.totalAmount)}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString("pt-BR")}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[order.status] || "bg-gray-100"}`}>
                  {order.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
