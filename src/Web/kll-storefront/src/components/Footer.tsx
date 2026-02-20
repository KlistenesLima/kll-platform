import { Link } from "react-router-dom";
import { FaInstagram, FaWhatsapp, FaPinterestP } from "react-icons/fa";
import { useState } from "react";
import api from "../services/api";

export default function Footer() {
  const [trackingCode, setTrackingCode] = useState("");
  const [trackResult, setTrackResult] = useState<{ status: string; lastEvent: string } | null>(null);
  const [trackError, setTrackError] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);

  const statusLabel: Record<string, string> = {
    Created: "Criado", Processing: "Processando", InTransit: "Em Transito",
    OutForDelivery: "Saiu para Entrega", Delivered: "Entregue", Returned: "Devolvido",
  };

  const handleTrack = async () => {
    if (!trackingCode.trim()) return;
    setTrackLoading(true);
    setTrackError("");
    setTrackResult(null);
    try {
      const res = await api.get(`/api/v1/shipments/track/${trackingCode.trim()}`);
      const ship = res.data;
      const events = ship.trackingEvents || [];
      const lastEvent = events.length > 0
        ? events[events.length - 1].description
        : "Sem eventos registrados";
      setTrackResult({
        status: statusLabel[ship.status] || ship.status,
        lastEvent,
      });
    } catch {
      setTrackError("Codigo nao encontrado");
    } finally {
      setTrackLoading(false);
    }
  };

  return (
    <footer className="bg-dark/80 border-t border-gold/10">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 pt-16 pb-8">
        {/* Logo centered */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-1.5 mb-4">
            <span className="font-playfair font-bold text-gold text-2xl tracking-wide">AUREA</span>
            <span className="font-poppins font-light text-text-secondary text-lg">Maison</span>
          </div>
          <div className="w-12 h-px bg-gold/30 mx-auto" />
        </div>

        {/* 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Minha Conta */}
          <div>
            <h4 className="text-white text-[0.7rem] font-bold uppercase tracking-[2px] mb-6 font-poppins">
              Minha Conta
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              {[
                ["Meus Pedidos", "/orders"],
                ["Meus Favoritos", "/favorites"],
                ["Meu Perfil", "/profile"],
                ["Meus Enderecos", "/profile/addresses"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="text-[0.85rem] text-text-secondary/60 no-underline hover:text-gold transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categorias */}
          <div>
            <h4 className="text-white text-[0.7rem] font-bold uppercase tracking-[2px] mb-6 font-poppins">
              Categorias
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              {[
                ["Aneis", "/search"],
                ["Colares", "/search"],
                ["Brincos", "/search"],
                ["Pulseiras", "/search"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="text-[0.85rem] text-text-secondary/60 no-underline hover:text-gold transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Rastrear Pedido */}
          <div>
            <h4 className="text-white text-[0.7rem] font-bold uppercase tracking-[2px] mb-6 font-poppins">
              Rastrear Pedido
            </h4>
            <p className="text-[0.85rem] text-text-secondary/60 mb-4 leading-relaxed">
              Insira seu codigo de rastreamento para acompanhar a entrega.
            </p>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Ex: AU2026..."
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                className="flex-1 px-3 py-2.5 bg-surface border border-gold/20 rounded-lg text-[0.85rem] text-white outline-none font-poppins placeholder:text-text-secondary/40 focus:border-gold transition-colors duration-200"
              />
              <button
                onClick={handleTrack}
                disabled={trackLoading}
                className="px-4 py-2.5 bg-gold text-dark font-semibold text-[0.75rem] rounded-lg border-none cursor-pointer font-poppins hover:bg-gold-light transition-colors duration-200 shrink-0"
              >
                {trackLoading ? "..." : "Buscar"}
              </button>
            </div>
            {trackResult && (
              <div className="p-2.5 bg-surface/50 rounded-lg border border-gold/10">
                <p className="text-[0.8rem] text-gold font-semibold">{trackResult.status}</p>
                <p className="text-[0.75rem] text-text-secondary/60 mt-0.5">{trackResult.lastEvent}</p>
              </div>
            )}
            {trackError && (
              <p className="text-[0.8rem] text-red-400 mt-1">{trackError}</p>
            )}
            {/* Atendimento */}
            <div className="mt-6">
              <ul className="list-none p-0 m-0 flex flex-col gap-2 mb-4">
                <li className="text-[0.8rem] text-text-secondary/60">contato@aureamaison.com</li>
                <li className="text-[0.8rem] text-text-secondary/60">(85) 9 9999-9999</li>
                <li className="text-[0.8rem] text-text-secondary/60">Seg-Sex, 9h as 18h</li>
              </ul>
              <div className="flex items-center gap-3">
                {[
                  { Icon: FaInstagram, label: "Instagram" },
                  { Icon: FaWhatsapp, label: "WhatsApp" },
                  { Icon: FaPinterestP, label: "Pinterest" },
                ].map(({ Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-gold/10 text-gold/70 no-underline hover:bg-gold/20 hover:text-gold transition-all duration-200"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white text-[0.7rem] font-bold uppercase tracking-[2px] mb-6 font-poppins">
              Newsletter
            </h4>
            <p className="text-[0.85rem] text-text-secondary/60 mb-4 leading-relaxed">
              Receba novidades e ofertas exclusivas diretamente no seu e-mail.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col gap-2"
            >
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="w-full px-4 py-3 bg-surface border border-gold/20 rounded-lg text-[0.85rem] text-white outline-none font-poppins placeholder:text-text-secondary/40 focus:border-gold transition-colors duration-200"
              />
              <button
                type="submit"
                className="w-full px-4 py-3 bg-gold text-dark font-semibold text-[0.75rem] uppercase tracking-wider rounded-lg border-none cursor-pointer font-poppins hover:bg-gold-light transition-colors duration-200"
              >
                Inscrever-se
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gold/10 mt-12 pt-8 text-center">
          <p className="text-text-secondary/40 text-[0.75rem]">
            &copy; 2026 AUREA Maison. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
