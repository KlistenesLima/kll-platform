import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-dark/80 border-t border-gold/10">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 pt-16 pb-8">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-1.5 mb-4">
            <span className="font-playfair font-bold text-gold text-2xl tracking-wide">AUREA</span>
            <span className="font-poppins font-light text-text-secondary text-lg">Maison</span>
          </div>
          <p className="text-text-secondary/60 text-sm font-poppins">Joalheria de luxo digital — Case de portfólio</p>
          <div className="w-12 h-px bg-gold/30 mx-auto mt-4" />
        </div>

        {/* 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Navegação */}
          <div>
            <h4 className="text-white text-[0.7rem] font-bold uppercase tracking-[2px] mb-6 font-poppins">
              Navegação
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              {[
                ["Joias", "/search"],
                ["Alianças", "/search"],
                ["Relógios", "/search"],
                ["Presentes", "/search"],
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

          {/* Portfólio */}
          <div>
            <h4 className="text-white text-[0.7rem] font-bold uppercase tracking-[2px] mb-6 font-poppins">
              Portfólio
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              <li>
                <Link to="/about" className="text-[0.85rem] text-text-secondary/60 no-underline hover:text-gold transition-colors duration-200">
                  Sobre o Projeto
                </Link>
              </li>
              <li>
                <Link to="/docs" className="text-[0.85rem] text-text-secondary/60 no-underline hover:text-gold transition-colors duration-200">
                  Documentação
                </Link>
              </li>
              <li>
                <Link to="/resume" className="text-[0.85rem] text-text-secondary/60 no-underline hover:text-gold transition-colors duration-200">
                  Currículo
                </Link>
              </li>
              <li>
                <a
                  href="https://bank.klisteneslima.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.85rem] text-text-secondary/60 no-underline hover:text-gold transition-colors duration-200"
                >
                  KRT Bank
                </a>
              </li>
            </ul>
          </div>

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
                ["Meus Endereços", "/profile/addresses"],
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

          {/* Contato */}
          <div>
            <h4 className="text-white text-[0.7rem] font-bold uppercase tracking-[2px] mb-6 font-poppins">
              Contato
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              <li>
                <a
                  href="mailto:klisteneswar2@hotmail.com"
                  className="text-[0.85rem] text-text-secondary/60 no-underline hover:text-gold transition-colors duration-200"
                >
                  klisteneswar2@hotmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/klistenes-de-lima-leite-257209194/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.85rem] text-text-secondary/60 no-underline hover:text-gold transition-colors duration-200"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/KlistenesLima"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.85rem] text-text-secondary/60 no-underline hover:text-gold transition-colors duration-200"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gold/10 mt-12 pt-8 text-center">
          <p className="text-text-secondary/40 text-[0.75rem]">
            &copy; 2026 Klístenes Lima. Projeto de portfólio — nenhuma transação é real.
          </p>
        </div>
      </div>
    </footer>
  );
}
