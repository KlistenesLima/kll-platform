import { useParams, Link } from 'react-router-dom';
import { FiShoppingCart, FiArrowLeft, FiTruck, FiShield } from 'react-icons/fi';
import { useCartStore } from '../store/useCartStore';
import toast from 'react-hot-toast';
import { useState } from 'react';
import type { Product } from '../types';

// Mock (same as products page)
const mockProducts: Record<string, Product> = {
  '1': { id: '1', name: 'Smartphone Galaxy S24 Ultra', description: 'O Galaxy S24 Ultra redefine o que um smartphone pode fazer. Com tela Dynamic AMOLED 2X de 6.8 polegadas, processador Snapdragon 8 Gen 3, câmera de 200MP com zoom óptico 5x e S Pen integrada. 256GB de armazenamento, 12GB RAM, bateria de 5000mAh com carregamento rápido 45W.', price: 6499.90, stockQuantity: 45, category: 'Electronics', imageUrl: null, isActive: true, createdAt: new Date().toISOString() },
  '2': { id: '2', name: 'Notebook Dell Inspiron 15', description: 'Notebook Dell Inspiron 15 com processador Intel Core i7-1355U, 16GB DDR4, SSD NVMe de 512GB, tela Full HD de 15.6 polegadas antirreflexo. Ideal para produtividade e entretenimento. Windows 11 pré-instalado.', price: 4299.00, stockQuantity: 23, category: 'Computers', imageUrl: null, isActive: true, createdAt: new Date().toISOString() },
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);

  const product = id ? mockProducts[id] : null;

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold">Produto não encontrado</h2>
        <Link to="/products" className="btn-primary mt-4 inline-block">Ver todos os produtos</Link>
      </div>
    );
  }

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addItem(product);
    toast.success(`${qty}x ${product.name} adicionado!`);
  };

  const formatPrice = (p: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/products" className="inline-flex items-center gap-1 text-gray-500 hover:text-primary-600 mb-6">
        <FiArrowLeft /> Voltar aos produtos
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
          <span className="text-[120px]">📦</span>
        </div>

        <div>
          <span className="badge bg-primary-100 text-primary-700">{product.category}</span>
          <h1 className="text-3xl font-bold mt-3">{product.name}</h1>
          <p className="text-gray-500 mt-4 leading-relaxed">{product.description}</p>

          <div className="mt-6 p-6 bg-gray-50 rounded-xl">
            <div className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</div>
            <p className="text-sm text-green-600 mt-1">ou 12x de {formatPrice(product.price / 12)} sem juros</p>
            <p className="text-sm text-primary-600 mt-1">via PIX: {formatPrice(product.price * 0.95)} (5% off)</p>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center border rounded-lg">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:bg-gray-50">−</button>
              <span className="px-4 py-2 font-medium">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stockQuantity, qty + 1))} className="px-3 py-2 hover:bg-gray-50">+</button>
            </div>
            <button onClick={handleAdd} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <FiShoppingCart /> Adicionar ao Carrinho
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-3">{product.stockQuantity} disponíveis em estoque</p>

          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <FiTruck className="text-green-500" /> <span>Frete grátis para compras acima de R$ 299</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <FiShield className="text-blue-500" /> <span>Garantia de 12 meses</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}