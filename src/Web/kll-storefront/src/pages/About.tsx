import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const techStack = [
  { name: '.NET 8', desc: 'Backend principal', color: '#512BD4' },
  { name: 'React 18', desc: 'Frontend storefront', color: '#61DAFB' },
  { name: 'TypeScript', desc: 'Tipagem estática', color: '#3178C6' },
  { name: 'PostgreSQL', desc: 'Banco relacional', color: '#4169E1' },
  { name: 'MongoDB', desc: 'Banco documental', color: '#47A248' },
  { name: 'Redis', desc: 'Cache distribuído', color: '#DC382D' },
  { name: 'Apache Kafka', desc: 'Event streaming', color: '#231F20' },
  { name: 'RabbitMQ', desc: 'Message broker', color: '#FF6600' },
  { name: 'Docker', desc: 'Containerização', color: '#2496ED' },
  { name: 'Keycloak', desc: 'OAuth2 / OIDC', color: '#4D8B31' },
  { name: 'Nginx', desc: 'Reverse proxy', color: '#009639' },
  { name: 'Tailwind CSS', desc: 'Estilização', color: '#06B6D4' },
];

const metrics = [
  { value: '15', label: 'Microsserviços' },
  { value: '244', label: 'Testes Automatizados' },
  { value: '26', label: 'Containers Docker' },
  { value: '5', label: 'APIs REST' },
];

const archNodes = [
  { id: 'storefront', label: 'Storefront\nReact 18', x: 10, y: 15, w: 140, color: '#61DAFB' },
  { id: 'gateway', label: 'Gateway\nYARP', x: 220, y: 15, w: 120, color: '#c9a962' },
  { id: 'store', label: 'Store API\nPostgreSQL', x: 400, y: 0, w: 130, color: '#512BD4' },
  { id: 'pay', label: 'Pay API\nACL (DDD)', x: 400, y: 55, w: 130, color: '#c9a962' },
  { id: 'logistics', label: 'Logistics API\nMongoDB', x: 400, y: 110, w: 130, color: '#47A248' },
  { id: 'krt', label: 'KRT Bank\nPayments', x: 590, y: 55, w: 130, color: '#0047BB' },
  { id: 'infra', label: 'Kafka  |  RabbitMQ  |  Redis', x: 180, y: 155, w: 280, color: '#FF6600' },
  { id: 'auth', label: 'Keycloak  |  Seq', x: 180, y: 200, w: 280, color: '#4D8B31' },
];

