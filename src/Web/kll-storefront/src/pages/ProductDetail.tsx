import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productApi } from "../services/api";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import type { Product } from "../types";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const nav = useNavigate();

  useEffect(() => {
    if (id) productApi.getById(id).then(setProduct).finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    if (!isAuthenticated) { nav("/login"); return; }
    if (!product) return;
    try {
      await addItem(product.id, quantity);
      toast.success(`${product.name} adicionado!`, { style: { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(201,169,98,0.3)" } });
    } catch { toast.error("Erro ao adicionar"); }
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}>
      <div style={{ width: 48, height: 48, border: "3px solid rgba(201,169,98,0.2)", borderTopColor: "#c9a962", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!product) return <div style={{ textAlign: "center", padding: "5rem 0", color: "#6c6c7e" }}>Produto nao encontrado</div>;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <div style={{ background: "#1a1a2e", border: "1px solid rgba(201,169,98,0.2)", borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {/* Image */}
          <div style={{ background: "#252542", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 500, position: "relative" }}>
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} style={{ maxWidth: "100%", maxHeight: 500, objectFit: "contain" }} />
            ) : (
              <div style={{ fontSize: "8rem", color: "#3a3a4e", opacity: 0.3 }}>âœ¦</div>
            )}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(201,169,98,0.08) 0%, transparent 50%)", pointerEvents: "none" }} />
          </div>

          {/* Info */}
          <div style={{ padding: "3rem" }}>
            <span style={{
              display: "inline-block", padding: "4px 12px", fontSize: "0.75rem", fontWeight: 600,
              textTransform: "uppercase", letterSpacing: 1, color: "#c9a962",
              background: "rgba(201,169,98,0.15)", borderRadius: 4, marginBottom: "1rem"
            }}>{product.category}</span>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.25rem", fontWeight: 700, color: "#fff", marginBottom: "1rem", lineHeight: 1.3 }}>{product.name}</h1>
            <p style={{ color: "#b8b8c7", lineHeight: 1.8, marginBottom: "2rem" }}>{product.description}</p>

            <div style={{ marginBottom: "2rem" }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", fontWeight: 700, color: "#c9a962" }}>{fmt(product.price)}</p>
              <p style={{ color: "#4caf50", fontSize: "0.85rem", marginTop: "0.25rem" }}>Frete gratis â€¢ Entrega em ate 5 dias uteis</p>
            </div>

            {/* Quantity */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
              <span style={{ fontSize: "0.9rem", color: "#b8b8c7" }}>Quantidade:</span>
              <div style={{ display: "flex", alignItems: "center", border: "2px solid rgba(201,169,98,0.2)", borderRadius: 8 }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{
                  padding: "0.5rem 1rem", background: "none", border: "none", color: "#fff", fontSize: "1.1rem", cursor: "pointer"
                }}>âˆ’</button>
                <span style={{ padding: "0.5rem 1.25rem", fontWeight: 600, color: "#fff" }}>{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))} style={{
                  padding: "0.5rem 1rem", background: "none", border: "none", color: "#fff", fontSize: "1.1rem", cursor: "pointer"
                }}>+</button>
              </div>
              <span style={{ fontSize: "0.8rem", color: "#6c6c7e" }}>({product.stockQuantity} disponiveis)</span>
            </div>

            <button onClick={handleAdd} style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
              padding: "1.25rem", fontFamily: "'Poppins', sans-serif", fontSize: "1rem",
              fontWeight: 600, textTransform: "uppercase", letterSpacing: 1,
              color: "#1a1a2e", background: "linear-gradient(135deg, #c9a962 0%, #a68b4b 100%)",
              border: "none", borderRadius: 12, cursor: "pointer",
              boxShadow: "0 0 20px rgba(201,169,98,0.3)", transition: "all 0.3s"
            }}>ðŸ›’ Adicionar ao Carrinho</button>
          </div>
        </div>
      </div>
    </div>
  );
}