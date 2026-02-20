import { useEffect, useState, useRef } from 'react';

const stackCategories = [
  {
    title: 'Backend',
    items: ['C# / .NET 8', 'ASP.NET Core', 'Entity Framework Core', 'Dapper'],
  },
  {
    title: 'Arquitetura',
    items: ['Clean Architecture', 'DDD', 'CQRS', 'Saga Pattern', 'Microsserviços'],
  },
  {
    title: 'Mensageria',
    items: ['Apache Kafka', 'RabbitMQ'],
  },
  {
    title: 'Bancos de Dados',
    items: ['PostgreSQL', 'SQL Server', 'MongoDB', 'Redis'],
  },
  {
    title: 'Frontend',
    items: ['Angular 17', 'React 18', 'TypeScript', 'Tailwind CSS'],
  },
  {
    title: 'DevOps',
    items: ['Docker', 'Docker Compose', 'GitHub Actions', 'Terraform', 'Nginx'],
  },
  {
    title: 'Cloud',
    items: ['AWS (EC2, Route53)', 'Oracle Cloud', 'Cloudflare'],
  },
  {
    title: 'Auth & Observabilidade',
    items: ['Keycloak (OAuth2/OIDC)', 'JWT', 'Seq', 'Serilog', 'Grafana', 'OpenTelemetry'],
  },
  {
    title: 'Testes',
    items: ['xUnit', 'NSubstitute', 'Testcontainers', 'Vitest'],
  },
];

const projects = [
  {
    title: 'KRT Bank — Plataforma Bancária Digital',
    stack: '.NET 8, Angular 17, PostgreSQL, Kafka, RabbitMQ, Redis, Keycloak, Docker',
    points: [
      'Plataforma bancária completa com abertura de contas, PIX (QR Code EMV), Boleto e Cartão de Crédito Virtual',
      'Operações bancárias atômicas (débito/crédito/extrato) com garantia de consistência',
      '10 microsserviços Docker com Gateway (YARP), Rate Limiting e API Key Authentication',
      '145 testes automatizados (unitários + integração)',
      'Comprovantes PDF gerados server-side, QR Code EMV padrão Banco Central',
    ],
    url: 'https://bank.klisteneslima.dev',
  },
  {
    title: 'KLL Platform (AUREA Maison) — E-commerce de Joias de Luxo',
    stack: '.NET 8, React 18, TypeScript, PostgreSQL, MongoDB, Kafka, RabbitMQ, Redis, Keycloak, Docker',
    points: [
      'E-commerce completo com catálogo, carrinho, checkout multi-pagamento (PIX, Boleto, Cartão)',
      'Integração real com plataforma bancária (KRT Bank) via Anti-Corruption Layer (DDD)',
      '15 microsserviços Docker incluindo Gateway, Store, Pay, Logistics e Notifications',
      'Saga Pattern para orquestração de pedidos, Circuit Breaker com Polly',
      '244 testes automatizados (unitários + integração + vitest)',
    ],
    url: 'https://store.klisteneslima.dev',
  },
];

