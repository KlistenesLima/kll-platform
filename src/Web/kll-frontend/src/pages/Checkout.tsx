import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { items, total, clearCart } = useCartStore();
  const { isLoggedIn, customerId, customerEmail, customerName } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zipCode: '',
  });

  const formatPrice = (p: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p);

  if (!isLoggedIn) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold mb-4">FaÃ§a login para continuar</h2>
        <Link to="/login" className="btn-primary">Entrar</Link>
      </div>
    );
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // In production: orderApi.create({...})
      await new Promise((r) => setTimeout(r, 1500));
      const orderId = `ord-${Date.now()}`;
      clearCart();
      toast.success('Pedido criado com sucesso!');
      navigate(`/order-success/${orderId}`);
    } catch {
      toast.error('Erro ao criar pedido');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Dados do Cliente</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome</label><input className="input-field bg-gray-50" value={customerName} disabled /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input className="input-field bg-gray-50" value={customerEmail} disabled /></div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">EndereÃ§o de Entrega</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">CEP</label><input className="input-field" value={form.zipCode} onChange={(e) => update('zipCode', e.target.value)} placeholder="00000-000" required /></div>
              <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Rua</label><input className="input-field" value={form.street} onChange={(e) => update('street', e.target.value)} required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">NÃºmero</label><input className="input-field" value={form.number} onChange={(e) => update('number', e.target.value)} required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label><input className="input-field" value={form.complement} onChange={(e) => update('complement', e.target.value)} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label><input className="input-field" value={form.neighborhood} onChange={(e) => update('neighborhood', e.target.value)} required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label><input className="input-field" value={form.city} onChange={(e) => update('city', e.target.value)} required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select className="input-field" value={form.state} onChange={(e) => update('state', e.target.value)} required>
                  <option value="">Selecione</option>
                  {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">MÃ©todo de Pagamento</h2>
            <div className="p-4 border-2 border-primary-500 rounded-lg bg-primary-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">PIX</div>
                <div>
                  <p className="font-medium">PIX via KRT Bank</p>
                  <p className="text-sm text-gray-500">Pagamento instantÃ¢neo com 5% de desconto</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6 h-fit sticky top-24">
          <h3 className="font-semibold text-lg mb-4">Resumo do Pedido</h3>
          <div className="space-y-3 mb-4">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex justify-between text-sm">
                <span className="text-gray-600 line-clamp-1 flex-1">{quantity}x {product.name}</span>
                <span className="ml-2 font-medium">{formatPrice(product.price * quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{formatPrice(total())}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Frete</span><span className="text-green-600">GrÃ¡tis</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Desconto PIX</span><span className="text-green-600">-{formatPrice(total() * 0.05)}</span></div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t"><span>Total</span><span>{formatPrice(total() * 0.95)}</span></div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-4">
            {loading ? 'Processando...' : 'Confirmar Pedido'}
          </button>
        </div>
      </form>
    </div>
  );
}