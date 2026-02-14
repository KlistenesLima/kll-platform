import { Link } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiPackage, FiSearch } from 'react-icons/fi';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const itemCount = useCartStore((s) => s.itemCount());
  const { isLoggedIn, customerName, logout } = useAuthStore();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?q=${search}`);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="text-xl font-bold text-gray-900">KLL Store</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar produtos..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </form>

          <nav className="flex items-center gap-4">
            <Link to="/tracking" className="flex items-center gap-1 text-gray-600 hover:text-primary-600 transition-colors">
              <FiPackage size={20} />
              <span className="hidden sm:inline text-sm">Rastrear</span>
            </Link>

            <Link to="/cart" className="relative flex items-center gap-1 text-gray-600 hover:text-primary-600 transition-colors">
              <FiShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {itemCount}
                </span>
              )}
              <span className="hidden sm:inline text-sm">Carrinho</span>
            </Link>

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link to="/orders" className="text-sm text-gray-600 hover:text-primary-600">Pedidos</Link>
                <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500">Sair</button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-1 text-gray-600 hover:text-primary-600 transition-colors">
                <FiUser size={20} />
                <span className="hidden sm:inline text-sm">Entrar</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}