import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { useState, useEffect, useRef, useCallback } from "react";
import { SearchIcon, CartIcon, UserIcon, SettingsIcon, MenuIcon, XIcon, ChevronDownIcon } from "./Icons";
import { profileApi } from "../services/api";
import { FiHeart } from "react-icons/fi";
import { useFavoritesStore } from "../store/favoritesStore";

// ─── Category IDs (from database) ───
const CAT = {
  aneis: "6cf64e2b-f55a-4086-9419-81440cf6826e",
  colares: "7bacf4b4-0113-4140-9a78-1b5f505f614d",
  brincos: "7dc0aa79-bb7a-4b20-8754-afc5fd49f190",
  pulseiras: "34dd3529-0edc-4d2d-94ef-b1545e0ee4ac",
  relogios: "5bfcde29-36a2-4fa6-a801-79254145bff2",
  aliancas: "9df9ef3b-658b-4268-8b28-7a2664c5c09b",
  altaJoalheria: "11b67527-bbf2-4eec-af05-613c3b88d424",
  acessorios: "9b62f100-0377-4e7b-ada8-017fd9a89e7e",
  solitarios: "2e1c127a-22bb-4e77-9075-3323d9062119",
  noivado: "8386dfbf-a9fa-4b3e-90ed-552d386aa6ab",
  cocktail: "19737bdd-e971-46f8-b760-203313f96e6c",
  eternidade: "2467d847-976a-4521-93ad-9bd82317cb87",
  riviera: "4b2f5450-84ac-4c17-8dd2-75ef8b4746b2",
  perolas: "45eea2ff-4776-4e30-8d08-255902039eb3",
  correntes: "ecd8ba83-bb52-4d6b-929e-90d2290c5a96",
  pingentes: "041720ed-eb1c-4d00-9262-59da279c11ad",
  argolas: "f8f231ee-24ff-4f27-a9f1-3f22e098fc36",
  brincosDiamante: "7cf2d758-ec16-447c-9896-dea642191533",
  brincosPerola: "27a16370-a0fa-492d-b17b-680812c11cca",
  earCuffs: "e5cc0ee4-12b0-438e-af96-138a14674d55",
  tennis: "fe8cfc7c-a10f-4fc4-b5d3-63d3915af745",
  braceletes: "22c04b54-bf73-4dac-8404-8579f2facf35",
  pulseirasOuro: "b82c3324-d8d7-42ce-873d-06a5afa31a3f",
  charm: "da73b243-9045-45a0-9131-150c2df21e3e",
  pecasUnicas: "86f07d80-f781-43da-8cba-4bdf08fe5649",
  colecoesEspeciais: "43ee4b70-c106-49b8-b5d5-92fa195a1be9",
  abotoaduras: "a257857c-4982-421f-b24f-2f75f53aef5f",
  broches: "71ca00ed-1940-4953-a30d-a9039f5e1d0b",
  portaJoias: "e3af1866-7d5f-4b71-aa27-d227d86f8703",
};

const catLink = (id: string) => `/search?categoryId=${id}`;

