import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { orderApi } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { PackageIcon } from "../components/Icons";
import type { Order, Shipment, TrackingEvent } from "../types";

const statusMap: Record<string, { label: string; bg: string; text: string; border: string }> = {
  Pending: { label: "Pendente", bg: "bg-yellow-500/10", text: "text-yellow-500", border: "border-yellow-500/20" },
  Paid: { label: "Pago", bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
  Processing: { label: "Processando", bg: "bg-blue-400/10", text: "text-blue-400", border: "border-blue-400/20" },
  Shipped: { label: "Enviado", bg: "bg-[#c9a962]/10", text: "text-[#c9a962]", border: "border-[#c9a962]/20" },
  Delivered: { label: "Entregue", bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/20" },
  Cancelled: { label: "Cancelado", bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20" },
};

const shipmentStatusLabel: Record<string, string> = {
  Created: "Criado",
  Processing: "Processando",
  InTransit: "Em Trânsito",
  OutForDelivery: "Saiu para Entrega",
  Delivered: "Entregue",
  Returned: "Devolvido",
};

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (d: string) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
const fmtDateTime = (d: string) => new Date(d).toLocaleString("pt-BR", {
  day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
});

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingData, setTrackingData] = useState<Record<string, Shipment>>({});
  const [trackingModal, setTrackingModal] = useState<Shipment | null>(null);
  const { isAuthenticated } = useAuthStore();
  const nav = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) { nav("/login"); return; }
    orderApi.getMine()
      .then((data: Order[]) => {
        const sorted = (Array.isArray(data) ? data : []).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sorted);
        // Fetch tracking for shipped/delivered orders
        sorted.forEach(order => {
          if (order.status === "Shipped" || order.status === "Delivered") {
            orderApi.getOrderTracking(order.id)
              .then((ship: Shipment) => {
                setTrackingData(prev => ({ ...prev, [order.id]: ship }));
              })
              .catch(() => {});
          }
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-12 h-12 border-[3px] border-gold/20 border-t-gold rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8 lg:py-12 animate-[fadeInUp_0.5s_ease-out]">
      <h1 className="font-playfair text-3xl md:text-4xl text-white font-bold mb-2">
        Meus Pedidos
      </h1>
      <div className="w-16 h-0.5 bg-gold mb-8" />

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-surface/50 rounded-2xl border border-gold/[0.08]">
          <PackageIcon size={64} color="rgba(201,169,98,0.15)" />
          <p className="text-xl text-text-secondary mt-6 mb-2 font-poppins">
            Você ainda não fez nenhum pedido
          </p>
          <p className="text-text-secondary/50 text-sm mb-6 font-poppins">
            Seus pedidos aparecerão aqui após a compra.
          </p>
          <Link
            to="/search"
            className="inline-block bg-gold text-dark px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider no-underline hover:bg-gold-light transition-colors duration-200 font-poppins"
          >
            Explorar Coleção
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const st = statusMap[order.status] || { label: order.status, bg: "bg-surface", text: "text-text-secondary", border: "border-gold/10" };
            const shipment = trackingData[order.id];
            const isShipped = order.status === "Shipped" || order.status === "Delivered";

            return (
              <div
                key={order.id}
                className="bg-surface/50 rounded-2xl border border-gold/[0.08] hover:border-gold/20 transition-all duration-300 overflow-hidden"
              >
                {/* Header */}
                <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-playfair text-lg text-white font-semibold">
                      Pedido #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wider border ${st.bg} ${st.text} ${st.border}`}>
                      {st.label}
                    </span>
                  </div>
                  <span className="font-poppins text-gold text-xl font-bold">
                    {fmt(order.totalAmount)}
                  </span>
                </div>

                {/* Body */}
                <div className="px-5 sm:px-6 pb-4">
                  <p className="text-text-secondary text-sm font-poppins mb-1">
                    Realizado em {fmtDateTime(order.createdAt)}
                  </p>
                  <p className="text-text-secondary/70 text-sm font-poppins">
                    {order.items.map((item, i) => (
                      <span key={i}>
                        {item.productName} x{item.quantity}
                        {i < order.items.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </p>
                </div>

                {/* Tracking Section */}
                {isShipped && shipment && (
                  <div className="border-t border-gold/[0.08] px-5 sm:px-6 py-4 bg-white/[0.02]">
                    <div className="flex items-center gap-2 mb-3">
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                        <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                      </svg>
                      <span className="text-[#c9a962] text-sm font-semibold font-poppins uppercase tracking-wider">
                        Rastreamento
                      </span>
                    </div>

                    <p className="text-text-secondary text-xs font-poppins mb-3">
                      Código de rastreio:{" "}
                      <span className="font-mono text-white bg-white/5 px-2 py-0.5 rounded">
                        {shipment.trackingCode}
                      </span>
                    </p>

                    {/* Mini timeline - last 3 events */}
                    {shipment.trackingEvents.length > 0 && (
                      <div className="pl-3 border-l-2 border-gold/20 space-y-2 mb-3">
                        {[...shipment.trackingEvents].reverse().slice(0, 3).map((ev: TrackingEvent, i: number) => (
                          <div key={i} className="relative">
                            <div
                              className="absolute -left-[17px] top-1 w-2 h-2 rounded-full"
                              style={{ backgroundColor: i === 0 ? "#c9a962" : "#555" }}
                            />
                            <p className={`text-sm font-poppins ${i === 0 ? "text-white font-medium" : "text-text-secondary"}`}>
                              {ev.description}
                            </p>
                            <p className="text-xs text-text-secondary/60 font-poppins">
                              {ev.location} · {fmtDateTime(ev.timestamp)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => setTrackingModal(shipment)}
                      className="text-[#c9a962] text-sm font-medium font-poppins bg-transparent border border-gold/20 px-4 py-2 rounded-lg cursor-pointer hover:bg-gold/10 transition-colors duration-200"
                    >
                      Ver rastreamento completo
                    </button>
                  </div>
                )}

                {isShipped && !shipment && (
                  <div className="border-t border-gold/[0.08] px-5 sm:px-6 py-3 bg-white/[0.02]">
                    <div className="w-5 h-5 border-2 border-gold/20 border-t-gold rounded-full animate-spin inline-block mr-2 align-middle" />
                    <span className="text-text-secondary text-sm font-poppins">Carregando rastreamento...</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tracking Modal */}
      {trackingModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setTrackingModal(null)}
        >
          <div
            className="bg-[#1a1a2e] border border-gold/15 rounded-2xl max-w-[600px] w-full max-h-[85vh] overflow-y-auto shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gold/10">
              <div>
                <h2 className="font-playfair text-xl text-white font-bold mb-1">Rastreamento</h2>
                <p className="font-mono text-sm text-text-secondary">{trackingModal.trackingCode}</p>
              </div>
              <button
                onClick={() => setTrackingModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-text-secondary hover:text-white hover:bg-white/10 border-none cursor-pointer transition-colors duration-200"
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5">
              {/* Status */}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-white text-lg font-semibold font-poppins">Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  trackingModal.status === "Delivered"
                    ? "bg-green-500/10 text-green-500 border border-green-500/20"
                    : trackingModal.status === "InTransit"
                    ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                    : trackingModal.status === "OutForDelivery"
                    ? "bg-[#c9a962]/10 text-[#c9a962] border border-[#c9a962]/20"
                    : "bg-white/5 text-text-secondary border border-white/10"
                }`}>
                  {shipmentStatusLabel[trackingModal.status] || trackingModal.status}
                </span>
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-4 mb-6 bg-white/[0.02] rounded-xl p-4 border border-gold/[0.06]">
                <div>
                  <p className="text-text-secondary/60 text-xs font-poppins uppercase tracking-wider mb-1">Destino</p>
                  <p className="text-white text-sm font-poppins">{trackingModal.destinationCity}</p>
                </div>
                <div>
                  <p className="text-text-secondary/60 text-xs font-poppins uppercase tracking-wider mb-1">Destinatário</p>
                  <p className="text-white text-sm font-poppins">{trackingModal.recipientName}</p>
                </div>
                <div>
                  <p className="text-text-secondary/60 text-xs font-poppins uppercase tracking-wider mb-1">Previsão de Entrega</p>
                  <p className="text-white text-sm font-poppins">
                    {trackingModal.estimatedDelivery ? fmtDate(trackingModal.estimatedDelivery) : "Calculando..."}
                  </p>
                </div>
                {trackingModal.deliveredAt && (
                  <div>
                    <p className="text-text-secondary/60 text-xs font-poppins uppercase tracking-wider mb-1">Entregue em</p>
                    <p className="text-green-400 text-sm font-poppins font-semibold">
                      {fmtDate(trackingModal.deliveredAt)}
                    </p>
                  </div>
                )}
              </div>

              {/* Full Timeline */}
              <h3 className="text-white text-sm font-semibold font-poppins uppercase tracking-wider mb-4">
                Histórico de Eventos
              </h3>
              <div className="relative pl-6">
                {/* Vertical line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-gold/40 via-gold/20 to-gold/5" />

                {[...trackingModal.trackingEvents].reverse().map((ev: TrackingEvent, i: number) => {
                  const isLatest = i === 0;
                  return (
                    <div key={i} className="relative pb-5 last:pb-0">
                      {/* Dot */}
                      <div
                        className="absolute -left-[17px] top-1.5 w-4 h-4 rounded-full border-2 border-[#1a1a2e]"
                        style={{
                          backgroundColor: isLatest ? "#c9a962" : "#444",
                          boxShadow: isLatest ? "0 0 8px rgba(201,169,98,0.4)" : "none",
                        }}
                      />
                      <div className={`${isLatest ? "bg-gold/5 border border-gold/10" : ""} rounded-lg ${isLatest ? "p-3" : "py-1"}`}>
                        <p className={`text-sm font-poppins ${isLatest ? "text-white font-semibold" : "text-text-secondary"}`}>
                          {ev.description}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-text-secondary/60 font-poppins flex items-center gap-1">
                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                            </svg>
                            {ev.location}
                          </span>
                          <span className="text-xs text-text-secondary/60 font-poppins flex items-center gap-1">
                            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                            </svg>
                            {fmtDateTime(ev.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {trackingModal.trackingEvents.length === 0 && (
                  <p className="text-text-secondary text-sm font-poppins">Nenhum evento registrado.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
