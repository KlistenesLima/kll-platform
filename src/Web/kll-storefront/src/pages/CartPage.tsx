import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import ShippingCalculator from "../components/ShippingCalculator";
import ProductImage from "../components/ProductImage";
import { CartIcon, DiamondIcon, MinusIcon, PlusIcon, XIcon } from "../components/Icons";
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

  if (loading) return <div className="flex justify-center py-20"><div className="w-12 h-12 border-[3px] border-[rgba(201,169,98,0.2)] border-t-[#c9a962] rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="font-[Playfair_Display] text-2xl sm:text-4xl mb-6 sm:mb-8">
        Carrinho <span className="text-[#6c6c7e] text-sm sm:text-base font-[Poppins]">({itemCount} itens)</span>
      </h1>

      {items.length === 0 ? (
        <div className="text-center p-8 sm:p-16 bg-[#1a1a2e] rounded-2xl border border-[rgba(201,169,98,0.2)]">
          <div className="mb-4 opacity-30 flex justify-center">
            <CartIcon size={64} color="#6c6c7e" />
          </div>
          <p className="text-[#6c6c7e] text-lg mb-6">Seu carrinho esta vazio</p>
          <Link to="/search" className="inline-block px-8 py-3 bg-gradient-to-r from-[#c9a962] to-[#a68b4b] text-[#1a1a2e] rounded-lg font-semibold uppercase tracking-wider text-sm no-underline">
            Explorar Produtos
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:gap-4">
            {items.map((item) => (
              <div key={item.productId} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-4 sm:p-5 bg-[#1a1a2e] border border-[rgba(201,169,98,0.2)] rounded-xl">
                {/* Image + Info row on mobile */}
                <div className="flex items-center gap-3 sm:gap-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#252542] rounded-lg flex items-center justify-center shrink-0">
                    <ProductImage imageUrl={item.imageUrl} alt={item.productName} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-[Playfair_Display] text-sm sm:text-base font-semibold text-white truncate">{item.productName}</h3>
                    <p className="text-[#c9a962] font-semibold text-sm">{fmt(item.unitPrice)}</p>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pl-0 sm:pl-0">
                  <div className="flex items-center border-2 border-[rgba(201,169,98,0.2)] rounded-lg">
                    <button onClick={() => handleUpdate(item.productId, item.quantity - 1)}
                      className="p-2 sm:p-2.5 bg-transparent border-none text-white cursor-pointer flex items-center justify-center">
                      <MinusIcon size={14} color="#fff" />
                    </button>
                    <span className="px-3 font-semibold text-white text-sm">{item.quantity}</span>
                    <button onClick={() => handleUpdate(item.productId, item.quantity + 1)}
                      className="p-2 sm:p-2.5 bg-transparent border-none text-white cursor-pointer flex items-center justify-center">
                      <PlusIcon size={14} color="#fff" />
                    </button>
                  </div>
                  <p className="font-[Playfair_Display] font-bold text-[#c9a962] text-base sm:text-lg w-20 sm:w-24 text-right">{fmt(item.total)}</p>
                  <button onClick={() => handleRemove(item.productId)}
                    className="bg-transparent border-none text-[#f44336] cursor-pointer p-2 flex items-center justify-center">
                    <XIcon size={16} color="#f44336" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 sm:mt-8 p-5 sm:p-8 bg-[#1a1a2e] border border-[rgba(201,169,98,0.2)] rounded-2xl">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <span className="text-base sm:text-lg text-[#b8b8c7]">Total:</span>
              <span className="font-[Playfair_Display] text-xl sm:text-3xl font-bold text-[#c9a962]">{fmt(total)}</span>
            </div>
            <ShippingCalculator cartTotal={total} />

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button onClick={() => { clearCart(); toast.success("Carrinho limpo"); }}
                className="px-6 py-3 bg-transparent border-2 border-[rgba(201,169,98,0.2)] rounded-lg text-[#b8b8c7] cursor-pointer font-[Poppins] text-sm sm:text-base">
                Limpar
              </button>
              <Link to="/checkout"
                className="flex-1 text-center py-3 rounded-lg bg-gradient-to-r from-[#c9a962] to-[#a68b4b] text-[#1a1a2e] font-semibold no-underline uppercase tracking-wider text-sm font-[Poppins]">
                Finalizar Compra
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
