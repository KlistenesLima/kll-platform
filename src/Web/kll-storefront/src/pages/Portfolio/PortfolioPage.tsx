import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";

/* ------------------------------------------------------------------ */
/*  Inline SVG Icons                                                   */
/* ------------------------------------------------------------------ */
const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

const GradCapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5"/>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
  </svg>
);

const ChevronUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m18 15-6-6-6 6"/>
  </svg>
);

const ContainerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 2H8l-2 5h12z"/><path d="M12 12v5"/>
  </svg>
);

const TestIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);

const MicroserviceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
  </svg>
);

/* ------------------------------------------------------------------ */
/*  CSS Keyframes (injected once)                                      */
/* ------------------------------------------------------------------ */
const STYLE_ID = "portfolio-keyframes";

const injectStyles = () => {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(40px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-12px); }
    }
    @keyframes pulse-gold {
      0%, 100% { box-shadow: 0 0 0 0 rgba(201,169,98,0.4); }
      50%      { box-shadow: 0 0 0 12px rgba(201,169,98,0); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes gradientShift {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }
    @keyframes orbit {
      from { transform: rotate(0deg) translateX(140px) rotate(0deg); }
      to   { transform: rotate(360deg) translateX(140px) rotate(-360deg); }
    }
    @keyframes orbitReverse {
      from { transform: rotate(0deg) translateX(100px) rotate(0deg); }
      to   { transform: rotate(-360deg) translateX(100px) rotate(360deg); }
    }
    .reveal-hidden {
      opacity: 0;
      transform: translateY(40px);
      transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .reveal-visible {
      opacity: 1;
      transform: translateY(0);
    }
    .badge-hover {
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .badge-hover:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(201,169,98,0.2);
      border-color: #c9a962;
      color: #c9a962;
    }
    .card-hover {
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .card-hover:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 60px rgba(201,169,98,0.12);
      border-color: rgba(201,169,98,0.5);
    }
    .timeline-dot {
      transition: all 0.3s ease;
    }
    .timeline-dot:hover {
      transform: scale(1.3);
      box-shadow: 0 0 20px rgba(201,169,98,0.5);
    }
    .social-btn {
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .social-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(201,169,98,0.3);
      background: #c9a962;
      color: #0f0f1a;
      border-color: #c9a962;
    }
    .hero-geometric {
      position: absolute;
      border: 1px solid rgba(201,169,98,0.08);
      border-radius: 4px;
    }
    .nav-blur {
      backdrop-filter: blur(16px) saturate(180%);
      -webkit-backdrop-filter: blur(16px) saturate(180%);
    }
    .project-card-glow::before {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: inherit;
      background: linear-gradient(135deg, rgba(201,169,98,0.3), transparent 50%, rgba(201,169,98,0.1));
      z-index: -1;
      opacity: 0;
      transition: opacity 0.4s ease;
    }
    .project-card-glow:hover::before {
      opacity: 1;
    }
    .text-gradient-gold {
      background: linear-gradient(135deg, #c9a962 0%, #d4b87a 40%, #e8d5a3 60%, #c9a962 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: shimmer 4s linear infinite;
    }
  `;
  document.head.appendChild(style);
};

/* ------------------------------------------------------------------ */
/*  Hook: scroll-reveal via IntersectionObserver                       */
/* ------------------------------------------------------------------ */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("reveal-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

/* ------------------------------------------------------------------ */
/*  Hook: animated counter                                             */
/* ------------------------------------------------------------------ */
function useAnimatedCounter(end: number, duration = 2000, suffix = "") {
  const [display, setDisplay] = useState("0" + suffix);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * end);
            setDisplay(current + suffix);
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration, suffix]);

  return { ref, display };
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const TITLES = [
  "Senior Software Engineer | .NET Specialist",
  "Sistemas Distribuidos",
  "Arquitetura Backend",
  "Domain-Driven Design",
  "Cloud & Microservices",
];

const TECH_STACK = [
  {
    title: "Backend & Runtime",
    items: ["C# 12", ".NET 8", "ASP.NET Core", "EF Core 8", "Dapper", "MediatR", "SignalR", "Polly", "Hangfire", "gRPC"],
  },
  {
    title: "Architecture",
    items: ["Clean Architecture", "DDD", "CQRS", "Event-Driven", "Saga Pattern", "Outbox Pattern", "ACL", "Event Sourcing", "API Gateway (YARP)"],
  },
  {
    title: "Financial Systems",
    items: ["PIX / Boleto / Cartão", "Fraud Detection", "QR Code EMV", "Virtual Cards", "KYC", "Conciliação"],
  },
  {
    title: "Messaging",
    items: ["Apache Kafka", "RabbitMQ", "Event Bus", "Dead Letter Queues", "Idempotent Consumers"],
  },
  {
    title: "Databases",
    items: ["PostgreSQL 16", "SQL Server", "MongoDB 7", "Redis 7"],
  },
  {
    title: "Cloud & DevOps",
    items: ["AWS EC2", "Docker (26+)", "Nginx", "GitHub Actions", "Linux / Ubuntu", "Let's Encrypt"],
  },
  {
    title: "Security",
    items: ["JWT", "Keycloak 23", "OAuth 2.0 / OIDC", "RBAC", "Rate Limiting"],
  },
  {
    title: "Frontend",
    items: ["Angular 17", "React 18", "TypeScript 5", "Tailwind CSS", "MUI v5", "Zustand"],
  },
];

interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  current: boolean;
  bullets: string[];
}

const EXPERIENCE: ExperienceItem[] = [
  {
    company: "Projetos Independentes",
    role: "Senior Software Engineer",
    period: "2024 - Presente",
    current: true,
    bullets: [
      "Ecossistema fintech completo: KRT Bank + KLL Platform integrados via microsservicos",
      "Processamento de pagamentos em tempo real (PIX, Boleto, Cartao) com saga pattern",
      "26 containers Docker em producao na AWS EC2",
      "3 frontends (Angular 17 + React 18) com RBAC para 5 tipos de usuario",
      "Event-driven architecture com Kafka + RabbitMQ e outbox pattern",
      "Auditoria de seguranca completa e 244+ testes automatizados",
    ],
  },
  {
    company: "Qintess",
    role: "Senior Software Engineer .NET",
    period: "Mar 2025 - Atual",
    current: false,
    bullets: [
      "Lideranca tecnica na arquitetura e evolucao de sistemas criticos governamentais e de saude",
      "Modelagem DDD, APIs resilientes, workflows de mensageria assincrona com RabbitMQ",
      "Definicao de praticas arquiteturais, pipelines CI/CD, padroes de engenharia backend",
      "Reducao de acoplamento sistemico via refatoracoes arquiteturais estrategicas",
      "Design de servicos distribuidos escalaveis com SLA exigentes",
    ],
  },
  {
    company: "G4F Solucoes Corporativas",
    role: "Senior Software Engineer .NET",
    period: "Jun 2022 - Mar 2025",
    current: false,
    bullets: [
      "Lideranca tecnica em projetos enterprise, integracao entre sistemas legados e modernos",
      "Definicao de padroes arquiteturais para toda a organizacao",
      "Pipelines CI/CD, reducao de tempo de deploy",
      "Mentoria de engenheiros juniores e plenos (code reviews, pair programming)",
      "APIs RESTful e microsservicos com .NET Core",
    ],
  },
  {
    company: "Afixcode",
    role: "Software Engineer .NET",
    period: "Set 2021 - Jun 2022",
    current: false,
    bullets: [
      "APIs REST robustas e sistemas SaaS com .NET Core",
      "Arquiteturas orientadas a eventos com RabbitMQ",
      "Frontend com React, TypeScript, Redux",
      "Bancos SQL Server, PostgreSQL, MongoDB com EF Core e Dapper",
    ],
  },
  {
    company: "Neotriad S/A",
    role: "Software Engineer .NET",
    period: "Nov 2019 - Jun 2022",
    current: false,
    bullets: [
      "Sistemas backend corporativos com foco em performance",
      "ASP.NET MVC e Web API",
      "Otimizacao de queries e modelagem de banco",
      "Testes unitarios e de integracao",
    ],
  },
  {
    company: "IBGE",
    role: "Agente de Pesquisa e Mapeamento",
    period: "Nov 2016 - Nov 2019",
    current: false,
    bullets: [
      "Projetos estatisticos de grande escala",
      "Coleta, validacao e analise de dados censitarios",
    ],
  },
];

const EDUCATION = [
  "Pos-Graduacao em Desenvolvimento de Aplicacoes .NET",
  "Pos-Graduacao em Engenharia de Software",
  "Pos-Graduacao em Business Intelligence, Big Data e IA",
  "Pos-Graduacao em Administracao de Banco de Dados",
  "Pos-Graduacao em Ciencia de Dados",
  "Pos-Graduacao em Desenvolvimento Web",
  "Pos-Graduacao em Algoritmos e Estruturas de Dados",
  "Pos-Graduacao em Product Management",
  "Tecnologo em Analise e Desenvolvimento de Sistemas — UNIP",
];

/* ------------------------------------------------------------------ */
/*  Sub-components (to avoid hooks-in-callbacks)                       */
/* ------------------------------------------------------------------ */
function SectionHeading({ children, id }: { children: React.ReactNode; id?: string }) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} id={id} className="reveal-hidden mb-12 md:mb-16 text-center">
      <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
        {children}
      </h2>
      <div className="mx-auto w-20 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
    </div>
  );
}

function RevealBlock({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={`reveal-hidden ${className}`} style={style}>
      {children}
    </div>
  );
}

function StatCard({ counterRef, value, label, delay }: { counterRef: React.Ref<HTMLSpanElement>; value: string; label: string; delay: number }) {
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      className="reveal-hidden bg-surface/80 border border-white/5 rounded-xl p-5 text-center"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <span
        ref={counterRef}
        className="text-2xl md:text-3xl font-bold text-gradient-gold font-playfair block mb-1"
      >
        {value}
      </span>
      <span className="text-text-secondary text-xs md:text-sm">{label}</span>
    </div>
  );
}

function TechCategory({ category, delay }: { category: { title: string; items: string[] }; delay: number }) {
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      className="reveal-hidden bg-surface/60 border border-white/5 rounded-2xl p-6 card-hover"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <h3 className="font-playfair text-lg md:text-xl font-semibold text-white mb-4">
        {category.title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {category.items.map((item) => (
          <span
            key={item}
            className="badge-hover px-3 py-1.5 text-xs md:text-sm rounded-lg bg-dark/80 border border-white/10 text-text-secondary"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function ExperienceCard({ exp, delay }: { exp: ExperienceItem; delay: number }) {
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      className="reveal-hidden relative pl-12 md:pl-16"
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Timeline dot */}
      <div
        className={`timeline-dot absolute left-2.5 md:left-4 top-1.5 w-3.5 h-3.5 rounded-full border-2 ${
          exp.current
            ? "bg-gold border-gold shadow-[0_0_12px_rgba(201,169,98,0.5)]"
            : "bg-dark border-gold/40"
        }`}
      />

      {/* Content */}
      <div className="bg-surface/40 border border-white/5 rounded-2xl p-5 md:p-7 card-hover">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-playfair text-lg md:text-xl font-semibold text-white">
              {exp.company}
            </h3>
            <p className="text-gold-light text-sm md:text-base">{exp.role}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-secondary text-xs md:text-sm whitespace-nowrap">
              {exp.period}
            </span>
            {exp.current && (
              <span className="px-2.5 py-0.5 text-xs rounded-full bg-gold/15 text-gold border border-gold/30 font-medium">
                Atual
              </span>
            )}
          </div>
        </div>
        <ul className="space-y-2">
          {exp.bullets.map((bullet, j) => (
            <li
              key={j}
              className="text-text-secondary text-sm md:text-base flex items-start gap-2"
            >
              <span className="w-1 h-1 rounded-full bg-gold/60 mt-2.5 flex-shrink-0" />
              {bullet}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function EducationItem({ item, delay }: { item: string; delay: number }) {
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      className="reveal-hidden flex items-start gap-3 md:gap-4 bg-surface/30 border border-white/5 rounded-xl p-4 md:p-5 card-hover"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="mt-0.5 text-gold flex-shrink-0">
        <GradCapIcon />
      </div>
      <span className="text-text-secondary text-sm md:text-base">{item}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function PortfolioPage() {
  /* --- Typing effect --- */
  const [titleIndex, setTitleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    injectStyles();
  }, []);

  useEffect(() => {
    const current = TITLES[titleIndex];
    const speed = isDeleting ? 35 : 65;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setTypedText(current.slice(0, charIndex + 1));
        setCharIndex((p) => p + 1);
        if (charIndex + 1 === current.length) {
          setTimeout(() => setIsDeleting(true), 1800);
        }
      } else {
        setTypedText(current.slice(0, charIndex - 1));
        setCharIndex((p) => p - 1);
        if (charIndex - 1 === 0) {
          setIsDeleting(false);
          setTitleIndex((p) => (p + 1) % TITLES.length);
        }
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, titleIndex]);

  /* --- Scroll to top --- */
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* --- Sticky nav active section --- */
  const [activeSection, setActiveSection] = useState("hero");
  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: "-80px 0px -40% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  /* --- Animated counters --- */
  const years = useAnimatedCounter(7, 2000, "+");
  const systems = useAnimatedCounter(2, 1500);
  const containers = useAnimatedCounter(26, 2200);
  const tests = useAnimatedCounter(389, 2500);

  /* --- Nav items --- */
  const NAV_ITEMS = [
    { id: "about", label: "Sobre" },
    { id: "stack", label: "Stack" },
    { id: "experience", label: "Experiencia" },
    { id: "projects", label: "Projetos" },
    { id: "education", label: "Formacao" },
    { id: "contact", label: "Contato" },
  ];

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="bg-dark min-h-screen font-poppins text-text-primary overflow-x-hidden">
      {/* ============================================================ */}
      {/*  FLOATING NAV                                                 */}
      {/* ============================================================ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 nav-blur bg-dark/80 border-b border-white/5"
        style={{ transition: "all 0.3s ease" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14 md:h-16">
          <Link
            to="/"
            className="flex items-center gap-2 text-text-secondary hover:text-gold transition-colors text-sm"
          >
            <ArrowLeftIcon />
            <span className="hidden sm:inline">Voltar a Loja</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`text-xs md:text-sm px-2 py-1 rounded-md transition-all duration-300 ${
                  activeSection === item.id
                    ? "text-gold bg-gold/10"
                    : "text-text-secondary hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ============================================================ */}
      {/*  HERO                                                         */}
      {/* ============================================================ */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
        style={{
          background: "linear-gradient(135deg, #0a0a14 0%, #0f0f1a 40%, #141428 70%, #0f0f1a 100%)",
        }}
      >
        {/* Geometric patterns */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Grid dots */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, #c9a962 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          {/* Floating geometric shapes */}
          <div
            className="hero-geometric absolute w-40 h-40 top-[15%] left-[10%] opacity-30"
            style={{
              transform: "rotate(45deg)",
              animation: "float 8s ease-in-out infinite",
              borderColor: "rgba(201,169,98,0.1)",
            }}
          />
          <div
            className="hero-geometric absolute w-24 h-24 top-[60%] right-[15%] opacity-20"
            style={{
              transform: "rotate(30deg)",
              animation: "float 6s ease-in-out infinite 1s",
              borderColor: "rgba(201,169,98,0.08)",
              borderRadius: "50%",
            }}
          />
          <div
            className="hero-geometric absolute w-32 h-32 bottom-[20%] left-[20%] opacity-15"
            style={{
              transform: "rotate(60deg)",
              animation: "float 10s ease-in-out infinite 2s",
              borderColor: "rgba(201,169,98,0.06)",
            }}
          />
          <div
            className="absolute w-16 h-16 top-[30%] right-[25%] opacity-20 rounded-full"
            style={{
              border: "1px solid rgba(201,169,98,0.1)",
              animation: "float 7s ease-in-out infinite 0.5s",
            }}
          />
          {/* Radial gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(201,169,98,0.04) 0%, transparent 70%)",
            }}
          />
          {/* Orbiting dots */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div
              className="w-2 h-2 bg-gold/20 rounded-full absolute"
              style={{ animation: "orbit 20s linear infinite" }}
            />
            <div
              className="w-1.5 h-1.5 bg-gold/15 rounded-full absolute"
              style={{ animation: "orbitReverse 15s linear infinite" }}
            />
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Avatar */}
          <div
            className="mx-auto mb-8 w-28 h-28 md:w-36 md:h-36 rounded-full relative"
            style={{ animation: "fadeIn 1s ease-out forwards" }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "linear-gradient(135deg, #c9a962, #0f0f1a, #c9a962)",
                backgroundSize: "200% 200%",
                animation: "gradientShift 4s ease infinite",
                padding: "3px",
              }}
            >
              <div className="w-full h-full rounded-full bg-surface flex items-center justify-center overflow-hidden">
                <img src="/foto-perfil.png" alt="Klístenes Lima" className="w-full h-full object-cover object-top" />
              </div>
            </div>
            <div
              className="absolute -inset-2 rounded-full opacity-30"
              style={{ animation: "pulse-gold 3s ease-in-out infinite" }}
            />
          </div>

          {/* Name */}
          <h1
            className="font-playfair text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4"
            style={{ animation: "fadeInUp 0.8s ease-out 0.2s both" }}
          >
            <span className="text-gradient-gold">Klistenes de Lima Leite</span>
          </h1>

          {/* Typing title */}
          <div
            className="h-8 md:h-10 flex items-center justify-center mb-6"
            style={{ animation: "fadeIn 1s ease-out 0.6s both" }}
          >
            <span className="text-gold-light text-base md:text-xl font-light tracking-wide font-poppins">
              {typedText}
            </span>
            <span
              className="inline-block w-0.5 h-5 md:h-6 bg-gold ml-1"
              style={{ animation: "blink 1s step-end infinite" }}
            />
          </div>

          {/* Location */}
          <div
            className="flex items-center justify-center gap-2 text-text-secondary text-sm mb-8"
            style={{ animation: "fadeIn 1s ease-out 0.8s both" }}
          >
            <LocationIcon />
            <span>Joao Pessoa, PB</span>
          </div>

          {/* Social links */}
          <div
            className="flex items-center justify-center gap-3 sm:gap-4 mb-12"
            style={{ animation: "fadeInUp 0.8s ease-out 1s both" }}
          >
            <a
              href="https://www.linkedin.com/in/klistenes-de-lima-leite-257209194/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-text-secondary"
              aria-label="LinkedIn"
            >
              <LinkedInIcon />
            </a>
            <a
              href="https://github.com/KlistenesLima"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-text-secondary"
              aria-label="GitHub"
            >
              <GitHubIcon />
            </a>
            <a
              href="mailto:klisteneswar2@hotmail.com"
              className="social-btn w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-text-secondary"
              aria-label="Email"
            >
              <EmailIcon />
            </a>
            <a
              href="tel:+5583981779792"
              className="social-btn w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-text-secondary"
              aria-label="Phone"
            >
              <PhoneIcon />
            </a>
          </div>

          {/* Scroll indicator */}
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            style={{ animation: "fadeIn 1s ease-out 1.5s both" }}
          >
            <button
              onClick={() => scrollTo("about")}
              className="flex flex-col items-center gap-2 text-text-secondary/50 hover:text-gold transition-colors"
            >
              <span className="text-xs tracking-widest uppercase">Scroll</span>
              <div className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center p-1">
                <div
                  className="w-1 h-2 bg-gold rounded-full"
                  style={{ animation: "float 2s ease-in-out infinite" }}
                />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  ABOUT                                                        */}
      {/* ============================================================ */}
      <section id="about" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <SectionHeading>Sobre Mim</SectionHeading>

          <div className="grid md:grid-cols-5 gap-10 md:gap-16 items-start">
            {/* Summary text */}
            <div className="md:col-span-3">
              <RevealBlock>
                <p className="text-text-secondary text-base md:text-lg leading-relaxed mb-6">
                  Senior Full Stack Engineer com mais de{" "}
                  <span className="text-gold font-medium">7 anos de experiencia</span> projetando e
                  escalando sistemas distribuidos, APIs criticas e plataformas backend modernas em
                  ambientes enterprise e governamentais.
                </p>
                <p className="text-text-secondary text-base md:text-lg leading-relaxed">
                  Especialista em{" "}
                  <span className="text-gold font-medium">Domain-Driven Design (DDD)</span>,
                  arquitetura de mensageria, integracao de sistemas complexos e desenvolvimento de
                  arquiteturas resilientes e escalaveis.
                </p>
              </RevealBlock>
            </div>

            {/* Stats */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <StatCard counterRef={years.ref} value={years.display} label="Anos de Exp." delay={0} />
              <StatCard counterRef={systems.ref} value={systems.display} label="Sistemas" delay={100} />
              <StatCard counterRef={containers.ref} value={containers.display} label="Containers" delay={200} />
              <StatCard counterRef={tests.ref} value={tests.display} label="Testes" delay={300} />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  TECH STACK                                                   */}
      {/* ============================================================ */}
      <section
        id="stack"
        className="py-20 md:py-28 px-4 sm:px-6 lg:px-8"
        style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(26,26,46,0.5) 30%, rgba(26,26,46,0.5) 70%, transparent 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <SectionHeading>Tech Stack</SectionHeading>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TECH_STACK.map((category, i) => (
              <TechCategory key={category.title} category={category} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  EXPERIENCE                                                   */}
      {/* ============================================================ */}
      <section id="experience" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <SectionHeading>Experiencia</SectionHeading>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-6 top-0 bottom-0 w-px bg-gradient-to-b from-gold/50 via-gold/20 to-transparent" />

            <div className="space-y-10 md:space-y-14">
              {EXPERIENCE.map((exp, i) => (
                <ExperienceCard key={i} exp={exp} delay={i * 100} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  PROJECTS                                                     */}
      {/* ============================================================ */}
      <section
        id="projects"
        className="py-20 md:py-28 px-4 sm:px-6 lg:px-8"
        style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(26,26,46,0.5) 30%, rgba(26,26,46,0.5) 70%, transparent 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <SectionHeading>Projetos</SectionHeading>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-10">
            {/* KLL Platform */}
            <RevealBlock className="project-card-glow relative bg-surface/60 border border-white/5 rounded-2xl p-6 md:p-8 card-hover overflow-hidden">
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                <div
                  className="w-full h-full"
                  style={{
                    background: "linear-gradient(135deg, #c9a962, transparent)",
                    borderRadius: "0 1rem 0 100%",
                  }}
                />
              </div>

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-playfair text-xl md:text-2xl font-bold text-white mb-1">
                      KLL Platform
                    </h3>
                    <p className="text-gold-light text-sm">AUREA Maison</p>
                  </div>
                  <a
                    href="https://github.com/KlistenesLima/kll-platform"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-btn w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-text-secondary"
                    aria-label="GitHub KLL Platform"
                  >
                    <GitHubIcon />
                  </a>
                </div>

                <p className="text-text-secondary text-sm md:text-base mb-5">
                  E-commerce de Joias de Luxo — plataforma completa com microservicos, mensageria e
                  orquestracao de pagamentos.
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-dark/60 rounded-lg p-3 text-center border border-white/5">
                    <div className="flex items-center justify-center gap-1.5 text-gold mb-1">
                      <ContainerIcon />
                      <span className="font-semibold text-lg">15</span>
                    </div>
                    <span className="text-text-secondary text-xs">Containers</span>
                  </div>
                  <div className="bg-dark/60 rounded-lg p-3 text-center border border-white/5">
                    <div className="flex items-center justify-center gap-1.5 text-gold mb-1">
                      <TestIcon />
                      <span className="font-semibold text-lg">244</span>
                    </div>
                    <span className="text-text-secondary text-xs">Testes</span>
                  </div>
                  <div className="bg-dark/60 rounded-lg p-3 text-center border border-white/5">
                    <div className="flex items-center justify-center gap-1.5 text-gold mb-1">
                      <MicroserviceIcon />
                      <span className="font-semibold text-lg">5</span>
                    </div>
                    <span className="text-text-secondary text-xs">Microservicos</span>
                  </div>
                </div>

                {/* Microservices list */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {["Gateway", "Store", "Pay", "Logistics", "Admin"].map((ms) => (
                    <span key={ms} className="px-2 py-0.5 text-xs rounded bg-gold/10 text-gold border border-gold/20">
                      {ms}
                    </span>
                  ))}
                </div>

                {/* Tech badges */}
                <div className="flex flex-wrap gap-1.5">
                  {[".NET 8", "React", "TypeScript", "PostgreSQL", "Redis", "RabbitMQ", "Kafka", "Docker", "CQRS", "MediatR"].map(
                    (tech) => (
                      <span key={tech} className="badge-hover px-2 py-1 text-xs rounded bg-dark/80 border border-white/10 text-text-secondary">
                        {tech}
                      </span>
                    )
                  )}
                </div>
              </div>
            </RevealBlock>

            {/* KRT Bank */}
            <RevealBlock
              className="project-card-glow relative bg-surface/60 border border-white/5 rounded-2xl p-6 md:p-8 card-hover overflow-hidden"
              style={{ transitionDelay: "150ms" }}
            >
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                <div
                  className="w-full h-full"
                  style={{
                    background: "linear-gradient(135deg, #c9a962, transparent)",
                    borderRadius: "0 1rem 0 100%",
                  }}
                />
              </div>

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-playfair text-xl md:text-2xl font-bold text-white mb-1">
                      KRT Bank
                    </h3>
                    <p className="text-gold-light text-sm">Plataforma Bancaria Digital</p>
                  </div>
                  <a
                    href="https://github.com/KlistenesLima/krt-bank"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-btn w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-text-secondary"
                    aria-label="GitHub KRT Bank"
                  >
                    <GitHubIcon />
                  </a>
                </div>

                <p className="text-text-secondary text-sm md:text-base mb-5">
                  Plataforma bancaria digital completa com PIX, Boleto, Cartao, KYC e Extrato —
                  arquitetura DDD com autenticacao Keycloak.
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-dark/60 rounded-lg p-3 text-center border border-white/5">
                    <div className="flex items-center justify-center gap-1.5 text-gold mb-1">
                      <ContainerIcon />
                      <span className="font-semibold text-lg">10</span>
                    </div>
                    <span className="text-text-secondary text-xs">Containers</span>
                  </div>
                  <div className="bg-dark/60 rounded-lg p-3 text-center border border-white/5">
                    <div className="flex items-center justify-center gap-1.5 text-gold mb-1">
                      <TestIcon />
                      <span className="font-semibold text-lg">145</span>
                    </div>
                    <span className="text-text-secondary text-xs">Testes</span>
                  </div>
                  <div className="bg-dark/60 rounded-lg p-3 text-center border border-white/5">
                    <div className="flex items-center justify-center gap-1.5 text-gold mb-1">
                      <MicroserviceIcon />
                      <span className="font-semibold text-lg">3</span>
                    </div>
                    <span className="text-text-secondary text-xs">Microservicos</span>
                  </div>
                </div>

                {/* Microservices & features */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {["Gateway", "Onboarding", "Payments"].map((ms) => (
                    <span key={ms} className="px-2 py-0.5 text-xs rounded bg-gold/10 text-gold border border-gold/20">
                      {ms}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {["PIX", "Boleto", "Cartao", "KYC", "Extrato"].map((feat) => (
                    <span key={feat} className="px-2 py-0.5 text-xs rounded bg-white/5 text-text-secondary border border-white/10">
                      {feat}
                    </span>
                  ))}
                </div>

                {/* Tech badges */}
                <div className="flex flex-wrap gap-1.5">
                  {[".NET 8", "Angular 17", "TypeScript", "PostgreSQL", "Redis", "RabbitMQ", "Kafka", "Docker", "DDD", "Keycloak"].map(
                    (tech) => (
                      <span key={tech} className="badge-hover px-2 py-1 text-xs rounded bg-dark/80 border border-white/10 text-text-secondary">
                        {tech}
                      </span>
                    )
                  )}
                </div>
              </div>
            </RevealBlock>
          </div>

          {/* Ecosystem Integration */}
          <RevealBlock className="bg-surface/40 border border-gold/20 rounded-2xl p-6 md:p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-gold font-semibold text-sm uppercase tracking-wider">
                Ecosystem Integration
              </span>
            </div>
            <p className="text-text-secondary text-sm md:text-base max-w-2xl mx-auto mb-5">
              Integracao entre KLL Pay e KRT Bank via Anti-Corruption Layer com Circuit Breaker (Polly)
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
              <div className="text-center">
                <span className="text-2xl md:text-3xl font-bold text-gradient-gold font-playfair block">25</span>
                <span className="text-text-secondary text-xs">Containers</span>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <span className="text-2xl md:text-3xl font-bold text-gradient-gold font-playfair block">389</span>
                <span className="text-text-secondary text-xs">Testes</span>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <span className="text-2xl md:text-3xl font-bold text-gradient-gold font-playfair block">0</span>
                <span className="text-text-secondary text-xs">Failures</span>
              </div>
            </div>
          </RevealBlock>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  EDUCATION                                                    */}
      {/* ============================================================ */}
      <section id="education" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <SectionHeading>Formacao</SectionHeading>

          <div className="space-y-3">
            {EDUCATION.map((item, i) => (
              <EducationItem key={i} item={item} delay={i * 60} />
            ))}
          </div>

          {/* Languages */}
          <RevealBlock className="mt-10 text-center">
            <h3 className="font-playfair text-xl font-semibold text-white mb-4">Idiomas</h3>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {[
                { lang: "Portugues", level: "Nativo" },
                { lang: "Ingles", level: "Intermediario" },
                { lang: "Espanhol", level: "Intermediario" },
              ].map((l) => (
                <div
                  key={l.lang}
                  className="bg-surface/50 border border-white/5 rounded-xl px-5 py-3 text-center"
                >
                  <span className="text-white text-sm font-medium block">{l.lang}</span>
                  <span className="text-text-secondary text-xs">{l.level}</span>
                </div>
              ))}
            </div>
          </RevealBlock>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CONTACT                                                      */}
      {/* ============================================================ */}
      <section
        id="contact"
        className="py-20 md:py-28 px-4 sm:px-6 lg:px-8"
        style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(26,26,46,0.6) 50%, transparent 100%)",
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <SectionHeading>Vamos Conversar?</SectionHeading>

          <RevealBlock>
            <p className="text-text-secondary text-base md:text-lg mb-10 max-w-xl mx-auto">
              Estou sempre aberto a novas oportunidades, projetos desafiadores e conversas sobre
              arquitetura de software. Entre em contato!
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:klisteneswar2@hotmail.com"
                className="group flex items-center gap-3 px-7 py-3.5 rounded-full bg-gold text-dark font-semibold text-sm md:text-base transition-all duration-300 hover:shadow-[0_8px_30px_rgba(201,169,98,0.4)] hover:-translate-y-0.5"
              >
                <EmailIcon />
                Enviar Email
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  <ExternalLinkIcon />
                </span>
              </a>

              <a
                href="https://www.linkedin.com/in/klistenes-de-lima-leite-257209194/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-7 py-3.5 rounded-full border border-gold/40 text-gold text-sm md:text-base transition-all duration-300 hover:bg-gold/10 hover:-translate-y-0.5"
              >
                <LinkedInIcon />
                LinkedIn
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  <ExternalLinkIcon />
                </span>
              </a>

              <a
                href="https://github.com/KlistenesLima"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-7 py-3.5 rounded-full border border-white/10 text-text-secondary text-sm md:text-base transition-all duration-300 hover:border-gold/40 hover:text-gold hover:-translate-y-0.5"
              >
                <GitHubIcon />
                GitHub
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  <ExternalLinkIcon />
                </span>
              </a>
            </div>
          </RevealBlock>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FOOTER                                                       */}
      {/* ============================================================ */}
      <footer className="py-8 px-4 border-t border-white/5 text-center">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-text-secondary hover:text-gold transition-colors text-sm"
          >
            <ArrowLeftIcon />
            Voltar a Loja
          </Link>
          <p className="text-text-secondary/50 text-xs">
            Designed & Built by Klistenes de Lima Leite
          </p>
        </div>
      </footer>

      {/* ============================================================ */}
      {/*  SCROLL TO TOP                                                */}
      {/* ============================================================ */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 w-11 h-11 rounded-full bg-gold/90 text-dark flex items-center justify-center shadow-lg transition-all duration-300 z-50 hover:bg-gold hover:shadow-[0_4px_20px_rgba(201,169,98,0.5)] ${
          showTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-label="Scroll to top"
      >
        <ChevronUpIcon />
      </button>
    </div>
  );
}
