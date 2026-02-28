import { useEffect, useState } from 'react';

const stackCategories = [
  { title: '🔧 Backend & Runtime', items: ['C# 12', '.NET 8', 'ASP.NET Core Web API', 'Entity Framework Core 8', 'Dapper', 'LINQ', 'FluentValidation', 'MediatR (CQRS)', 'SignalR (WebSockets)', 'Polly (Resiliência)', 'Hangfire', 'Background Services', 'gRPC'] },
  { title: '🏗️ Arquitetura & Padrões', items: ['Clean Architecture', 'Domain-Driven Design (DDD)', 'CQRS', 'Event-Driven Architecture', 'Saga Pattern (Orquestração + Coreografia)', 'Outbox Pattern', 'Anti-Corruption Layer (ACL)', 'Repository Pattern', 'Unit of Work', 'Specification Pattern', 'Circuit Breaker / Retry / Timeout', 'Event Sourcing', 'API Gateway (YARP)', 'Compensating Transaction'] },
  { title: '🏦 Sistemas Financeiros & Bancários', items: ['Processamento de Pagamentos (PIX / Boleto / Cartão)', 'Transferências em Tempo Real (PIX Instant)', 'Detecção de Fraude (Scoring & Analysis)', 'Geração de QR Code (PIX/EMV)', 'Cartões Virtuais (Luhn / CVV Rotation)', 'Emissão de Boletos', 'Conciliação Bancária', 'KYC (Know Your Customer)', 'Idempotência em Transações', 'Optimistic Concurrency Control'] },
  { title: '🗄️ Banco de Dados', items: ['PostgreSQL 16', 'SQL Server', 'MongoDB 7', 'Redis 7 (Cache & Session)', 'EF Core Migrations', 'Query Optimization / Indexing', 'Transações Distribuídas'] },
  { title: '📨 Mensageria & Event Streaming', items: ['Apache Kafka (Confluent)', 'RabbitMQ (Exchanges / Queues / DLX)', 'Event Bus / Integration Events', 'Dead Letter Queues', 'Idempotent Consumers', 'Kafka Topics & Consumer Groups', 'Message Ordering & Partitioning'] },
  { title: '☁️ Cloud & DevOps', items: ['AWS EC2', 'AWS S3 / Backblaze B2', 'Docker & Docker Compose (26+ containers)', 'Nginx (Reverse Proxy & SSL)', "Let's Encrypt (SSL/TLS)", 'CI/CD Pipelines', 'GitHub Actions', 'Linux Administration (Ubuntu)', 'SSH & Firewall (UFW)'] },
  { title: '🔐 Segurança', items: ['JWT (HS256/RS256)', 'Keycloak 23 (IAM)', 'OAuth 2.0 / OpenID Connect', 'RBAC', 'BCrypt Password Hashing', 'API Key Authentication', 'Rate Limiting & Throttling', 'Security Headers (CSP / HSTS)', 'CORS Configuration', 'Credential Rotation'] },
  { title: '📊 Observabilidade & Logging', items: ['Serilog + Seq', 'OpenTelemetry', 'Grafana Cloud (Tempo / Mimir / Loki)', 'Structured Logging', 'Distributed Tracing', 'Health Checks', 'APM'] },
  { title: '🎨 Frontend', items: ['Angular 17 + Material 17', 'React 18 + TypeScript 5', 'Tailwind CSS 3', 'Material-UI (MUI) v5', 'Zustand', 'TanStack React Query', 'Vite 5', 'Responsive Design (Mobile-First)'] },
  { title: '🧪 Testes', items: ['xUnit / NUnit', 'Integration Tests (WebApplicationFactory)', 'Vitest + React Testing Library', 'Test Containers', 'Moq / NSubstitute', 'TDD / BDD Practices', '244+ testes automatizados'] },
  { title: '🔄 Metodologias & Práticas', items: ['SOLID Principles', 'Design Patterns (GoF)', 'Conventional Commits', 'Git Flow', 'Code Review', 'Agile / Scrum / Kanban', 'API-First Design', 'RESTful API Design', 'Semantic Versioning'] },
];

