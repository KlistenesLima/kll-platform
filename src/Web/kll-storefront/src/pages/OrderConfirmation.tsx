import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { orderApi } from "../services/api";

interface OrderData {
  id: string; status: string; totalAmount: number; trackingCode?: string;
  createdAt: string; items: { productName: string; quantity: number; unitPrice: number; }[];
}

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = location.state as { confirmed?: boolean; total?: number; shipping?: { name: string; deliveryDays: string } } | null;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [showConfetti, setShowConfetti] = useState(!!state?.confirmed);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  useEffect(() => {
    if (id) orderApi.getById(id).then(setOrder).catch(() => {});
    if (showConfetti) { const t = setTimeout(() => setShowConfetti(false), 4000); return () => clearTimeout(t); }
  }, [id]);

  return (
    <div style={{ minHeight: "80vh", background: "#0f0f1a", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem", position: "relative", overflow: "hidden" }}>
      {/* Confetti */}
      {showConfetti && (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10 }}>
          <style>{`
            @keyframes confettiFall { 0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
            .confetti { position: absolute; width: 8px; height: 8px; animation: confettiFall 3s ease-out forwards; }
          `}</style>
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i} className="confetti" style={{
              left: `${Math.random() * 100}%`, top: `${-Math.random() * 20}%`,
              background: ["#c9a962", "#ffd700", "#ff6b6b", "#4caf50", "#42a5f5", "#ab47bc"][i % 6],
              borderRadius: i % 3 === 0 ? "50%" : i % 3 === 1 ? "0" : "2px",
              width: `${6 + Math.random() * 6}px`, height: `${6 + Math.random() * 6}px`,
              animationDelay: `${Math.random() * 1.5}s`, animationDuration: `${2.5 + Math.random() * 2}s`,
            }} />
          ))}
        </div>
      )}

      <div style={{ maxWidth: 560, width: "100%", textAlign: "center", position: "relative", zIndex: 20 }}>
        {/* Check icon */}
        <div style={{
          width: 80, height: 80, borderRadius: "50%", margin: "0 auto 1.5rem",
          background: "linear-gradient(135deg, rgba(76,175,80,0.2), rgba(76,175,80,0.05))",
          border: "2px solid rgba(76,175,80,0.4)", display: "flex", alignItems: "center", justifyContent: "center",
          animation: "scaleIn 0.5s ease-out"
        }}>
          <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
        </div>
        <style>{`@keyframes scaleIn { 0% { transform: scale(0); } 100% { transform: scale(1); } }`}</style>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem" }}>
          Pedido Confirmado!
        </h1>
        <p style={{ color: "#9898ab", fontSize: "1rem", marginBottom: "2rem" }}>
          Seu pedido <span style={{ color: "#c9a962", fontWeight: 600 }}>#{id?.slice(0, 8).toUpperCase()}</span> foi recebido com sucesso
        </p>

        {/* Order Details Card */}
        <div style={{
          background: "#1a1a2e", borderRadius: 16, padding: "1.5rem",
          border: "1px solid rgba(201,169,98,0.15)", textAlign: "left", marginBottom: "1.5rem"
        }}>
          {order && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
                <div>
                  <p style={{ fontSize: "0.75rem", color: "#6c6c7e", textTransform: "uppercase", letterSpacing: 0.5 }}>Total</p>
                  <p style={{ fontSize: "1.2rem", fontWeight: 700, color: "#c9a962", fontFamily: "'Playfair Display', serif" }}>
                    {fmt(state?.total ?? order.totalAmount)}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: "0.75rem", color: "#6c6c7e", textTransform: "uppercase", letterSpacing: 0.5 }}>Status</p>
                  <span style={{
                    display: "inline-block", padding: "4px 12px", borderRadius: 20,
                    background: "rgba(76,175,80,0.15)", color: "#4caf50", fontSize: "0.8rem", fontWeight: 600
                  }}>Confirmado</span>
                </div>
              </div>

              {state?.shipping && (
                <div style={{ marginBottom: "1.25rem", padding: "0.75rem", background: "rgba(201,169,98,0.05)", borderRadius: 8 }}>
                  <p style={{ fontSize: "0.75rem", color: "#6c6c7e", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Metodo de Envio</p>
                  <p style={{ fontSize: "0.9rem", color: "#e0e0e0", fontWeight: 500 }}>{state.shipping.name}</p>
                  <p style={{ fontSize: "0.8rem", color: "#9898ab" }}>Previsao: {state.shipping.deliveryDays}</p>
                </div>
              )}

              {order.trackingCode && (
                <div style={{ padding: "0.75rem", background: "rgba(201,169,98,0.05)", borderRadius: 8, marginBottom: "1.25rem" }}>
                  <p style={{ fontSize: "0.75rem", color: "#6c6c7e", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Codigo de Rastreamento</p>
                  <p style={{ fontSize: "1rem", color: "#c9a962", fontWeight: 600, fontFamily: "monospace" }}>{order.trackingCode}</p>
                </div>
              )}

              <div style={{ fontSize: "0.8rem", color: "#6c6c7e" }}>
                Data do pedido: {new Date(order.createdAt).toLocaleDateString("pt-BR")}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link to="/orders" style={{
            flex: 1, textAlign: "center", padding: "0.9rem", borderRadius: 10,
            border: "2px solid rgba(201,169,98,0.3)", background: "transparent",
            color: "#c9a962", fontWeight: 600, textDecoration: "none", fontSize: "0.9rem",
            fontFamily: "'Poppins', sans-serif", transition: "all 0.2s"
          }}>Ver Meus Pedidos</Link>
          <Link to="/search" style={{
            flex: 1, textAlign: "center", padding: "0.9rem", borderRadius: 10,
            background: "linear-gradient(135deg,#c9a962,#a68b4b)", color: "#0f0f1a",
            fontWeight: 600, textDecoration: "none", fontSize: "0.9rem",
            fontFamily: "'Poppins', sans-serif", textTransform: "uppercase", letterSpacing: 1
          }}>Continuar Comprando</Link>
        </div>
      </div>
    </div>
  );
}
