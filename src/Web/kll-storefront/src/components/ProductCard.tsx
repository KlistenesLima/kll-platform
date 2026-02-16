import { Link, useNavigate } from "react-router-dom";
import type { Product } from "../types";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { CartIcon } from "../components/Icons";
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
      toast.success(`${product.name} adicionado ao carrinho`, {
        style: { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(201,169,98,0.2)", fontSize: "0.85rem" },
        iconTheme: { primary: "#c9a962", secondary: "#0f0f1a" }
      });
    } catch { toast.error("Erro ao adicionar"); }
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <Link to={`/product/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{
        display: "flex", flexDirection: "column",
        background: hovered ? "rgba(26,26,46,0.8)" : "rgba(26,26,46,0.4)",
        border: `1px solid ${hovered ? "rgba(201,169,98,0.25)" : "rgba(201,169,98,0.06)"}`,
        borderRadius: 16, overflow: "hidden",
        transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hovered ? "translateY(-6px)" : "none",
        boxShadow: hovered ? "0 12px 40px rgba(0,0,0,0.4)" : "none"
      }}>
        {/* Image */}
        <div style={{
          position: "relative", aspectRatio: "1", overflow: "hidden",
          background: "linear-gradient(135deg, #1e1e38, #252542)"
        }}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} style={{
              width: "100%", height: "100%", objectFit: "cover",
              transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: hovered ? "scale(1.08)" : "scale(1)"
            }} />
          ) : (
            <div style={{
              width: "100%", height: "100%", display: "flex", alignItems: "center",
              justifyContent: "center", color: "rgba(201,169,98,0.1)"
            }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z" />
              </svg>
            </div>
          )}

          {/* Quick Add */}
          <button onClick={handleAdd} style={{
            position: "absolute", bottom: 12, right: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 40, height: 40, color: "#0f0f1a",
            background: "#c9a962", border: "none", borderRadius: 10,
            cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            opacity: hovered ? 1 : 0, transform: hovered ? "translateY(0)" : "translateY(8px)",
            transition: "all 0.3s ease"
          }}><CartIcon size={16} /></button>

          {/* Badge */}
          {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
            <span style={{
              position: "absolute", top: 12, left: 12,
              padding: "4px 10px", fontSize: "0.65rem", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.5px", borderRadius: 6,
              background: "rgba(255,152,0,0.9)", color: "#fff"
            }}>Ultimas unidades</span>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: "1.25rem 1.25rem 1rem" }}>
          {product.category && (
            <span style={{
              display: "block", fontSize: "0.65rem", fontWeight: 600,
              color: "#c9a962", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 6
            }}>{product.category}</span>
          )}
          <h3 style={{
            fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontWeight: 600,
            color: "#fff", marginBottom: 10, display: "-webkit-box",
            WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            lineHeight: 1.4, minHeight: "2.8em"
          }}>{product.name}</h3>
          <p style={{
            fontFamily: "'Playfair Display', serif", fontSize: "1.2rem",
            fontWeight: 700, color: "#c9a962"
          }}>{fmt(product.price)}</p>
        </div>
      </div>
    </Link>
  );
}