import { useEffect, useState } from 'react';

const stackCategories = [
  {
    title: 'Backend e Frameworks',
    items: ['.NET Framework', '.NET Core 3.1', '.NET 5', '.NET 7', '.NET 8', 'ASP.NET MVC', 'Web API', 'Minimal APIs', 'Entity Framework Core', 'Dapper', 'LINQ'],
  },
  {
    title: 'Arquitetura e Mensageria',
    items: ['Domain-Driven Design (DDD)', 'Event-Driven Architecture', 'RabbitMQ', 'Apache Kafka', 'REST APIs', 'gRPC', 'Microservices', 'Clean Architecture', 'CQRS', 'Saga Pattern'],
  },
  {
    title: 'Bancos de Dados',
    items: ['SQL Server', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis'],
  },
  {
    title: 'Cloud e DevOps',
    items: ['Microsoft Azure', 'Amazon Web Services (AWS)', 'GitHub Actions', 'Azure DevOps', 'GitLab CI/CD', 'Docker', 'Kubernetes', 'Terraform', 'Nginx'],
  },
  {
    title: 'Frontend e Web',
    items: ['JavaScript', 'TypeScript', 'React', 'Redux', 'Vue.js', 'Angular', 'HTML5', 'CSS3', 'Bootstrap', 'Tailwind CSS'],
  },
  {
    title: 'Auth e Observabilidade',
    items: ['Keycloak (OAuth2/OIDC)', 'JWT', 'Seq', 'Serilog', 'Grafana', 'OpenTelemetry'],
  },
  {
    title: 'Testes',
    items: ['xUnit', 'NSubstitute', 'Testcontainers', 'Vitest'],
  },
];

const experiences = [
  {
    company: 'QINTESS',
    role: 'Senior Software Engineer .NET',
    period: 'Março de 2025 — Atual',
    points: [
      'Liderança técnica na arquitetura e evolução de sistemas críticos governamentais e de saúde de alta disponibilidade',
      'Modelagem e implementação de domínios complexos com DDD, APIs resilientes e workflows assíncronos com RabbitMQ',
      'Definição de práticas arquiteturais, pipelines CI/CD robustos e melhores práticas de engenharia backend',
      'Design e implementação de serviços distribuídos escaláveis com SLA exigentes',
    ],
  },
  {
    company: 'G4F Soluções Corporativas',
    role: 'Senior Software Engineer .NET',
    period: 'Junho de 2022 — Março de 2025',
    points: [
      'Liderança técnica em projetos enterprise complexos, coordenando integração entre sistemas legados e plataformas modernas',
      'Definição e implementação de padrões arquiteturais para toda a organização',
      'Construção e otimização de pipelines CI/CD, reduzindo tempo de deploy',
      'Mentoria de engenheiros juniores e plenos, elevando a maturidade técnica da equipe',
      'Implementação de APIs RESTful e microsserviços com .NET Core',
    ],
  },
  {
    company: 'Afixcode',
    role: 'Software Engineer .NET',
    period: 'Setembro de 2021 — Junho de 2022',
    points: [
      'Desenvolvimento de APIs REST robustas e sistemas SaaS escaláveis com .NET Core',
      'Implementação de arquiteturas orientadas a eventos com RabbitMQ',
      'Criação de interfaces frontend responsivas com React, TypeScript e Redux',
      'Integração com SQL Server, PostgreSQL e MongoDB usando EF Core e Dapper',
    ],
  },
  {
    company: 'Neotriad S/A',
    role: 'Software Engineer .NET',
    period: 'Novembro de 2019 — Junho de 2022',
    points: [
      'Desenvolvimento de sistemas backend corporativos com foco em performance e estabilidade',
      'Implementação de soluções com ASP.NET MVC e Web API',
      'Otimização de queries e modelagem de banco de dados para aplicações críticas',
      'Implementação de testes unitários e de integração',
    ],
  },
  {
    company: 'IBGE',
    role: 'Agente de Pesquisa e Mapeamento',
    period: 'Novembro de 2016 — Novembro de 2019',
    points: [
      'Execução de projetos estatísticos de grande escala e controle de qualidade de dados em nível nacional',
      'Coleta, validação e análise de dados censitários e pesquisas estatísticas em campo',
    ],
  },
];

const education = [
  'Pós-Graduação em Desenvolvimento de Aplicações .NET',
  'Pós-Graduação em Engenharia de Software',
  'Pós-Graduação em Business Intelligence, Big Data e Inteligência Artificial',
  'Pós-Graduação em Administração de Banco de Dados',
  'Pós-Graduação em Ciência de Dados',
  'Pós-Graduação em Desenvolvimento Web',
  'Pós-Graduação em Algoritmos e Estruturas de Dados',
  'Pós-Graduação em Product Management',
  'Tecnólogo em Análise e Desenvolvimento de Sistemas — UNIP',
];

const projects = [
  {
    title: 'KRT Bank — Plataforma Bancária Digital',
    stack: '.NET 8, Angular 17, PostgreSQL, Kafka, RabbitMQ, Redis, Keycloak, Docker, YARP',
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
    stack: '.NET 8, React 18, TypeScript, PostgreSQL, MongoDB, Kafka, RabbitMQ, Redis, Keycloak, Docker, YARP',
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
  const [expandedExp, setExpandedExp] = useState<number | null>(0);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleDownloadPdf = async () => {
    setGenerating(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;

      const stackHtml = stackCategories.map(cat =>
        `<p style="font-size:12px;margin:6px 0;"><strong style="color:#333;">${cat.title}:</strong> <span style="color:#555;">${cat.items.join(', ')}</span></p>`
      ).join('');

      const expHtml = experiences.map(exp =>
        `<div style="margin-bottom:14px;">
          <h3 style="font-size:14px;color:#1a1a1a;margin:0 0 2px;">${exp.company} — ${exp.role}</h3>
          <p style="font-size:11px;color:#0047BB;margin:0 0 6px;font-style:italic;">${exp.period}</p>
          <ul style="margin:0;padding-left:18px;">${exp.points.map(pt => `<li style="font-size:12px;color:#444;margin-bottom:3px;">${pt}</li>`).join('')}</ul>
        </div>`
      ).join('');

      const projHtml = projects.map(p =>
        `<div style="margin-bottom:14px;">
          <h3 style="font-size:14px;color:#1a1a1a;margin:0 0 2px;">${p.title}</h3>
          <p style="font-size:11px;color:#0047BB;margin:0 0 6px;">${p.stack}</p>
          <ul style="margin:0;padding-left:18px;">${p.points.map(pt => `<li style="font-size:12px;color:#444;margin-bottom:3px;">${pt}</li>`).join('')}</ul>
        </div>`
      ).join('');

      const eduHtml = education.map(e => `<li style="font-size:12px;color:#444;margin-bottom:3px;">${e}</li>`).join('');

      const pdfContent = document.createElement('div');
      pdfContent.innerHTML = `
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;padding:40px;max-width:800px;margin:0 auto;line-height:1.5;">
          <div style="border-bottom:3px solid #0047BB;padding-bottom:16px;margin-bottom:20px;">
            <h1 style="font-size:26px;margin:0 0 4px;color:#1a1a1a;">KLÍSTENES DE LIMA LEITE</h1>
            <p style="font-size:14px;color:#0047BB;margin:0 0 8px;font-weight:600;">Senior Full Stack Engineer (.NET) | Sistemas Distribuídos | Arquitetura Backend</p>
            <p style="font-size:11px;color:#666;margin:0;">Itaporanga, PB | (83) 9 8177-9792 | klisteneswar2@hotmail.com | linkedin.com/in/klistenes-de-lima-leite-257209194 | github.com/KlistenesLima</p>
          </div>
          <div style="margin-bottom:18px;">
            <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:2px;color:#0047BB;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:8px;">Resumo Profissional</h2>
            <p style="font-size:12px;color:#333;">Senior Full Stack Engineer com mais de 7 anos de experiência projetando e escalando sistemas distribuídos, APIs críticas e plataformas backend modernas em ambientes enterprise e governamentais. Especialista em Domain-Driven Design (DDD), arquitetura de mensageria, integração de sistemas complexos e desenvolvimento de arquiteturas resilientes e escaláveis.</p>
          </div>
          <div style="margin-bottom:18px;">
            <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:2px;color:#0047BB;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:8px;">Competências Técnicas</h2>
            ${stackHtml}
          </div>
          <div style="margin-bottom:18px;">
            <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:2px;color:#0047BB;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:8px;">Experiência Profissional</h2>
            ${expHtml}
          </div>
          <div style="margin-bottom:18px;">
            <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:2px;color:#0047BB;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:8px;">Projetos Destaque</h2>
            ${projHtml}
          </div>
          <div style="margin-bottom:18px;">
            <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:2px;color:#0047BB;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:8px;">Formação Acadêmica</h2>
            <ul style="margin:0;padding-left:18px;">${eduHtml}</ul>
          </div>
          <div>
            <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:2px;color:#0047BB;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:8px;">Idiomas</h2>
            <p style="font-size:12px;color:#333;">Português (Nativo) | Inglês (Intermediário) | Espanhol (Intermediário)</p>
          </div>
        </div>
      `;

      await html2pdf().set({
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: 'Klistenes-Lima-Curriculo.pdf',
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      }).from(pdfContent).save();
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className={`transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-surface/80 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-playfair text-4xl sm:text-5xl text-white mb-2">
            Klístenes de Lima <span className="text-gold">Leite</span>
          </h1>
          <p className="text-gold text-base sm:text-lg font-poppins font-medium mb-2">Senior Full Stack Engineer (.NET)</p>
          <p className="text-text-secondary text-sm font-poppins mb-6">Sistemas Distribuídos | Arquitetura Backend</p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              { label: '+7 anos exp' },
              { label: 'Itaporanga, PB' },
              { label: 'Disponível' },
            ].map((badge) => (
              <span key={badge.label} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-surface border border-gold/20 text-text-secondary text-sm font-poppins">
                <span className="text-gold text-[8px]">◆</span>
                {badge.label}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={handleDownloadPdf} disabled={generating} className="px-6 py-3 rounded-xl bg-gold text-dark font-semibold text-sm font-poppins hover:bg-gold-light transition-colors duration-300 disabled:opacity-50 cursor-pointer border-none">
              {generating ? 'Gerando PDF...' : 'Download PDF'}
            </button>
            <a href="https://www.linkedin.com/in/klistenes-de-lima-leite-257209194/" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl border border-gold/30 text-gold font-semibold text-sm font-poppins hover:bg-gold/10 transition-colors duration-300 no-underline">
              LinkedIn
            </a>
            <a href="https://github.com/KlistenesLima" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl border border-white/20 text-white font-semibold text-sm font-poppins hover:bg-white/5 transition-colors duration-300 no-underline">
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Resumo */}
      <section className="py-12 max-w-4xl mx-auto px-4">
        <h2 className="font-playfair text-2xl text-white mb-6">Resumo <span className="text-gold">Profissional</span></h2>
        <div className="p-6 rounded-2xl bg-surface/50 border border-gold/10">
          <p className="text-text-secondary leading-relaxed font-poppins text-[15px]">
            Senior Full Stack Engineer com mais de 7 anos de experiência projetando e escalando sistemas distribuídos, APIs críticas e plataformas backend modernas em ambientes enterprise e governamentais. Especialista em Domain-Driven Design (DDD), arquitetura de mensageria, integração de sistemas complexos e desenvolvimento de arquiteturas resilientes e escaláveis. Histórico comprovado na entrega de plataformas que reduzem riscos sistêmicos, melhoram throughput de entregas e elevam padrões de engenharia.
          </p>
        </div>
      </section>

      {/* Stack */}
      <section className="py-12 max-w-4xl mx-auto px-4">
        <h2 className="font-playfair text-2xl text-white mb-8">Competências <span className="text-gold">Técnicas</span></h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stackCategories.map((cat) => (
            <div key={cat.title} className="p-5 rounded-xl bg-surface/50 border border-gold/10">
              <h3 className="text-gold text-sm font-semibold font-poppins uppercase tracking-wider mb-3">{cat.title}</h3>
              <div className="flex flex-wrap gap-2">
                {cat.items.map((item) => (
                  <span key={item} className="px-3 py-1 rounded-full bg-gold/10 text-text-secondary text-xs font-poppins border border-gold/10 hover:border-gold/30 transition-colors duration-200">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Experiência */}
      <section className="py-12 max-w-4xl mx-auto px-4">
        <h2 className="font-playfair text-2xl text-white mb-8">Experiência <span className="text-gold">Profissional</span></h2>
        <div className="flex flex-col gap-4">
          {experiences.map((exp, idx) => (
            <div key={exp.company} className="rounded-2xl bg-surface/50 border border-gold/10 overflow-hidden hover:border-gold/30 transition-all duration-300">
              <button onClick={() => setExpandedExp(expandedExp === idx ? null : idx)} className="w-full text-left p-6 cursor-pointer bg-transparent border-none">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-white text-lg font-semibold font-poppins mb-1">{exp.company}</h3>
                    <p className="text-gold/80 text-sm font-poppins">{exp.role}</p>
                    <p className="text-text-secondary/60 text-xs font-poppins mt-1">{exp.period}</p>
                  </div>
                  <span className={`text-gold text-xl transition-transform duration-300 shrink-0 ${expandedExp === idx ? 'rotate-180' : ''}`}>▾</span>
                </div>
              </button>
              <div className={`overflow-hidden transition-all duration-500 ${expandedExp === idx ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-6 pb-6">
                  <ul className="flex flex-col gap-3">
                    {exp.points.map((point, i) => (
                      <li key={i} className="flex items-start gap-3 text-text-secondary text-sm font-poppins">
                        <span className="text-gold mt-1.5 text-[6px]">●</span>{point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projetos */}
      <section className="py-12 max-w-4xl mx-auto px-4">
        <h2 className="font-playfair text-2xl text-white mb-8">Projetos <span className="text-gold">Destaque</span></h2>
        <div className="flex flex-col gap-6">
          {projects.map((project, idx) => (
            <div key={project.title} className="rounded-2xl bg-surface/50 border border-gold/10 overflow-hidden hover:border-gold/30 transition-all duration-300">
              <button onClick={() => setExpandedProject(expandedProject === idx ? null : idx)} className="w-full text-left p-6 cursor-pointer bg-transparent border-none">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-white text-lg font-semibold font-poppins mb-1">{project.title}</h3>
                    <p className="text-gold/70 text-xs font-poppins">{project.stack}</p>
                  </div>
                  <span className={`text-gold text-xl transition-transform duration-300 shrink-0 ${expandedProject === idx ? 'rotate-180' : ''}`}>▾</span>
                </div>
              </button>
              <div className={`overflow-hidden transition-all duration-500 ${expandedProject === idx ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-6 pb-6">
                  <ul className="flex flex-col gap-3">
                    {project.points.map((point, i) => (
                      <li key={i} className="flex items-start gap-3 text-text-secondary text-sm font-poppins">
                        <span className="text-gold mt-1.5 text-[6px]">●</span>{point}
                      </li>
                    ))}
                  </ul>
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 px-5 py-2 rounded-lg bg-gold/10 text-gold text-sm font-poppins font-medium hover:bg-gold/20 transition-colors duration-200 no-underline">
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
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-surface/50 border border-gold/10">
            <h2 className="font-playfair text-2xl text-white mb-4">Formação Acadêmica</h2>
            <ul className="flex flex-col gap-2">
              {education.map((ed) => (
                <li key={ed} className="flex items-start gap-2 text-text-secondary text-sm font-poppins">
                  <span className="text-gold mt-1.5 text-[6px]">●</span>{ed}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 rounded-2xl bg-surface/50 border border-gold/10">
            <h2 className="font-playfair text-2xl text-white mb-4">Idiomas</h2>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm font-poppins"><span className="text-text-secondary">Português</span><span className="text-gold">Nativo</span></div>
              <div className="flex justify-between text-sm font-poppins"><span className="text-text-secondary">Inglês</span><span className="text-gold">Intermediário</span></div>
              <div className="flex justify-between text-sm font-poppins"><span className="text-text-secondary">Espanhol</span><span className="text-gold">Intermediário</span></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