export default function Resume() {
  const [visible, setVisible] = useState(false);
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleDownloadPdf = async () => {
    setGenerating(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;

      const pdfContent = document.createElement('div');
      pdfContent.innerHTML = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6;">
          <div style="border-bottom: 3px solid #0047BB; padding-bottom: 20px; margin-bottom: 24px;">
            <h1 style="font-size: 28px; margin: 0 0 4px 0; color: #1a1a1a;">Klístenes de Lima Leite</h1>
            <p style="font-size: 16px; color: #0047BB; margin: 0 0 12px 0; font-weight: 600;">Engenheiro de Software Sênior .NET</p>
            <p style="font-size: 12px; color: #666; margin: 0;">Cajazeiras, PB, Brasil | klisteneswar3@gmail.com | linkedin.com/in/klistenes-de-lima-leite-257209194 | github.com/KlistenesLima</p>
          </div>

          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 16px; text-transform: uppercase; letter-spacing: 2px; color: #0047BB; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin-bottom: 12px;">Resumo Profissional</h2>
            <p style="font-size: 13px; color: #333;">Engenheiro de Software Sênior com 7 anos de experiência em desenvolvimento de sistemas distribuídos e microsserviços com .NET. Especialista em Clean Architecture, DDD, CQRS e Event-Driven Architecture. Experiência comprovada em construção de plataformas bancárias digitais e e-commerce de alta performance.</p>
          </div>

          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 16px; text-transform: uppercase; letter-spacing: 2px; color: #0047BB; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin-bottom: 12px;">Stack Técnico</h2>
            ${stackCategories.map(cat => `
              <p style="font-size: 12px; margin: 6px 0;"><strong style="color: #333;">${cat.title}:</strong> <span style="color: #555;">${cat.items.join(', ')}</span></p>
            `).join('')}
          </div>

          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 16px; text-transform: uppercase; letter-spacing: 2px; color: #0047BB; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin-bottom: 12px;">Projetos Destaque</h2>
            ${projects.map(p => `
              <div style="margin-bottom: 16px;">
                <h3 style="font-size: 14px; color: #1a1a1a; margin: 0 0 4px 0;">${p.title}</h3>
                <p style="font-size: 11px; color: #0047BB; margin: 0 0 8px 0;">${p.stack}</p>
                <ul style="margin: 0; padding-left: 18px;">
                  ${p.points.map(pt => `<li style="font-size: 12px; color: #444; margin-bottom: 4px;">${pt}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>

          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 16px; text-transform: uppercase; letter-spacing: 2px; color: #0047BB; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin-bottom: 12px;">Formação</h2>
            <p style="font-size: 13px; color: #333;">Bacharelado em Ciência da Computação</p>
          </div>

          <div>
            <h2 style="font-size: 16px; text-transform: uppercase; letter-spacing: 2px; color: #0047BB; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin-bottom: 12px;">Idiomas</h2>
            <p style="font-size: 13px; color: #333;">Português (Nativo) | Inglês (Profissional)</p>
          </div>
        </div>
      `;

      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: 'Klistenes-Lima-Curriculo.pdf',
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      };

      await html2pdf().set(opt).from(pdfContent).save();
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className={`transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`} ref={pdfRef}>
      {/* Header */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-surface/80 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-playfair text-4xl sm:text-5xl text-white mb-2">
            Klístenes de Lima <span className="text-gold">Leite</span>
          </h1>
          <p className="text-gold text-lg font-poppins font-medium mb-6">Engenheiro de Software Sênior .NET</p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              { label: '7 anos exp', icon: '◆' },
              { label: 'Cajazeiras, PB', icon: '◆' },
              { label: 'Disponível', icon: '◆' },
            ].map((badge) => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-surface border border-gold/20 text-text-secondary text-sm font-poppins"
              >
                <span className="text-gold text-[8px]">{badge.icon}</span>
                {badge.label}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={handleDownloadPdf}
              disabled={generating}
              className="px-6 py-3 rounded-xl bg-gold text-dark font-semibold text-sm font-poppins hover:bg-gold-light transition-colors duration-300 disabled:opacity-50 cursor-pointer border-none"
            >
              {generating ? 'Gerando PDF...' : 'Download PDF'}
            </button>
            <a
              href="https://www.linkedin.com/in/klistenes-de-lima-leite-257209194/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl border border-gold/30 text-gold font-semibold text-sm font-poppins hover:bg-gold/10 transition-colors duration-300 no-underline"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/KlistenesLima"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl border border-white/20 text-white font-semibold text-sm font-poppins hover:bg-white/5 transition-colors duration-300 no-underline"
            >
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Resumo Profissional */}
      <section className="py-12 max-w-4xl mx-auto px-4">
        <h2 className="font-playfair text-2xl text-white mb-6">
          Resumo <span className="text-gold">Profissional</span>
        </h2>
        <div className="p-6 rounded-2xl bg-surface/50 border border-gold/10">
          <p className="text-text-secondary leading-relaxed font-poppins text-[15px]">
            Engenheiro de Software Sênior com 7 anos de experiência em desenvolvimento de sistemas distribuídos e microsserviços com .NET.
            Especialista em Clean Architecture, DDD, CQRS e Event-Driven Architecture. Experiência comprovada em construção de plataformas
            bancárias digitais e e-commerce de alta performance.
          </p>
        </div>
      </section>

      {/* Stack Técnico */}
      <section className="py-12 max-w-4xl mx-auto px-4">
        <h2 className="font-playfair text-2xl text-white mb-8">
          Stack <span className="text-gold">Técnico</span>
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stackCategories.map((cat) => (
            <div key={cat.title} className="p-5 rounded-xl bg-surface/50 border border-gold/10">
              <h3 className="text-gold text-sm font-semibold font-poppins uppercase tracking-wider mb-3">{cat.title}</h3>
              <div className="flex flex-wrap gap-2">
                {cat.items.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 rounded-full bg-gold/10 text-text-secondary text-xs font-poppins border border-gold/10 hover:border-gold/30 transition-colors duration-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projetos Destaque */}
      <section className="py-12 max-w-4xl mx-auto px-4">
        <h2 className="font-playfair text-2xl text-white mb-8">
          Projetos <span className="text-gold">Destaque</span>
        </h2>
        <div className="flex flex-col gap-6">
          {projects.map((project, idx) => (
            <div
              key={project.title}
              className="rounded-2xl bg-surface/50 border border-gold/10 overflow-hidden hover:border-gold/30 transition-all duration-300"
            >
              <button
                onClick={() => setExpandedProject(expandedProject === idx ? null : idx)}
                className="w-full text-left p-6 cursor-pointer bg-transparent border-none"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-white text-lg font-semibold font-poppins mb-1">{project.title}</h3>
                    <p className="text-gold/70 text-xs font-poppins">{project.stack}</p>
                  </div>
                  <span className={`text-gold text-xl transition-transform duration-300 shrink-0 ${expandedProject === idx ? 'rotate-180' : ''}`}>
                    ▾
                  </span>
                </div>
              </button>
              <div
                className={`overflow-hidden transition-all duration-500 ${expandedProject === idx ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="px-6 pb-6">
                  <ul className="flex flex-col gap-3">
                    {project.points.map((point, i) => (
                      <li key={i} className="flex items-start gap-3 text-text-secondary text-sm font-poppins">
                        <span className="text-gold mt-1.5 text-[6px]">●</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 px-5 py-2 rounded-lg bg-gold/10 text-gold text-sm font-poppins font-medium hover:bg-gold/20 transition-colors duration-200 no-underline"
                  >
                    Ver projeto ao vivo
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Formação e Idiomas */}
      <section className="py-12 max-w-4xl mx-auto px-4">
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-surface/50 border border-gold/10">
            <h2 className="font-playfair text-2xl text-white mb-4">Formação</h2>
            <p className="text-text-secondary font-poppins">Bacharelado em Ciência da Computação</p>
          </div>
          <div className="p-6 rounded-2xl bg-surface/50 border border-gold/10">
            <h2 className="font-playfair text-2xl text-white mb-4">Idiomas</h2>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm font-poppins">
                <span className="text-text-secondary">Português</span>
                <span className="text-gold">Nativo</span>
              </div>
              <div className="flex justify-between text-sm font-poppins">
                <span className="text-text-secondary">Inglês</span>
                <span className="text-gold">Profissional</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
