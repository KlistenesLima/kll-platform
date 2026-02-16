import { Link } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import type { Product } from "../types";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const nav = useNavigate();

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { nav("/login"); return; }
    try {
      await addItem(product.id);
      toast.success(`${product.name} adicionado ao carrinho!`);
    } catch { toast.error("Erro ao adicionar"); }
  };

  const formatPrice = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <Link to={`/product/${product.id}`} className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="text-6xl text-gray-300">ðŸ“¦</div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-kll-600 font-medium mb-1">{product.category}</p>
        <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-kll-600 transition">{product.name}</h3>
        <p className="text-2xl font-bold text-kll-700">{formatPrice(product.price)}</p>
        <p className="text-xs text-green-600 mt-1">Frete gratis</p>
        <button onClick={handleAdd} className="mt-3 w-full flex items-center justify-center gap-2 bg-kll-600 text-white py-2 rounded-lg hover:bg-kll-700 transition font-medium">
          <FiShoppingCart size={16} /> Comprar
        </button>
      </div>
    </Link>
  );
}