// Mega-dropdown: 3 columns with category groups
const megaColumns = [
  [
    {
      title: "Anéis",
      id: CAT.aneis,
      items: [
        { name: "Solitários", id: CAT.solitarios },
        { name: "Noivado", id: CAT.noivado },
        { name: "Cocktail", id: CAT.cocktail },
        { name: "Eternidade", id: CAT.eternidade },
      ],
    },
    {
      title: "Colares",
      id: CAT.colares,
      items: [
        { name: "Riviera", id: CAT.riviera },
        { name: "Pérolas", id: CAT.perolas },
        { name: "Correntes", id: CAT.correntes },
        { name: "Pingentes", id: CAT.pingentes },
      ],
    },
  ],
  [
    {
      title: "Brincos",
      id: CAT.brincos,
      items: [
        { name: "Argolas", id: CAT.argolas },
        { name: "Diamante", id: CAT.brincosDiamante },
        { name: "Pérola", id: CAT.brincosPerola },
        { name: "Ear Cuffs", id: CAT.earCuffs },
      ],
    },
    {
      title: "Pulseiras",
      id: CAT.pulseiras,
      items: [
        { name: "Tennis", id: CAT.tennis },
        { name: "Braceletes", id: CAT.braceletes },
        { name: "Ouro", id: CAT.pulseirasOuro },
        { name: "Charm", id: CAT.charm },
      ],
    },
  ],
  [
    {
      title: "Alta Joalheria",
      id: CAT.altaJoalheria,
      items: [
        { name: "Peças Únicas", id: CAT.pecasUnicas },
        { name: "Coleções Especiais", id: CAT.colecoesEspeciais },
      ],
    },
    {
      title: "Acessórios",
      id: CAT.acessorios,
      items: [
        { name: "Abotoaduras", id: CAT.abotoaduras },
        { name: "Broches", id: CAT.broches },
        { name: "Porta-Joias", id: CAT.portaJoias },
      ],
    },
  ],
];

