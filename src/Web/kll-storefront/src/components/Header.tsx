import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { useState, useEffect, useRef } from "react";
import { SearchIcon, CartIcon, UserIcon, SettingsIcon, MenuIcon, XIcon } from "./Icons";
import { profileApi } from "../services/api";
import { FiHeart } from "react-icons/fi";

export default function Header() {
  const { isAuthenticated, user, isAdmin, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const nav = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      profileApi.get().then((data: any) => {
        if (data.avatarUrl) setAvatarUrl(data.avatarUrl);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      nav(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setMobileOpen(false);
      setQuery("");
    }
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/search", label: "Produtos" },
    { to: "/search?view=categories", label: "Categorias" },
  ];

  const initial = user?.preferred_username?.charAt(0).toUpperCase() || "?";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark/95 backdrop-blur-md border-b border-gold/10">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-[72px] flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 no-underline shrink-0">
            <span className="font-playfair font-bold text-gold text-2xl tracking-wide">AUREA</span>
            <span className="font-poppins font-light text-text-secondary text-base">Maison</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.to + link.label}
                to={link.to}
                className="text-[0.8rem] font-medium text-text-secondary uppercase tracking-[2px] no-underline pb-1 border-b border-transparent hover:text-gold hover:border-gold transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`flex items-center justify-center w-10 h-10 rounded-full border-none cursor-pointer transition-all duration-200 ${
                searchOpen ? "text-gold bg-gold/10" : "text-text-secondary hover:text-gold bg-transparent"
              }`}
            >
              <SearchIcon size={18} />
            </button>

            {/* Favorites */}
            <button className="flex items-center justify-center w-10 h-10 rounded-full border-none cursor-pointer text-text-secondary hover:text-gold bg-transparent transition-colors duration-200">
              <FiHeart size={18} />
            </button>

            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <a
                    href="http://localhost:5173"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center w-10 h-10 rounded-full text-text-secondary hover:text-gold no-underline transition-colors duration-200"
                  >
                    <SettingsIcon size={18} />
                  </a>
                )}

                {/* Cart */}
                <Link
                  to="/cart"
                  className="relative flex items-center justify-center w-10 h-10 text-text-secondary hover:text-gold no-underline transition-colors duration-200"
                >
                  <CartIcon size={18} />
                  {itemCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[0.65rem] font-bold leading-none text-dark bg-gold rounded-full">
                      {itemCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div ref={menuRef} className="relative ml-1 pl-3 border-l border-gold/15">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center p-0 cursor-pointer transition-all duration-200 border-2 ${
                      menuOpen ? "border-gold" : "border-transparent"
                    }`}
                    style={{
                      background: avatarUrl ? "transparent" : "linear-gradient(135deg, #c9a962, #b08942)",
                    }}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-[0.8rem] font-bold text-dark">{initial}</span>
                    )}
                  </button>

                  {menuOpen && (
                    <div className="absolute top-[calc(100%+8px)] right-0 min-w-[200px] bg-surface border border-gold/15 rounded-xl p-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-[1001]">
                      <div className="px-3 py-2 border-b border-gold/10 mb-1">
                        <div className="text-[0.85rem] font-semibold text-white">{user?.preferred_username}</div>
                        <div className="text-[0.7rem] text-text-secondary mt-0.5">{user?.email}</div>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg no-underline text-text-primary text-[0.85rem] hover:bg-gold/10 transition-colors duration-150"
                      >
                        <UserIcon size={16} color="#a0a0b0" />
                        Meu Perfil
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg no-underline text-text-primary text-[0.85rem] hover:bg-gold/10 transition-colors duration-150"
                      >
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#a0a0b0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                          <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
                        </svg>
                        Meus Pedidos
                      </Link>
                      <div className="border-t border-gold/10 mt-1 pt-1">
                        <button
                          onClick={() => { setMenuOpen(false); logout(); }}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-transparent border-none text-red-500 text-[0.85rem] cursor-pointer w-full text-left font-poppins hover:bg-red-500/10 transition-colors duration-150"
                        >
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                          </svg>
                          Sair
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 ml-2 px-5 py-2.5 bg-gradient-to-br from-gold to-gold-dark text-dark rounded-lg font-semibold text-[0.75rem] uppercase tracking-[1.5px] no-underline shadow-[0_2px_8px_rgba(201,169,98,0.2)] hover:from-gold-light hover:to-gold transition-all duration-300"
              >
                <UserIcon size={14} /> Entrar
              </Link>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-1">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`flex items-center justify-center w-10 h-10 rounded-full border-none cursor-pointer transition-all duration-200 ${
                searchOpen ? "text-gold bg-gold/10" : "text-text-secondary bg-transparent"
              }`}
            >
              <SearchIcon size={18} />
            </button>
            <Link
              to="/cart"
              className="relative flex items-center justify-center w-10 h-10 text-text-secondary no-underline"
            >
              <CartIcon size={18} />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[0.65rem] font-bold leading-none text-dark bg-gold rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-full border-none cursor-pointer text-text-secondary bg-transparent hover:text-gold transition-colors duration-200"
            >
              <MenuIcon size={22} />
            </button>
          </div>
        </div>

        {/* Expandable Search Bar */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] bg-surface/[0.98] ${
            searchOpen ? "max-h-[72px] border-t border-gold/10" : "max-h-0"
          }`}
        >
          <form onSubmit={handleSearch} className="flex max-w-[560px] mx-auto py-3 px-4 lg:px-8 gap-2">
            <div className="flex-1 flex items-center gap-3 px-4 bg-white/[0.04] border border-gold/20 rounded-lg focus-within:border-gold transition-colors duration-200">
              <SearchIcon size={16} color="#6c6c7e" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="O que você procura?"
                className="flex-1 py-2.5 text-[0.9rem] text-white bg-transparent border-none outline-none font-poppins placeholder:text-text-secondary/50"
              />
            </div>
            <button
              type="submit"
              className="px-5 text-[0.8rem] font-semibold text-dark bg-gold rounded-lg border-none cursor-pointer font-poppins uppercase tracking-wider hover:bg-gold-light transition-colors duration-200"
            >
              Buscar
            </button>
          </form>
        </div>
      </header>

      {/* Header Spacer */}
      <div className="h-[72px]" />

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-[60] lg:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[300px] bg-dark z-[70] lg:hidden border-l border-gold/10 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-6 h-[72px] border-b border-gold/10">
          <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-1 no-underline">
            <span className="font-playfair font-bold text-gold text-xl">AUREA</span>
            <span className="font-poppins font-light text-text-secondary text-sm">Maison</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center w-10 h-10 rounded-full border-none cursor-pointer text-text-secondary bg-transparent hover:text-gold transition-colors duration-200"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex flex-col px-4 py-6 gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to + link.label}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 text-[0.9rem] font-medium text-text-primary no-underline rounded-lg hover:bg-gold/10 hover:text-gold transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Sidebar Divider */}
        <div className="mx-6 border-t border-gold/10" />

        {/* Sidebar User Actions */}
        <div className="px-4 py-4 flex flex-col gap-1">
          {isAuthenticated ? (
            <>
              <div className="px-4 py-3 flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                  style={{
                    background: avatarUrl ? "transparent" : "linear-gradient(135deg, #c9a962, #b08942)",
                  }}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="text-[0.8rem] font-bold text-dark">{initial}</span>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{user?.preferred_username}</div>
                  <div className="text-[0.7rem] text-text-secondary">{user?.email}</div>
                </div>
              </div>

              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-[0.85rem] text-text-primary no-underline rounded-lg hover:bg-gold/10 transition-colors duration-200"
              >
                Meu Perfil
              </Link>
              <Link
                to="/orders"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-[0.85rem] text-text-primary no-underline rounded-lg hover:bg-gold/10 transition-colors duration-200"
              >
                Meus Pedidos
              </Link>
              <Link
                to="/cart"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-[0.85rem] text-text-primary no-underline rounded-lg hover:bg-gold/10 transition-colors duration-200 flex items-center justify-between"
              >
                Carrinho
                {itemCount > 0 && (
                  <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[0.65rem] font-bold text-dark bg-gold rounded-full">
                    {itemCount}
                  </span>
                )}
              </Link>

              {isAdmin && (
                <a
                  href="http://localhost:5173"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-3 text-[0.85rem] text-text-primary no-underline rounded-lg hover:bg-gold/10 transition-colors duration-200"
                >
                  Painel Admin
                </a>
              )}

              <div className="mx-4 my-2 border-t border-gold/10" />

              <button
                onClick={() => { setMobileOpen(false); logout(); }}
                className="px-4 py-3 text-[0.85rem] text-red-500 bg-transparent border-none cursor-pointer text-left font-poppins rounded-lg hover:bg-red-500/10 transition-colors duration-200"
              >
                Sair
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="mx-4 mt-2 flex items-center justify-center gap-2 px-5 py-3 bg-gold text-dark rounded-lg font-semibold text-[0.8rem] uppercase tracking-wider no-underline hover:bg-gold-light transition-colors duration-200"
            >
              <UserIcon size={14} /> Entrar
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
