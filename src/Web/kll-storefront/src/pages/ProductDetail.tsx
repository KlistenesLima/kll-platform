import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productApi } from "../services/api";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { FiShoppingCart, FiMinus, FiPlus } from "react-icons/fi";
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
      toast.success(`${product.name} adicionado ao carrinho!`);
    } catch { toast.error("Erro ao adicionar"); }
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kll-600"></div></div>;
  if (!product) return <div className="text-center py-20 text-gray-500">Produto nao encontrado</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="bg-gray-100 flex items-center justify-center p-8 min-h-[400px]">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="max-w-full max-h-[500px] object-contain" />
            ) : (
              <div className="text-9xl text-gray-300">ðŸ“¦</div>
            )}
          </div>
          <div className="p-8">
            <p className="text-sm text-kll-600 font-medium mb-2">{product.category}</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

            <div className="mb-6">
              <p className="text-4xl font-bold text-kll-700">{fmt(product.price)}</p>
              <p className="text-green-600 text-sm mt-1">Frete gratis â€¢ Entrega em ate 5 dias uteis</p>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm text-gray-600">Quantidade:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-gray-100"><FiMinus /></button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))} className="px-3 py-2 hover:bg-gray-100"><FiPlus /></button>
              </div>
              <span className="text-xs text-gray-400">({product.stockQuantity} disponiveis)</span>
            </div>

            <button onClick={handleAdd}
              className="w-full flex items-center justify-center gap-3 bg-kll-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-kll-700 transition">
              <FiShoppingCart size={22} /> Adicionar ao Carrinho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
