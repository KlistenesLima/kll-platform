import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import ShippingCalculator from "../components/ShippingCalculator";
import toast from "react-hot-toast";

export default function CartPage() {
  const { items, total, itemCount, fetchCart, updateItem, removeItem, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) { nav("/login"); return; }
    fetchCart().finally(() => setLoading(false));
  }, [isAuthenticated]);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleUpdate = async (productId: string, qty: number) => {
    try { await updateItem(productId, qty); await fetchCart(); } catch { toast.error("Erro"); }
  };

  const handleRemove = async (productId: string) => {
    try { await removeItem(productId); await fetchCart(); toast.success("Removido"); } catch {}
  };

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}><div style={{ width: 48, height: 48, border: "3px solid rgba(201,169,98,0.2)", borderTopColor: "#c9a962", borderRadius: "50%", animation: "spin 1s linear infinite" }} /><style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style></div>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.25rem", marginBottom: "2rem" }}>
        Carrinho <span style={{ color: "#6c6c7e", fontSize: "1rem", fontFamily: "'Poppins', sans-serif" }}>({itemCount} itens)</span>
      </h1>

      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", background: "#1a1a2e", borderRadius: 20, border: "1px solid rgba(201,169,98,0.2)" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem", opacity: 0.3 }}>ðŸ›’</div>
          <p style={{ color: "#6c6c7e", fontSize: "1.1rem", marginBottom: "2rem" }}>Seu carrinho esta vazio</p>
          <Link to="/search" style={{
            display: "inline-block", padding: "1rem 2.5rem", background: "linear-gradient(135deg, #c9a962, #a68b4b)",
            color: "#1a1a2e", borderRadius: 8, fontWeight: 600, textDecoration: "none",
            textTransform: "uppercase", letterSpacing: 1
          }}>Explorar Produtos</Link>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {items.map((item) => (
              <div key={item.productId} style={{
                display: "flex", alignItems: "center", gap: "1.5rem", padding: "1.25rem",
                background: "#1a1a2e", border: "1px solid rgba(201,169,98,0.2)", borderRadius: 12
              }}>
                <div style={{ width: 80, height: 80, background: "#252542", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {item.imageUrl ? <img src={item.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} /> : <span style={{ fontSize: "2rem", color: "#3a3a4e" }}>âœ¦</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontWeight: 600, color: "#fff" }}>{item.productName}</h3>
                  <p style={{ color: "#c9a962", fontWeight: 600, fontSize: "0.95rem" }}>{fmt(item.unitPrice)}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", border: "2px solid rgba(201,169,98,0.2)", borderRadius: 8 }}>
                  <button onClick={() => handleUpdate(item.productId, item.quantity - 1)} style={{ padding: "0.4rem 0.8rem", background: "none", border: "none", color: "#fff", cursor: "pointer" }}>âˆ’</button>
                  <span style={{ padding: "0.4rem 0.75rem", fontWeight: 600, color: "#fff", fontSize: "0.9rem" }}>{item.quantity}</span>
                  <button onClick={() => handleUpdate(item.productId, item.quantity + 1)} style={{ padding: "0.4rem 0.8rem", background: "none", border: "none", color: "#fff", cursor: "pointer" }}>+</button>
                </div>
                <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "#c9a962", width: 100, textAlign: "right", fontSize: "1.1rem" }}>{fmt(item.total)}</p>
                <button onClick={() => handleRemove(item.productId)} style={{
                  background: "none", border: "none", color: "#f44336", cursor: "pointer", fontSize: "1.1rem", padding: "0.5rem"
                }}>âœ•</button>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: "2rem", padding: "2rem", background: "#1a1a2e",
            border: "1px solid rgba(201,169,98,0.2)", borderRadius: 16
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "1.1rem", color: "#b8b8c7" }}>Total:</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700, color: "#c9a962" }}>{fmt(total)}</span>
            </div>
            <ShippingCalculator cartTotal={total} />

            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button onClick={() => { clearCart(); toast.success("Carrinho limpo"); }} style={{
                padding: "1rem 1.5rem", background: "transparent", border: "2px solid rgba(201,169,98,0.2)",
                borderRadius: 8, color: "#b8b8c7", cursor: "pointer", fontFamily: "'Poppins', sans-serif"
              }}>Limpar</button>
              <Link to="/checkout" style={{
                flex: 1, textAlign: "center", padding: "1rem", borderRadius: 8,
                background: "linear-gradient(135deg, #c9a962, #a68b4b)", color: "#1a1a2e",
                fontWeight: 600, textDecoration: "none", textTransform: "uppercase", letterSpacing: 1,
                fontFamily: "'Poppins', sans-serif"
              }}>Finalizar Compra</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}