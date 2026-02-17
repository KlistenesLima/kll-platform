import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { orderApi } from "../services/api";
import toast from "react-hot-toast";

export default function Checkout() {
  const { items, total, clearCart, fetchCart } = useCartStore();
  const { user } = useAuthStore();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    street: "", number: "", complement: "", neighborhood: "", city: "Fortaleza", state: "CE", zipCode: ""
  });

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderData = {
        customerId: user?.sub,
        customerEmail: user?.email,
        ...form,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
      };
      const order = await orderApi.create(orderData);
      await clearCart();
      toast.success("Pedido realizado com sucesso!");
      nav(`/order/${order.id}`);
    } catch { toast.error("Erro ao finalizar pedido"); }
    finally { setLoading(false); }
  };

  if (items.length === 0) { nav("/cart"); return null; }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="md:col-span-2 bg-white rounded-xl shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-2">Endereco de Entrega</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Rua</label>
              <input required value={form.street} onChange={(e) => setForm({...form, street: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kll-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Numero</label>
              <input required value={form.number} onChange={(e) => setForm({...form, number: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kll-500 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Bairro</label>
              <input required value={form.neighborhood} onChange={(e) => setForm({...form, neighborhood: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kll-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Complemento</label>
              <input value={form.complement} onChange={(e) => setForm({...form, complement: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kll-500 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Cidade</label>
              <input required value={form.city} onChange={(e) => setForm({...form, city: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kll-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Estado</label>
              <input required value={form.state} onChange={(e) => setForm({...form, state: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kll-500 outline-none" maxLength={2} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">CEP</label>
              <input required value={form.zipCode} onChange={(e) => setForm({...form, zipCode: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kll-500 outline-none" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition disabled:opacity-50 mt-4">
            {loading ? "Processando..." : `Confirmar Pedido \u2022 ${fmt(total)}`}
          </button>
        </form>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Resumo</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.productName} x{item.quantity}</span>
                <span className="font-medium">{fmt(item.total)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-kll-700">{fmt(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
