import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { orderApi } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { PackageIcon } from "../components/Icons";
import type { Order } from "../types";

const statusMap: Record<string, { label: string; bg: string; text: string }> = {
  Pending: { label: "Pendente", bg: "bg-yellow-500/15", text: "text-yellow-400" },
  Paid: { label: "Pago", bg: "bg-blue-500/15", text: "text-blue-400" },
  Processing: { label: "Processando", bg: "bg-purple-500/15", text: "text-purple-400" },
  Shipped: { label: "Enviado", bg: "bg-cyan-500/15", text: "text-cyan-400" },
  Delivered: { label: "Entregue", bg: "bg-green-500/15", text: "text-green-400" },
  Cancelled: { label: "Cancelado", bg: "bg-red-500/15", text: "text-red-400" },
};

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

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-12 h-12 border-[3px] border-gold/20 border-t-gold rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
      <h1 className="font-playfair text-3xl md:text-4xl text-white font-bold mb-2">
        Meus Pedidos
      </h1>
      <div className="w-16 h-0.5 bg-gold mb-8" />

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-gold/10">
          <PackageIcon size={64} color="rgba(201,169,98,0.15)" />
          <p className="text-xl text-text-secondary mt-6 mb-2 font-poppins">Nenhum pedido realizado</p>
          <p className="text-text-secondary/50 text-sm mb-6 font-poppins">Seus pedidos aparecerão aqui após a compra.</p>
          <Link
            to="/search"
            className="inline-block bg-gold text-dark px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider no-underline hover:bg-gold-light transition-colors duration-200 font-poppins"
          >
            Explorar Produtos
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const st = statusMap[order.status] || { label: order.status, bg: "bg-surface", text: "text-text-secondary" };
            return (
              <div
                key={order.id}
                className="bg-surface rounded-xl border border-gold/10 p-5 sm:p-6 hover:border-gold/25 transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-mono text-xs text-text-secondary/50">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wider ${st.bg} ${st.text}`}>
                        {st.label}
                      </span>
                    </div>
                    <p className="text-gold text-xl font-bold font-poppins">
                      {fmt(order.totalAmount)}
                    </p>
                    <p className="text-text-secondary text-sm mt-1 font-poppins">
                      {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit", month: "long", year: "numeric"
                      })}
                    </p>
                  </div>

                  {/* Items preview */}
                  <div className="flex flex-col gap-1 sm:text-right">
                    {order.items.slice(0, 2).map((item, i) => (
                      <span key={i} className="text-text-secondary text-sm font-poppins truncate max-w-[250px]">
                        {item.quantity}x {item.productName}
                      </span>
                    ))}
                    {order.items.length > 2 && (
                      <span className="text-text-secondary/50 text-xs font-poppins">
                        +{order.items.length - 2} {order.items.length - 2 === 1 ? "item" : "itens"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
