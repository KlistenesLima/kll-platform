import { Link } from "react-router-dom";
import { FaInstagram, FaWhatsapp, FaPinterestP } from "react-icons/fa";

export default function Footer() {
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
          {/* Institucional */}
          <div>
            <h4 className="text-white text-[0.7rem] font-bold uppercase tracking-[2px] mb-6 font-poppins">
              Institucional
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              {[
                ["Sobre Nós", "/"],
                ["Nossa História", "/"],
                ["Política de Privacidade", "/"],
                ["Termos de Uso", "/"],
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
                ["Anéis", "/search"],
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

          {/* Atendimento */}
          <div>
            <h4 className="text-white text-[0.7rem] font-bold uppercase tracking-[2px] mb-6 font-poppins">
              Atendimento
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3 mb-6">
              <li className="text-[0.85rem] text-text-secondary/60">contato@aureamaison.com</li>
              <li className="text-[0.85rem] text-text-secondary/60">(85) 9 9999-9999</li>
              <li className="text-[0.85rem] text-text-secondary/60">Seg-Sex, 9h às 18h</li>
            </ul>
            {/* Social */}
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
