import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight } from 'react-icons/fi';
import { useCartStore } from '../store/useCartStore';
import EmptyState from '../components/EmptyState';

export default function Cart() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();

  const formatPrice = (p: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <EmptyState
          title="Carrinho vazio"
          description="Adicione produtos ao seu carrinho para continuar"
          action={<Link to="/products" className="btn-primary">Ver Produtos</Link>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Carrinho ({items.length} itens)</h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700">Limpar carrinho</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="card p-4 flex gap-4">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">📦</span>
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${product.id}`} className="font-semibold hover:text-primary-600 line-clamp-1">
                  {product.name}
                </Link>
                <p className="text-sm text-gray-500 mt-1">{product.category}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border rounded-lg">
                    <button onClick={() => updateQuantity(product.id, quantity - 1)} className="px-2 py-1 hover:bg-gray-50"><FiMinus size={14} /></button>
                    <span className="px-3 py-1 text-sm font-medium">{quantity}</span>
                    <button onClick={() => updateQuantity(product.id, quantity + 1)} className="px-2 py-1 hover:bg-gray-50"><FiPlus size={14} /></button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatPrice(product.price * quantity)}</span>
                    <button onClick={() => removeItem(product.id)} className="p-1 text-gray-400 hover:text-red-500"><FiTrash2 size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-6 h-fit sticky top-24">
          <h3 className="font-semibold text-lg mb-4">Resumo</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(total())}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Frete</span><span className="text-green-600">Grátis</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">PIX (5% off)</span><span className="text-primary-600">{formatPrice(total() * 0.95)}</span></div>
          </div>
          <div className="border-t mt-4 pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span><span>{formatPrice(total())}</span>
            </div>
          </div>
          <Link to="/checkout" className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
            Finalizar Compra <FiArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
}