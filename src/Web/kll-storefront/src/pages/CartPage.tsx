import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { FiTrash2, FiMinus, FiPlus } from "react-icons/fi";
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
    try { await updateItem(productId, qty); await fetchCart(); } catch { toast.error("Erro ao atualizar"); }
  };

  const handleRemove = async (productId: string) => {
    try { await removeItem(productId); await fetchCart(); toast.success("Item removido"); } catch { toast.error("Erro"); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kll-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Carrinho ({itemCount} itens)</h1>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow">
          <p className="text-6xl mb-4">ðŸ›’</p>
          <p className="text-xl text-gray-500 mb-4">Seu carrinho esta vazio</p>
          <Link to="/" className="inline-block bg-kll-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-kll-700 transition">
            Continuar Comprando
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover rounded-lg" /> : <span className="text-3xl">ðŸ“¦</span>}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">{item.productName}</h3>
                <p className="text-kll-600 font-bold">{fmt(item.unitPrice)}</p>
              </div>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button onClick={() => handleUpdate(item.productId, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-100"><FiMinus size={14} /></button>
                <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                <button onClick={() => handleUpdate(item.productId, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-100"><FiPlus size={14} /></button>
              </div>
              <p className="font-bold text-gray-800 w-24 text-right">{fmt(item.total)}</p>
              <button onClick={() => handleRemove(item.productId)} className="text-red-500 hover:text-red-700 p-2"><FiTrash2 size={18} /></button>
            </div>
          ))}

          <div className="bg-white rounded-xl shadow p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg text-gray-600">Total:</span>
              <span className="text-3xl font-bold text-kll-700">{fmt(total)}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { clearCart(); toast.success("Carrinho limpo"); }}
                className="px-4 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition">Limpar</button>
              <Link to="/checkout" className="flex-1 text-center bg-kll-600 text-white py-3 rounded-lg font-bold hover:bg-kll-700 transition">
                Finalizar Compra
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
