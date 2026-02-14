import { Link } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import type { Product } from '../types';
import { useCartStore } from '../store/useCartStore';
import toast from 'react-hot-toast';

interface Props { product: Product; }

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    addItem(product);
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  return (
    <div className="card group">
      <Link to={`/products/${product.id}`}>
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6 group-hover:from-primary-50 group-hover:to-primary-100 transition-colors duration-300">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="max-h-full object-contain" />
          ) : (
            <div className="text-6xl text-gray-300 group-hover:text-primary-300 transition-colors">ðŸ“¦</div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <span className="badge bg-primary-100 text-primary-700 mb-2">{product.category}</span>
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
            <p className="text-xs text-green-600">
              ou 12x de {formatPrice(product.price / 12)}
            </p>
          </div>
          <button
            onClick={handleAdd}
            disabled={product.stockQuantity <= 0}
            className="p-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            <FiShoppingCart size={18} />
          </button>
        </div>
        {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
          <p className="text-xs text-orange-500 mt-2">Apenas {product.stockQuantity} em estoque!</p>
        )}
        {product.stockQuantity <= 0 && (
          <p className="text-xs text-red-500 mt-2">Produto esgotado</p>
        )}
      </div>
    </div>
  );
}