export default function About() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Hero */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-surface/80 to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 mb-6">
            <span className="text-gold text-xs font-semibold uppercase tracking-widest font-poppins">Arquitetura do Sistema</span>
          </div>
          <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl text-white mb-4 leading-tight">
            AUREA <span className="text-gold">Maison</span>
          </h1>
          <p className="text-text-secondary text-lg sm:text-xl max-w-2xl mx-auto font-poppins leading-relaxed">
            E-commerce de joias de luxo construído com microsserviços .NET 8
          </p>
        </div>
      </section>

      {/* O que é */}
      <section className="py-16 max-w-5xl mx-auto px-4">
        <h2 className="font-playfair text-3xl text-white mb-8 text-center">
          O que é este <span className="text-gold">projeto</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: 'Case de Portfólio Real',
              text: 'Dois sistemas completos que se comunicam em produção na AWS — não é mockup, é infraestrutura real com 26 containers Docker.',
            },
            {
              title: 'KLL Platform = Shopify',
              text: 'E-commerce completo com catálogo, carrinho, checkout multi-pagamento (PIX, Boleto, Cartão), favoritos e painel admin.',
            },
            {
              title: 'KRT Bank = Stripe + Nubank',
              text: 'Plataforma bancária digital com abertura de conta, PIX (QR Code EMV), Boleto, Cartão Virtual e operações atômicas.',
            },
            {
              title: 'KLL Pay = Anti-Corruption Layer',
              text: 'Camada DDD que integra os dois sistemas — o e-commerce processa pagamentos reais através da plataforma bancária.',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="p-6 rounded-2xl border border-gold/10 bg-surface/50 backdrop-blur-sm hover:border-gold/30 transition-all duration-300"
            >
              <h3 className="text-gold font-poppins font-semibold text-lg mb-2">{card.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Arquitetura */}
      <section className="py-16 max-w-5xl mx-auto px-4">
        <h2 className="font-playfair text-3xl text-white mb-10 text-center">
          Arquitetura do <span className="text-gold">Sistema</span>
        </h2>
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[760px] mx-auto bg-surface/40 border border-gold/10 rounded-2xl p-8">
            <svg viewBox="0 0 760 240" className="w-full" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {/* Connections */}
              <line x1="150" y1="35" x2="220" y2="35" stroke="#c9a962" strokeWidth="2" strokeDasharray="6,3" opacity="0.6" />
              <line x1="340" y1="25" x2="400" y2="20" stroke="#c9a962" strokeWidth="2" strokeDasharray="6,3" opacity="0.6" />
              <line x1="340" y1="35" x2="400" y2="72" stroke="#c9a962" strokeWidth="2" strokeDasharray="6,3" opacity="0.6" />
              <line x1="340" y1="45" x2="400" y2="128" stroke="#c9a962" strokeWidth="2" strokeDasharray="6,3" opacity="0.6" />
              <line x1="530" y1="72" x2="590" y2="72" stroke="#0047BB" strokeWidth="2" strokeDasharray="6,3" opacity="0.8" />
              <line x1="280" y1="55" x2="280" y2="155" stroke="#c9a962" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.4" />
              <line x1="320" y1="200" x2="320" y2="215" stroke="#4D8B31" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.4" />

              {/* Arrow heads */}
              <polygon points="218,32 210,28 210,36" fill="#c9a962" opacity="0.6" />
              <polygon points="528,69 536,65 536,73" fill="#0047BB" opacity="0.8" />
              <polygon points="592,69 584,65 584,73" fill="#0047BB" opacity="0.8" />

              {/* Nodes */}
              {archNodes.map((n) => (
                <g key={n.id}>
                  <rect
                    x={n.x} y={n.y} width={n.w} height={n.id === 'infra' || n.id === 'auth' ? 32 : 40}
                    rx="8" ry="8"
                    fill={n.color + '15'} stroke={n.color} strokeWidth="1.5"
                  />
                  {n.label.split('\n').map((line, i) => (
                    <text
                      key={i}
                      x={n.x + n.w / 2}
                      y={n.y + (n.id === 'infra' || n.id === 'auth' ? 20 : (i === 0 ? 20 : 34))}
                      textAnchor="middle"
                      fill={i === 0 ? '#ffffff' : n.color}
                      fontSize={i === 0 ? '11' : '9'}
                      fontWeight={i === 0 ? '600' : '400'}
                    >
                      {line}
                    </text>
                  ))}
                </g>
              ))}
            </svg>
          </div>
        </div>
      </section>

      {/* Stack Técnico */}
      <section className="py-16 max-w-5xl mx-auto px-4">
        <h2 className="font-playfair text-3xl text-white mb-10 text-center">
          Stack <span className="text-gold">Técnico</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="group p-5 rounded-xl border border-gold/10 bg-surface/50 backdrop-blur-sm hover:border-gold/30 hover:scale-[1.02] transition-all duration-300 text-center"
            >
              <div
                className="w-10 h-10 mx-auto mb-3 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ background: tech.color + '30', border: `1px solid ${tech.color}50` }}
              >
                {tech.name.charAt(0)}
              </div>
              <h4 className="text-white text-sm font-semibold font-poppins mb-1">{tech.name}</h4>
              <p className="text-text-secondary text-xs">{tech.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Números */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-playfair text-3xl text-white mb-10 text-center">
            Em <span className="text-gold">Números</span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="p-6 rounded-xl bg-gradient-to-br from-surface to-surface/50 border border-gold/10 text-center hover:border-gold/30 transition-all duration-300"
              >
                <div className="text-gold text-4xl font-bold font-playfair mb-2">{m.value}</div>
                <div className="text-text-secondary text-sm font-poppins">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Links */}
      <section className="py-16 max-w-5xl mx-auto px-4 text-center">
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="https://bank.klisteneslima.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 rounded-xl bg-[#0047BB] text-white font-semibold text-sm font-poppins hover:bg-[#0055DD] transition-colors duration-300 no-underline"
          >
            Ver KRT Bank
          </a>
          <a
            href="https://github.com/KlistenesLima/kll-platform"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 rounded-xl border border-gold/30 text-gold font-semibold text-sm font-poppins hover:bg-gold/10 transition-colors duration-300 no-underline"
          >
            GitHub
          </a>
          <Link
            to="/resume"
            className="px-8 py-3 rounded-xl bg-gold text-dark font-semibold text-sm font-poppins hover:bg-gold-light transition-colors duration-300 no-underline"
          >
            Currículo
          </Link>
        </div>
      </section>
    </div>
  );
}
