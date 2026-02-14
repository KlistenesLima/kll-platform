import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Product } from '../types';

// Mock data (substituted by API when backend is running)
const mockProducts: Product[] = [
  { id: '1', name: 'Smartphone Galaxy S24 Ultra', description: 'Tela 6.8" AMOLED, 256GB, CÃ¢mera 200MP', price: 6499.90, stockQuantity: 45, category: 'Electronics', imageUrl: null, isActive: true, createdAt: new Date().toISOString() },
  { id: '2', name: 'Notebook Dell Inspiron 15', description: 'Intel i7, 16GB RAM, SSD 512GB, Tela Full HD', price: 4299.00, stockQuantity: 23, category: 'Computers', imageUrl: null, isActive: true, createdAt: new Date().toISOString() },
  { id: '3', name: 'Fone JBL Tune 770NC', description: 'Bluetooth 5.3, Cancelamento de RuÃ­do, 44h bateria', price: 399.90, stockQuantity: 120, category: 'Audio', imageUrl: null, isActive: true, createdAt: new Date().toISOString() },
  { id: '4', name: 'Cadeira Gamer ThunderX3', description: 'Encosto reclinÃ¡vel 180Â°, apoio de braÃ§o 4D', price: 1899.00, stockQuantity: 8, category: 'Furniture', imageUrl: null, isActive: true, createdAt: new Date().toISOString() },
  { id: '5', name: 'Mouse Logitech MX Master 3S', description: 'Sensor 8000 DPI, USB-C, Multi-device', price: 549.90, stockQuantity: 67, category: 'Peripherals', imageUrl: null, isActive: true, createdAt: new Date().toISOString() },
  { id: '6', name: 'Monitor LG UltraWide 34"', description: 'IPS, 2560x1080, HDR10, USB-C 65W', price: 2799.00, stockQuantity: 15, category: 'Computers', imageUrl: null, isActive: true, createdAt: new Date().toISOString() },
  { id: '7', name: 'Teclado MecÃ¢nico Keychron K8', description: 'Hot-swap, RGB, Bluetooth 5.1, Switches Gateron', price: 699.90, stockQuantity: 34, category: 'Peripherals', imageUrl: null, isActive: true, createdAt: new Date().toISOString() },
  { id: '8', name: 'SSD Samsung 990 Pro 2TB', description: 'NVMe M.2, 7450MB/s leitura, PCIe Gen4', price: 899.00, stockQuantity: 50, category: 'Electronics', imageUrl: null, isActive: true, createdAt: new Date().toISOString() },
  { id: '9', name: 'Console PS5 Slim', description: 'Digital Edition, 1TB SSD, DualSense incluso', price: 3499.00, stockQuantity: 3, category: 'Gaming', imageUrl: null, isActive: true, createdAt: new Date().toISOString() },
  { id: '10', name: 'Webcam Logitech Brio 4K', description: 'Ultra HD, HDR, Windows Hello, dual mic', price: 799.90, stockQuantity: 28, category: 'Peripherals', imageUrl: null, isActive: true, createdAt: new Date().toISOString() },
  { id: '11', name: 'Caixa de Som JBL Charge 5', description: 'Bluetooth, IP67, 20h bateria, Powerbank', price: 999.00, stockQuantity: 42, category: 'Audio', imageUrl: null, isActive: true, createdAt: new Date().toISOString() },
  { id: '12', name: 'Mesa Digitalizadora Wacom', description: 'Intuos Pro Medium, 8192 nÃ­veis de pressÃ£o', price: 2199.00, stockQuantity: 11, category: 'Peripherals', imageUrl: null, isActive: true, createdAt: new Date().toISOString() },
];

const allCategories = ['Todos', ...new Set(mockProducts.map((p) => p.category))];

export default function Products() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'Todos');
  const query = searchParams.get('q') || '';

  useEffect(() => {
    setLoading(true);
    // Try API first, fallback to mock
    setTimeout(() => {
      let filtered = mockProducts;
      if (selectedCategory !== 'Todos') filtered = filtered.filter((p) => p.category === selectedCategory);
      if (query) filtered = filtered.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase()));
      setProducts(filtered);
      setLoading(false);
    }, 300);
  }, [selectedCategory, query]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-gray-500 mt-1">{products.length} produtos encontrados</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}