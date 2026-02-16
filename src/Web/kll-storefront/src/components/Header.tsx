import { Link } from "react-router-dom";
import { FiShoppingCart, FiUser, FiSearch, FiLogOut, FiSettings } from "react-icons/fi";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { isAuthenticated, user, isAdmin, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const [query, setQuery] = useState("");
  const nav = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) nav(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="bg-kll-800 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-accent-400 hover:text-accent-500 transition">
            KLL Store
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar produtos..." className="w-full py-2 px-4 pr-10 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent-400" />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-kll-600">
                <FiSearch size={20} />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-300">Ola, {user?.preferred_username}</span>
                <Link to="/orders" className="text-sm hover:text-accent-400 transition">Pedidos</Link>
                {isAdmin && (
                  <a href="http://localhost:5173" target="_blank" rel="noreferrer" className="hover:text-accent-400 transition" title="Admin">
                    <FiSettings size={20} />
                  </a>
                )}
                <Link to="/cart" className="relative hover:text-accent-400 transition">
                  <FiShoppingCart size={22} />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>
                <button onClick={logout} className="hover:text-red-400 transition" title="Sair"><FiLogOut size={20} /></button>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-2 bg-accent-400 text-kll-900 px-4 py-2 rounded-lg font-semibold hover:bg-accent-500 transition">
                <FiUser size={18} /> Entrar
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
