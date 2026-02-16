import { Link, useNavigate } from "react-router-dom";
import type { Product } from "../types";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { useState } from "react";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const nav = useNavigate();
  const [hovered, setHovered] = useState(false);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { nav("/login"); return; }
    try {
      await addItem(product.id);
      toast.success(`${product.name} adicionado!`, { style: { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(201,169,98,0.3)" } });
    } catch { toast.error("Erro ao adicionar"); }
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <Link to={`/product/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{
        display: "flex", flexDirection: "column", background: "#1a1a2e",
        border: `1px solid ${hovered ? "#c9a962" : "rgba(201,169,98,0.2)"}`,
        borderRadius: 12, overflow: "hidden",
        transition: "all 0.3s ease",
        transform: hovered ? "translateY(-8px)" : "none",
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.5)" : "none"
      }}>
        {/* Image */}
        <div style={{ position: "relative", aspectRatio: "1", overflow: "hidden", background: "#252542" }}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} style={{
              width: "100%", height: "100%", objectFit: "cover",
              transition: "transform 0.5s ease",
              transform: hovered ? "scale(1.1)" : "scale(1)"
            }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", color: "#252542" }}>âœ¦</div>
          )}

          {/* Quick Add */}
          <div style={{
            position: "absolute", top: 12, right: 12, display: "flex", flexDirection: "column", gap: 8,
            opacity: hovered ? 1 : 0, transform: hovered ? "translateX(0)" : "translateX(20px)",
            transition: "all 0.3s ease"
          }}>
            <button onClick={handleAdd} style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 40, height: 40, fontSize: "1.1rem", color: "#fff",
              background: "#1a1a2e", border: "none", borderRadius: "50%",
              cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
            }} title="Adicionar ao carrinho">ðŸ›’</button>
          </div>

          {/* Stock Badge */}
          {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
            <span style={{
              position: "absolute", top: 12, left: 12,
              padding: "4px 12px", fontSize: "0.75rem", fontWeight: 600,
              textTransform: "uppercase", borderRadius: 4,
              background: "#ff9800", color: "#1a1a2e"
            }}>Ultimas unidades</span>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: "1.25rem" }}>
          <span style={{
            display: "block", fontSize: "0.75rem", fontWeight: 500,
            color: "#c9a962", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4
          }}>{product.category}</span>
          <h3 style={{
            fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 600,
            color: "#fff", marginBottom: 8, display: "-webkit-box",
            WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.4
          }}>{product.name}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontFamily: "'Playfair Display', serif", fontSize: "1.25rem",
              fontWeight: 700, color: "#c9a962"
            }}>{fmt(product.price)}</span>
          </div>
        </div>

        {/* CTA */}
        <button onClick={handleAdd} style={{
          width: "calc(100% - 2.5rem)", margin: "0 1.25rem 1.25rem",
          padding: "0.75rem", fontFamily: "'Poppins', sans-serif",
          fontSize: "0.85rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: 1,
          color: "#1a1a2e", background: "linear-gradient(135deg, #c9a962 0%, #a68b4b 100%)",
          border: "none", borderRadius: 8, cursor: "pointer",
          transition: "all 0.3s ease",
          boxShadow: hovered ? "0 0 20px rgba(201,169,98,0.3)" : "none"
        }}>Adicionar ao Carrinho</button>
      </div>
    </Link>
  );
}