const experiences = [
  {
    company: 'Projetos Independentes',
    role: 'Senior Software Engineer',
    period: '2024 — Presente',
    points: [
      'Arquitetei e desenvolvi ecossistema completo de fintech: plataforma bancária digital (KRT Bank) + e-commerce de luxo (KLL Platform) integrados via microsserviços',
      'Implementei processamento de pagamentos em tempo real (PIX, Boleto, Cartão) com detecção de fraude, saga pattern para transações distribuídas e compensação automática',
      'Construí infraestrutura de 26 containers Docker em produção na AWS EC2 com PostgreSQL, MongoDB, Redis, Kafka, RabbitMQ, Keycloak e Seq',
      'Desenvolvi 3 frontends (Angular 17 + React 18) com design responsivo, autenticação JWT/Keycloak e RBAC para 5 tipos de usuário',
      'Implementei event-driven architecture com Kafka para integração entre sistemas e RabbitMQ para notificações, garantindo entrega at-least-once via outbox pattern',
      'Conduzi auditoria de segurança completa com remediação de vulnerabilidades críticas, rotação de credenciais e hardening de infraestrutura',
      'Alcancei 244+ testes automatizados (unitários + integração) com cobertura de domínio, handlers e APIs',
    ],
  },
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
    stack: '.NET 8, PostgreSQL, Redis, Kafka, RabbitMQ, SignalR, Keycloak, Angular 17',
    points: [
      'Banco digital completo com contas, PIX, boletos, cartões virtuais',
      'Saga pattern para transferências PIX com análise de fraude em tempo real',
      'Dashboard admin com métricas via SignalR (WebSocket)',
      'API RESTful com rate limiting, health checks e observabilidade via OpenTelemetry',
    ],
    url: 'https://bank.klisteneslima.dev',
  },
  {
    title: 'KLL Platform — E-commerce de Luxo (AUREA Maison)',
    stack: '.NET 8, PostgreSQL, MongoDB, Kafka, RabbitMQ, React 18, Tailwind CSS',
    points: [
      '3 microsserviços (Store, Pay, Logistics) + 3 frontends',
      'Anti-Corruption Layer para integração com sistema bancário',
      'Saga de pedidos: reserva de estoque → pagamento → entrega',
      'Admin dashboard com MUI Data Grid e React Query',
    ],
    url: 'https://store.klisteneslima.dev',
  },
  {
    title: 'Infraestrutura Cloud (AWS)',
    stack: 'AWS EC2, Docker Compose, Nginx, Let\'s Encrypt, GitHub Actions',
    points: [
      '26 containers em produção com limites de memória otimizados (~4GB total)',
      'SSL/TLS automático via certbot para 5 domínios personalizados',
      'Reverse proxy Nginx para roteamento de múltiplos serviços',
      'Deploy automatizado com scripts bash e git workflow',
    ],
    url: 'https://github.com/KlistenesLima',
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
            <p style="font-size:14px;color:#0047BB;margin:0 0 8px;font-weight:600;">Senior Software Engineer | .NET Specialist</p>
            <p style="font-size:11px;color:#666;margin:0;">João Pessoa, PB | (83) 9 8177-9792 | klisteneswar2@hotmail.com | linkedin.com/in/klisteneslima | github.com/KlistenesLima</p>
          </div>
          <div style="margin-bottom:18px;">
            <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:2px;color:#0047BB;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:8px;">Resumo Profissional</h2>
            <p style="font-size:12px;color:#333;">Engenheiro de Software Sênior com 7+ anos de experiência em desenvolvimento de sistemas distribuídos de alta performance. Especialista em ecossistemas .NET e arquitetura de microsserviços para o setor financeiro e bancário. Experiência comprovada na construção de plataformas bancárias digitais completas com processamento de pagamentos em tempo real, detecção de fraude e conformidade regulatória.</p>
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
          <img src="/foto-perfil.png" alt="Klístenes Lima" className="w-[120px] h-[120px] sm:w-[160px] sm:h-[160px] rounded-full object-cover object-top border-[3px] border-gold/50 shadow-[0_8px_32px_rgba(0,0,0,0.3)] mx-auto mb-6" />
          <h1 className="font-playfair text-4xl sm:text-5xl text-white mb-2">
            Klístenes de Lima <span className="text-gold">Leite</span>
          </h1>
          <p className="text-gold text-base sm:text-lg font-poppins font-medium mb-2">Senior Software Engineer | .NET Specialist</p>
          <p className="text-text-secondary text-sm font-poppins mb-6">Sistemas Distribuídos | Arquitetura Backend | Microsserviços</p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              { label: '+7 anos exp' },
              { label: 'João Pessoa, PB' },
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
            Engenheiro de Software Sênior com 7+ anos de experiência em desenvolvimento de sistemas distribuídos de alta performance. Especialista em ecossistemas .NET e arquitetura de microsserviços para o setor financeiro e bancário. Experiência comprovada na construção de plataformas bancárias digitais completas com processamento de pagamentos em tempo real, detecção de fraude e conformidade regulatória. Apaixonado por Clean Architecture, Domain-Driven Design e práticas de engenharia que garantem escalabilidade, resiliência e segurança.
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
