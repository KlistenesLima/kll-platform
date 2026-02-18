import { Link, useNavigate } from "react-router-dom";
import type { Product } from "../types";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { useFavoritesStore } from "../store/favoritesStore";
import { CartIcon } from "./Icons";
import ProductImage from "./ProductImage";
import toast from "react-hot-toast";
import { useState } from "react";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const nav = useNavigate();
  const [heartAnim, setHeartAnim] = useState(false);

  const liked = isFavorite(product.id);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { nav("/login"); return; }
    try {
      await addItem(product.id);
      toast.success(`${product.name} adicionado ao carrinho`, {
        style: { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(201,169,98,0.2)", fontSize: "0.85rem" },
        iconTheme: { primary: "#c9a962", secondary: "#0f0f1a" },
      });
    } catch {
      toast.error("Erro ao adicionar");
    }
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { nav("/login"); return; }
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 300);
    await toggleFavorite(product.id);
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const isNew = product.createdAt &&
    Date.now() - new Date(product.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000;

  return (
    <Link to={`/product/${product.id}`} className="group block no-underline text-inherit">
      <div className="bg-surface rounded-xl overflow-hidden border border-gold/5 hover:border-gold/20 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(201,169,98,0.1)]">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-surface to-dark">
          <ProductImage
            imageUrl={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-16">
            <span className="bg-white/95 text-dark px-5 py-2 rounded-lg font-poppins font-semibold text-[0.7rem] uppercase tracking-wider translate-y-3 group-hover:translate-y-0 transition-transform duration-300 shadow-lg">
              Ver Detalhes
            </span>
          </div>

          {/* Favorite Heart */}
          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 flex items-center justify-center w-9 h-9 rounded-full border-none cursor-pointer z-10 transition-all duration-200"
            style={{
              background: liked ? "rgba(201,169,98,0.2)" : "rgba(0,0,0,0.4)",
              backdropFilter: "blur(4px)",
              transform: heartAnim ? "scale(1.3)" : "scale(1)",
            }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24"
              fill={liked ? "#c9a962" : "none"}
              stroke={liked ? "#c9a962" : "#fff"}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Quick Add */}
          <button
            onClick={handleAdd}
            className="absolute bottom-3 right-3 flex items-center justify-center w-10 h-10 bg-gold text-dark rounded-lg border-none cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.4)] opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10 hover:bg-gold-light"
          >
            <CartIcon size={16} />
          </button>

          {/* Badges */}
          {isNew && (
            <span className="absolute top-3 left-3 px-3 py-1 bg-gold text-dark text-[0.65rem] font-bold uppercase tracking-wider rounded-md">
              Novo
            </span>
          )}
          {!isNew && product.stockQuantity <= 5 && product.stockQuantity > 0 && (
            <span className="absolute top-3 left-3 px-3 py-1 bg-orange-500/90 text-white text-[0.65rem] font-bold uppercase tracking-[0.5px] rounded-md">
              Últimas unidades
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4 pt-3">
          {product.category && (
            <span className="block text-[0.65rem] font-semibold text-gold uppercase tracking-[1.5px] mb-1.5">
              {product.category}
            </span>
          )}
          <h3 className="font-poppins font-medium text-white text-[0.9rem] leading-snug mb-3 line-clamp-2 min-h-[2.5em]">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2">
            <p className="text-gold font-semibold text-lg font-poppins">{fmt(product.price)}</p>
            {product.oldPrice && product.oldPrice > product.price && (
              <p className="text-text-secondary text-sm line-through">{fmt(product.oldPrice)}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