export default function Header() {
  const { isAuthenticated, user, isAdmin, logout, avatarUrl, setAvatarUrl } = useAuthStore();
  const { itemCount } = useCartStore();
  const { count: favCount } = useFavoritesStore();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileJoiasOpen, setMobileJoiasOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const megaTimer = useRef<ReturnType<typeof setTimeout>>();
  const nav = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      profileApi.get().then((data: any) => {
        if (data.avatarUrl) setAvatarUrl(data.avatarUrl);
      }).catch(() => {});
    }
  }, [isAuthenticated, setAvatarUrl]);

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

  useEffect(() => {
    return () => { clearTimeout(megaTimer.current); };
  }, []);

  const openMega = useCallback(() => {
    clearTimeout(megaTimer.current);
    megaTimer.current = setTimeout(() => setMegaOpen(true), 150);
  }, []);

  const closeMega = useCallback(() => {
    clearTimeout(megaTimer.current);
    megaTimer.current = setTimeout(() => setMegaOpen(false), 150);
  }, []);

  const keepMega = useCallback(() => {
    clearTimeout(megaTimer.current);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      nav(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setMobileOpen(false);
      setQuery("");
    }
  };

  const initial = user?.preferred_username?.charAt(0).toUpperCase() || "?";

  return (
    <>
      <header className="fixed top-[36px] left-0 right-0 z-50 bg-dark/95 backdrop-blur-md border-b border-gold/10">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-[72px] flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 no-underline shrink-0">
            <span className="font-playfair font-bold text-gold text-2xl tracking-wide">AUREA</span>
            <span className="font-poppins font-light text-text-secondary text-base">Maison</span>
          </Link>

          {/* ─── Desktop Nav ─── */}
          <nav className="hidden lg:flex items-center gap-7">
            {/* JOIAS — mega-dropdown trigger */}
            <div
              className="relative"
              onMouseEnter={openMega}
              onMouseLeave={closeMega}
            >
              <button
                className={`flex items-center gap-1.5 text-[0.8rem] font-medium uppercase tracking-[2px] bg-transparent border-none cursor-pointer pb-1 transition-all duration-200 font-poppins ${
                  megaOpen
                    ? "text-gold border-b border-gold"
                    : "text-text-secondary border-b border-transparent hover:text-gold hover:border-gold"
                }`}
              >
                Joias
                <span
                  className="transition-transform duration-300"
                  style={{ transform: megaOpen ? "rotate(180deg)" : "rotate(0)" }}
                >
                  <ChevronDownIcon size={14} color={megaOpen ? "#c9a962" : "currentColor"} />
                </span>
              </button>
            </div>

            {/* ALIANÇAS & NOIVADO */}
            <Link
              to={catLink(CAT.aliancas)}
              className="text-[0.8rem] font-medium text-text-secondary uppercase tracking-[2px] no-underline pb-1 border-b border-transparent hover:text-gold hover:border-gold transition-all duration-200"
            >
              Alianças & Noivado
            </Link>

            {/* RELÓGIOS */}
            <Link
              to={catLink(CAT.relogios)}
              className="text-[0.8rem] font-medium text-text-secondary uppercase tracking-[2px] no-underline pb-1 border-b border-transparent hover:text-gold hover:border-gold transition-all duration-200"
            >
              Relógios
            </Link>

            {/* PRESENTES */}
            <Link
              to="/search?sort=price_asc"
              className="text-[0.8rem] font-medium text-text-secondary uppercase tracking-[2px] no-underline pb-1 border-b border-transparent hover:text-gold hover:border-gold transition-all duration-200"
            >
              Presentes
            </Link>

            {/* O QUE HÁ DE NOVO */}
            <Link
              to="/search?sort=newest"
              className="relative text-[0.8rem] font-medium text-text-secondary uppercase tracking-[2px] no-underline pb-1 border-b border-transparent hover:text-gold hover:border-gold transition-all duration-200"
            >
              Novidades
              <span className="absolute -top-2.5 -right-8 px-1.5 py-0.5 text-[0.5rem] font-bold uppercase bg-gold text-dark rounded-full leading-none tracking-wider">
                New
              </span>
            </Link>
          </nav>

          {/* ─── Desktop Actions ─── */}
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
            <Link
              to={isAuthenticated ? "/favorites" : "/login"}
              className="relative flex items-center justify-center w-10 h-10 rounded-full text-text-secondary hover:text-gold no-underline transition-colors duration-200"
            >
              <FiHeart size={18} />
              {isAuthenticated && favCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[0.65rem] font-bold leading-none text-dark bg-gold rounded-full">
                  {favCount}
                </span>
              )}
            </Link>

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
                      <Link
                        to="/favorites"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg no-underline text-text-primary text-[0.85rem] hover:bg-gold/10 transition-colors duration-150"
                      >
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#a0a0b0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        Meus Favoritos
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

          {/* ─── Mobile Actions ─── */}
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

        {/* ─── Expandable Search Bar ─── */}
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

        {/* ─── Mega-Dropdown (Desktop) ─── */}
        <div
          className={`hidden lg:block absolute left-0 right-0 bg-dark/[0.98] backdrop-blur-lg border-t border-gold/10 shadow-[0_16px_48px_rgba(0,0,0,0.5)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            megaOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
          style={{ top: "72px" }}
          onMouseEnter={keepMega}
          onMouseLeave={closeMega}
        >
          <div className="max-w-[1400px] mx-auto px-8 py-10">
            <div className="grid grid-cols-3 gap-12">
              {megaColumns.map((column, ci) => (
                <div key={ci} className="flex flex-col gap-8">
                  {column.map((group) => (
                    <div key={group.id}>
                      <Link
                        to={catLink(group.id)}
                        onClick={() => setMegaOpen(false)}
                        className="text-gold text-[0.75rem] font-semibold uppercase tracking-[2px] no-underline hover:text-gold-light transition-colors duration-200 font-poppins"
                      >
                        {group.title}
                      </Link>
                      <div className="w-8 h-px bg-gold/20 mt-2 mb-3" />
                      <div className="flex flex-col gap-2">
                        {group.items.map((item) => (
                          <Link
                            key={item.id}
                            to={catLink(item.id)}
                            onClick={() => setMegaOpen(false)}
                            className="text-text-secondary text-sm no-underline hover:text-gold hover:pl-1 transition-all duration-200 font-poppins"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Mega-dropdown footer */}
            <div className="mt-10 pt-6 border-t border-gold/10 flex items-center justify-between">
              <Link
                to="/search"
                onClick={() => setMegaOpen(false)}
                className="text-gold text-[0.8rem] font-medium no-underline hover:text-gold-light transition-colors duration-200 flex items-center gap-2 font-poppins"
              >
                Ver todas as joias
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Header Spacer */}
      <div className="h-[72px]" />

      {/* ─── Mobile Sidebar Overlay ─── */}
      <div
        className={`fixed inset-0 bg-black/60 z-[60] lg:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* ─── Mobile Sidebar ─── */}
      <div
        className={`fixed top-[36px] right-0 bottom-0 w-[min(300px,85vw)] bg-dark z-[70] lg:hidden border-l border-gold/10 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-y-auto ${
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

        {/* ─── Mobile Nav ─── */}
        <nav className="flex flex-col px-4 py-6 gap-1">
          {/* JOIAS — Expandable */}
          <button
            onClick={() => setMobileJoiasOpen(!mobileJoiasOpen)}
            className="flex items-center justify-between px-4 py-3 text-[0.9rem] font-medium text-text-primary bg-transparent border-none cursor-pointer rounded-lg hover:bg-gold/10 hover:text-gold transition-all duration-200 font-poppins w-full text-left"
          >
            Joias
            <span
              className="transition-transform duration-300"
              style={{ transform: mobileJoiasOpen ? "rotate(180deg)" : "rotate(0)" }}
            >
              <ChevronDownIcon size={16} color={mobileJoiasOpen ? "#c9a962" : "#a0a0b0"} />
            </span>
          </button>

          {/* JOIAS subcategories (expandable) */}
          <div
            className="overflow-hidden transition-all duration-300"
            style={{ maxHeight: mobileJoiasOpen ? 1200 : 0, opacity: mobileJoiasOpen ? 1 : 0 }}
          >
            <div className="pl-2 pb-2 flex flex-col">
              {megaColumns.flat().map((group) => (
                <div key={group.id} className="mb-1">
                  <Link
                    to={catLink(group.id)}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-2 text-[0.78rem] font-semibold text-gold uppercase tracking-wider no-underline block"
                  >
                    {group.title}
                  </Link>
                  {group.items.map((item) => (
                    <Link
                      key={item.id}
                      to={catLink(item.id)}
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-1.5 pl-8 text-[0.8rem] text-text-secondary no-underline block hover:text-gold transition-colors duration-200"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* ALIANÇAS & NOIVADO */}
          <Link
            to={catLink(CAT.aliancas)}
            onClick={() => setMobileOpen(false)}
            className="px-4 py-3 text-[0.9rem] font-medium text-text-primary no-underline rounded-lg hover:bg-gold/10 hover:text-gold transition-all duration-200"
          >
            Alianças & Noivado
          </Link>

          {/* RELÓGIOS */}
          <Link
            to={catLink(CAT.relogios)}
            onClick={() => setMobileOpen(false)}
            className="px-4 py-3 text-[0.9rem] font-medium text-text-primary no-underline rounded-lg hover:bg-gold/10 hover:text-gold transition-all duration-200"
          >
            Relógios
          </Link>

          {/* PRESENTES */}
          <Link
            to="/search?sort=price_asc"
            onClick={() => setMobileOpen(false)}
            className="px-4 py-3 text-[0.9rem] font-medium text-text-primary no-underline rounded-lg hover:bg-gold/10 hover:text-gold transition-all duration-200"
          >
            Presentes
          </Link>

          {/* O QUE HÁ DE NOVO */}
          <Link
            to="/search?sort=newest"
            onClick={() => setMobileOpen(false)}
            className="px-4 py-3 text-[0.9rem] font-medium text-text-primary no-underline rounded-lg hover:bg-gold/10 hover:text-gold transition-all duration-200 flex items-center gap-2"
          >
            Novidades
            <span className="px-1.5 py-0.5 text-[0.55rem] font-bold uppercase bg-gold text-dark rounded-full leading-none tracking-wider">
              New
            </span>
          </Link>
        </nav>

        {/* Sidebar Divider */}
        <div className="mx-6 border-t border-gold/10" />

        {/* ─── Sidebar User Actions ─── */}
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
                to="/favorites"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-[0.85rem] text-text-primary no-underline rounded-lg hover:bg-gold/10 transition-colors duration-200 flex items-center justify-between"
              >
                Meus Favoritos
                {favCount > 0 && (
                  <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[0.65rem] font-bold text-dark bg-gold rounded-full">
                    {favCount}
                  </span>
                )}
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
