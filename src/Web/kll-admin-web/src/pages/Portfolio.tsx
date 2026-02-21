import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Chip, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const SOCIAL_LINKS = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/klistenes-de-lima-leite-257209194/',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    href: 'https://github.com/KlistenesLima',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
  {
    label: 'Email',
    href: 'mailto:klisteneswar2@hotmail.com',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
    ),
  },
  {
    label: '(83) 9 8177-9792',
    href: 'tel:+5583981779792',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
      </svg>
    ),
  },
];

const TECH_STACK = [
  {
    category: 'Backend',
    techs: ['.NET 8', 'ASP.NET Core', 'C#', 'EF Core', 'Dapper', 'Minimal APIs', 'Web API', 'LINQ'],
  },
  {
    category: 'Architecture',
    techs: ['DDD', 'Clean Architecture', 'CQRS', 'Event-Driven', 'Microservices', 'REST', 'gRPC'],
  },
  {
    category: 'Messaging',
    techs: ['RabbitMQ', 'Kafka'],
  },
  {
    category: 'Databases',
    techs: ['SQL Server', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis'],
  },
  {
    category: 'Cloud / DevOps',
    techs: ['Azure', 'AWS', 'Docker', 'Kubernetes', 'GitHub Actions', 'GitLab CI/CD', 'Azure DevOps'],
  },
  {
    category: 'Frontend',
    techs: ['TypeScript', 'React', 'Angular', 'Vue.js', 'Tailwind', 'Bootstrap'],
  },
];

const EXPERIENCE = [
  {
    company: 'Qintess',
    role: 'Senior Software Engineer .NET',
    period: 'Mar 2025 - Atual',
    current: true,
    bullets: [
      'Liderança técnica na arquitetura e evolução de sistemas críticos governamentais e de saúde',
      'Modelagem DDD, APIs resilientes, workflows de mensageria assíncrona com RabbitMQ',
      'Definição de práticas arquiteturais, pipelines CI/CD, padrões de engenharia backend',
      'Redução de acoplamento sistêmico via refatorações arquiteturais estratégicas',
      'Design de serviços distribuídos escaláveis com SLA exigentes',
    ],
  },
  {
    company: 'G4F Soluções Corporativas',
    role: 'Senior Software Engineer .NET',
    period: 'Jun 2022 - Mar 2025',
    current: false,
    bullets: [
      'Liderança técnica em projetos enterprise, integração entre sistemas legados e modernos',
      'Definição de padrões arquiteturais para toda a organização',
      'Pipelines CI/CD, redução de tempo de deploy',
      'Mentoria de engenheiros juniores e plenos (code reviews, pair programming)',
      'APIs RESTful e microsserviços com .NET Core',
    ],
  },
  {
    company: 'Afixcode',
    role: 'Software Engineer .NET',
    period: 'Set 2021 - Jun 2022',
    current: false,
    bullets: [
      'APIs REST robustas e sistemas SaaS com .NET Core',
      'Arquiteturas orientadas a eventos com RabbitMQ',
      'Frontend com React, TypeScript, Redux',
      'Bancos SQL Server, PostgreSQL, MongoDB com EF Core e Dapper',
    ],
  },
  {
    company: 'Neotriad S/A',
    role: 'Software Engineer .NET',
    period: 'Nov 2019 - Jun 2022',
    current: false,
    bullets: [
      'Sistemas backend corporativos com foco em performance',
      'ASP.NET MVC e Web API',
      'Otimização de queries e modelagem de banco',
      'Testes unitários e de integração',
    ],
  },
  {
    company: 'IBGE',
    role: 'Agente de Pesquisa e Mapeamento',
    period: 'Nov 2016 - Nov 2019',
    current: false,
    bullets: [
      'Projetos estatísticos de grande escala',
      'Coleta, validação e análise de dados censitários',
    ],
  },
];

const PROJECTS = [
  {
    name: 'KLL Platform (AUREA Maison)',
    type: 'E-commerce de Joias de Luxo',
    tech: ['.NET 8', 'React', 'TypeScript', 'PostgreSQL', 'Redis', 'RabbitMQ', 'Kafka', 'Docker', 'CQRS', 'MediatR'],
    containers: 15,
    tests: 244,
    microservices: 'Gateway, Store, Pay, Logistics, Admin',
    github: 'https://github.com/KlistenesLima/kll-platform',
  },
  {
    name: 'KRT Bank',
    type: 'Plataforma Bancária Digital',
    tech: ['.NET 8', 'Angular 17', 'TypeScript', 'PostgreSQL', 'Redis', 'RabbitMQ', 'Kafka', 'Docker', 'DDD', 'Keycloak'],
    containers: 10,
    tests: 145,
    microservices: 'Gateway, Onboarding, Payments',
    features: 'PIX, Boleto, Cartão, KYC, Extrato',
    github: 'https://github.com/KlistenesLima/krt-bank',
  },
];

const EDUCATION = [
  'Pós-Graduação em Desenvolvimento de Aplicações .NET',
  'Pós-Graduação em Engenharia de Software',
  'Pós-Graduação em Business Intelligence, Big Data e IA',
  'Pós-Graduação em Administração de Banco de Dados',
  'Pós-Graduação em Ciência de Dados',
  'Pós-Graduação em Desenvolvimento Web',
  'Pós-Graduação em Algoritmos e Estruturas de Dados',
  'Pós-Graduação em Product Management',
  'Tecnólogo em Análise e Desenvolvimento de Sistemas — UNIP',
];

const STATS = [
  { label: 'Anos de Experiência', value: 7, suffix: '+' },
  { label: 'Sistemas', value: 2, suffix: '' },
  { label: 'Containers', value: 25, suffix: '' },
  { label: 'Testes', value: 389, suffix: '' },
];

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

const COLORS = {
  bg: '#0f172a',
  paper: '#1e293b',
  surface: '#253347',
  gold: '#c9a962',
  indigo: '#6366f1',
  teal: '#00D4AA',
  text: '#e2e8f0',
  textSecondary: '#94a3b8',
  white: '#ffffff',
};

// ---------------------------------------------------------------------------
// CSS keyframes
// ---------------------------------------------------------------------------

const KEYFRAMES = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInLeft {
  from { opacity: 0; transform: translateX(-40px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(40px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes typingCursor {
  0%, 100% { border-color: ${COLORS.gold}; }
  50%      { border-color: transparent; }
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-12px); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.5; }
}
@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.8); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes borderGlow {
  0%, 100% { box-shadow: 0 0 5px rgba(201,169,98,0.3), 0 0 10px rgba(99,102,241,0.1); }
  50%      { box-shadow: 0 0 15px rgba(201,169,98,0.5), 0 0 30px rgba(99,102,241,0.2); }
}
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
.revealed {
  opacity: 1;
  transform: translateY(0);
}
.reveal-delay-1 { transition-delay: 0.1s; }
.reveal-delay-2 { transition-delay: 0.2s; }
.reveal-delay-3 { transition-delay: 0.3s; }
.reveal-delay-4 { transition-delay: 0.4s; }
`;

// ---------------------------------------------------------------------------
// Typing titles
// ---------------------------------------------------------------------------

const TYPING_TITLES = [
  'Senior Full Stack Engineer (.NET)',
  'Sistemas Distribuídos',
  'Arquitetura Backend',
  'Domain-Driven Design',
  'Cloud & DevOps',
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Portfolio() {
  const navigate = useNavigate();

  // ---- Typing animation ----
  const [titleIndex, setTitleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    const current = TYPING_TITLES[titleIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && charIndex <= current.length) {
      timeout = setTimeout(() => {
        setDisplayedText(current.slice(0, charIndex));
        setCharIndex((c) => c + 1);
      }, 60);
    } else if (!isDeleting && charIndex > current.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && charIndex > 0) {
      timeout = setTimeout(() => {
        setCharIndex((c) => c - 1);
        setDisplayedText(current.slice(0, charIndex - 1));
      }, 35);
    } else {
      setIsDeleting(false);
      setTitleIndex((i) => (i + 1) % TYPING_TITLES.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, titleIndex]);

  // ---- Scroll reveal ----
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);
  const addRevealRef = useCallback((el: HTMLDivElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );

    revealRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // ---- Counter animation ----
  const counterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const countersStarted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !countersStarted.current) {
            countersStarted.current = true;
            animateCounters();
          }
        });
      },
      { threshold: 0.3 },
    );

    counterRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animateCounters = () => {
    STATS.forEach((stat, idx) => {
      const el = counterRefs.current[idx];
      if (!el) return;
      const end = stat.value;
      const duration = 2000;
      const start = performance.now();

      const step = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * end);
        if (el) el.textContent = `${current}${stat.suffix}`;
        if (progress < 1) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    });
  };

  // ---- Section heading helper ----
  const SectionHeading = ({ children }: { children: React.ReactNode }) => (
    <Typography
      variant="h3"
      sx={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 800,
        fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.6rem' },
        color: COLORS.white,
        mb: 1,
        position: 'relative',
        display: 'inline-block',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -8,
          left: 0,
          width: 60,
          height: 4,
          borderRadius: 2,
          background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.indigo})`,
        },
      }}
    >
      {children}
    </Typography>
  );

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: COLORS.bg,
        color: COLORS.text,
        fontFamily: 'Inter, sans-serif',
        overflowX: 'hidden',
        '& *, & *::before, & *::after': { boxSizing: 'border-box' },
      }}
    >
      {/* Keyframes */}
      <style>{KEYFRAMES}</style>

      {/* ================================================================ */}
      {/* HERO SECTION                                                      */}
      {/* ================================================================ */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          textAlign: 'center',
          px: 3,
          background: `
            radial-gradient(ellipse 80% 60% at 50% -20%, rgba(99,102,241,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 50%, rgba(201,169,98,0.08) 0%, transparent 50%),
            linear-gradient(180deg, ${COLORS.bg} 0%, #0b1120 100%)
          `,
          overflow: 'hidden',
        }}
      >
        {/* Decorative floating orbs */}
        <Box
          sx={{
            position: 'absolute',
            top: '15%',
            left: '10%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)`,
            animation: 'float 6s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            right: '5%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(201,169,98,0.06) 0%, transparent 70%)`,
            animation: 'float 8s ease-in-out infinite 1s',
            pointerEvents: 'none',
          }}
        />

        {/* Avatar */}
        <Box
          sx={{
            width: { xs: 110, md: 140 },
            height: { xs: 110, md: 140 },
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${COLORS.indigo}, ${COLORS.gold})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            animation: 'scaleIn 0.8s ease-out, borderGlow 3s ease-in-out infinite',
            boxShadow: `0 0 40px rgba(99,102,241,0.3), 0 0 80px rgba(201,169,98,0.15)`,
          }}
        >
          <svg width="60" height="60" viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </Box>

        {/* Name */}
        <Typography
          variant="h1"
          sx={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 900,
            fontSize: { xs: '2rem', sm: '2.8rem', md: '3.8rem', lg: '4.5rem' },
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            background: `linear-gradient(135deg, ${COLORS.white} 0%, ${COLORS.gold} 50%, ${COLORS.indigo} 100%)`,
            backgroundSize: '200% 200%',
            animation: 'fadeInUp 1s ease-out, gradientShift 6s ease infinite',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            mb: 2,
          }}
        >
          Klístenes de Lima Leite
        </Typography>

        {/* Typing title */}
        <Box
          sx={{
            minHeight: { xs: 36, md: 44 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1.5,
          }}
        >
          <Typography
            sx={{
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.3rem' },
              color: COLORS.gold,
              borderRight: `3px solid ${COLORS.gold}`,
              animation: 'typingCursor 0.8s step-end infinite',
              pr: 0.5,
              whiteSpace: 'nowrap',
            }}
          >
            {displayedText}
          </Typography>
        </Box>

        {/* Location */}
        <Typography
          sx={{
            color: COLORS.textSecondary,
            fontSize: { xs: '0.9rem', md: '1rem' },
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mb: 3,
            animation: 'fadeInUp 1s ease-out 0.3s both',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={COLORS.textSecondary}>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          João Pessoa, PB
        </Typography>

        {/* Social links */}
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 1, md: 1.5 },
            flexWrap: 'wrap',
            justifyContent: 'center',
            animation: 'fadeInUp 1s ease-out 0.5s both',
          }}
        >
          {SOCIAL_LINKS.map((link) => (
            <Button
              key={link.label}
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              startIcon={link.icon}
              sx={{
                color: COLORS.textSecondary,
                textTransform: 'none',
                fontFamily: 'Inter, sans-serif',
                fontSize: { xs: '0.8rem', md: '0.85rem' },
                border: `1px solid rgba(148,163,184,0.2)`,
                borderRadius: 2,
                px: { xs: 1.5, md: 2 },
                py: 0.8,
                transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                '&:hover': {
                  color: COLORS.gold,
                  borderColor: COLORS.gold,
                  backgroundColor: 'rgba(201,169,98,0.08)',
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 20px rgba(201,169,98,0.15)`,
                },
              }}
            >
              {link.label}
            </Button>
          ))}
        </Box>

        {/* Scroll indicator */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            animation: 'float 2s ease-in-out infinite',
            opacity: 0.5,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={COLORS.textSecondary}>
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
          </svg>
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill={COLORS.textSecondary}
            style={{ display: 'block', margin: '0 auto' }}
          >
            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
          </svg>
        </Box>
      </Box>

      {/* ================================================================ */}
      {/* ABOUT SECTION                                                     */}
      {/* ================================================================ */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 2, md: 4 },
          maxWidth: 1100,
          mx: 'auto',
        }}
      >
        <div ref={addRevealRef} className="reveal">
          <SectionHeading>Sobre</SectionHeading>
          <Typography
            sx={{
              mt: 4,
              fontSize: { xs: '1rem', md: '1.15rem' },
              lineHeight: 1.9,
              color: COLORS.textSecondary,
              maxWidth: 850,
            }}
          >
            Senior Full Stack Engineer com mais de 7 anos de experiência projetando e escalando
            sistemas distribuídos, APIs críticas e plataformas backend modernas em ambientes
            enterprise e governamentais. Especialista em{' '}
            <Box component="span" sx={{ color: COLORS.gold, fontWeight: 600 }}>
              Domain-Driven Design (DDD)
            </Box>
            , arquitetura de mensageria, integração de sistemas complexos e desenvolvimento de
            arquiteturas resilientes e escaláveis.
          </Typography>
        </div>

        {/* Stats */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: { xs: 2, md: 3 },
            mt: 6,
          }}
        >
          {STATS.map((stat, idx) => (
            <div key={stat.label} ref={addRevealRef} className={`reveal reveal-delay-${idx + 1}`}>
              <Paper
                elevation={0}
                sx={{
                  textAlign: 'center',
                  py: { xs: 3, md: 4 },
                  px: 2,
                  borderRadius: 3,
                  backgroundColor: COLORS.paper,
                  border: `1px solid rgba(201,169,98,0.1)`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    border: `1px solid rgba(201,169,98,0.3)`,
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 30px rgba(0,0,0,0.3)`,
                  },
                }}
              >
                <Typography
                  ref={(el: HTMLSpanElement | null) => {
                    counterRefs.current[idx] = el;
                  }}
                  sx={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 900,
                    fontSize: { xs: '2.2rem', md: '3rem' },
                    background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.indigo})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: 1,
                  }}
                >
                  0{stat.suffix}
                </Typography>
                <Typography
                  sx={{
                    color: COLORS.textSecondary,
                    fontSize: { xs: '0.8rem', md: '0.9rem' },
                    mt: 1,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {stat.label}
                </Typography>
              </Paper>
            </div>
          ))}
        </Box>
      </Box>

      {/* ================================================================ */}
      {/* TECH STACK SECTION                                                */}
      {/* ================================================================ */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 2, md: 4 },
          background: `linear-gradient(180deg, transparent 0%, rgba(30,41,59,0.5) 50%, transparent 100%)`,
        }}
      >
        <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
          <div ref={addRevealRef} className="reveal">
            <SectionHeading>Tech Stack</SectionHeading>
          </div>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              gap: 3,
              mt: 5,
            }}
          >
            {TECH_STACK.map((group, gIdx) => (
              <div key={group.category} ref={addRevealRef} className={`reveal reveal-delay-${(gIdx % 4) + 1}`}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    backgroundColor: COLORS.paper,
                    border: `1px solid rgba(148,163,184,0.08)`,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      border: `1px solid rgba(201,169,98,0.25)`,
                      boxShadow: `0 4px 25px rgba(0,0,0,0.2)`,
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: COLORS.gold,
                      fontSize: '0.85rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      mb: 2,
                    }}
                  >
                    {group.category}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {group.techs.map((tech) => (
                      <Chip
                        key={tech}
                        label={tech}
                        size="small"
                        sx={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '0.78rem',
                          fontWeight: 500,
                          color: COLORS.text,
                          backgroundColor: COLORS.surface,
                          border: `1px solid rgba(148,163,184,0.12)`,
                          transition: 'all 0.25s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(201,169,98,0.12)',
                            borderColor: COLORS.gold,
                            color: COLORS.gold,
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Paper>
              </div>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ================================================================ */}
      {/* EXPERIENCE SECTION                                                */}
      {/* ================================================================ */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 2, md: 4 },
          maxWidth: 1100,
          mx: 'auto',
        }}
      >
        <div ref={addRevealRef} className="reveal">
          <SectionHeading>Experiência</SectionHeading>
        </div>

        {/* Timeline */}
        <Box sx={{ mt: 5, position: 'relative', pl: { xs: 3, md: 5 } }}>
          {/* Vertical line */}
          <Box
            sx={{
              position: 'absolute',
              left: { xs: 8, md: 16 },
              top: 0,
              bottom: 0,
              width: 2,
              background: `linear-gradient(180deg, ${COLORS.gold}, ${COLORS.indigo}, transparent)`,
            }}
          />

          {EXPERIENCE.map((exp, idx) => (
            <div key={exp.company} ref={addRevealRef} className="reveal">
              <Box
                sx={{
                  position: 'relative',
                  mb: idx < EXPERIENCE.length - 1 ? 5 : 0,
                }}
              >
                {/* Dot */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: { xs: -23, md: -39 },
                    top: 6,
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: exp.current
                      ? `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.gold})`
                      : COLORS.surface,
                    border: `3px solid ${exp.current ? COLORS.teal : COLORS.indigo}`,
                    boxShadow: exp.current ? `0 0 12px rgba(0,212,170,0.4)` : 'none',
                    zIndex: 1,
                  }}
                />

                {/* Card */}
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, md: 3.5 },
                    borderRadius: 3,
                    backgroundColor: COLORS.paper,
                    border: exp.current
                      ? `1px solid rgba(0,212,170,0.25)`
                      : `1px solid rgba(148,163,184,0.08)`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      border: `1px solid rgba(201,169,98,0.25)`,
                      boxShadow: `0 4px 25px rgba(0,0,0,0.2)`,
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 800,
                        color: COLORS.white,
                        fontSize: { xs: '1.05rem', md: '1.2rem' },
                      }}
                    >
                      {exp.company}
                    </Typography>
                    {exp.current && (
                      <Chip
                        label="Atual"
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          height: 22,
                          backgroundColor: 'rgba(0,212,170,0.15)',
                          color: COLORS.teal,
                          border: `1px solid rgba(0,212,170,0.3)`,
                        }}
                      />
                    )}
                  </Box>

                  <Typography
                    sx={{
                      color: COLORS.gold,
                      fontWeight: 600,
                      fontSize: { xs: '0.88rem', md: '0.95rem' },
                      mb: 0.3,
                    }}
                  >
                    {exp.role}
                  </Typography>

                  <Typography
                    sx={{
                      color: COLORS.textSecondary,
                      fontSize: '0.82rem',
                      mb: 1.5,
                    }}
                  >
                    {exp.period}
                  </Typography>

                  <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                    {exp.bullets.map((bullet, bIdx) => (
                      <Box
                        component="li"
                        key={bIdx}
                        sx={{
                          color: COLORS.textSecondary,
                          fontSize: { xs: '0.85rem', md: '0.9rem' },
                          lineHeight: 1.7,
                          mb: 0.5,
                          '&::marker': { color: COLORS.indigo },
                        }}
                      >
                        {bullet}
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Box>
            </div>
          ))}
        </Box>
      </Box>

      {/* ================================================================ */}
      {/* PROJECTS SECTION                                                  */}
      {/* ================================================================ */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 2, md: 4 },
          background: `linear-gradient(180deg, transparent 0%, rgba(30,41,59,0.5) 50%, transparent 100%)`,
        }}
      >
        <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
          <div ref={addRevealRef} className="reveal">
            <SectionHeading>Projetos</SectionHeading>
            <Typography
              sx={{
                color: COLORS.textSecondary,
                mt: 3,
                mb: 1,
                fontSize: { xs: '0.9rem', md: '1rem' },
              }}
            >
              Ecossistema:{' '}
              <Box component="span" sx={{ color: COLORS.gold, fontWeight: 600 }}>
                25 containers
              </Box>
              ,{' '}
              <Box component="span" sx={{ color: COLORS.teal, fontWeight: 600 }}>
                389 testes
              </Box>
              ,{' '}
              <Box component="span" sx={{ color: COLORS.indigo, fontWeight: 600 }}>
                0 failures
              </Box>
            </Typography>
            <Typography sx={{ color: COLORS.textSecondary, fontSize: '0.85rem', mb: 5 }}>
              Integração via Anti-Corruption Layer (KLL Pay → KRT Bank) com Circuit Breaker (Polly)
            </Typography>
          </div>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
              gap: 3,
            }}
          >
            {PROJECTS.map((project, pIdx) => (
              <div key={project.name} ref={addRevealRef} className={`reveal reveal-delay-${pIdx + 1}`}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 4,
                    backgroundColor: COLORS.paper,
                    border: `1px solid rgba(148,163,184,0.08)`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                    '&:hover': {
                      border: `1px solid rgba(201,169,98,0.3)`,
                      boxShadow: `0 12px 40px rgba(0,0,0,0.3)`,
                      transform: 'translateY(-4px)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.indigo}, ${COLORS.teal})`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      mb: 1,
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: { xs: '1.2rem', md: '1.4rem' },
                          color: COLORS.white,
                        }}
                      >
                        {project.name}
                      </Typography>
                      <Typography
                        sx={{
                          color: COLORS.gold,
                          fontSize: '0.88rem',
                          fontWeight: 500,
                        }}
                      >
                        {project.type}
                      </Typography>
                    </Box>
                    <Button
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                      sx={{
                        color: COLORS.textSecondary,
                        textTransform: 'none',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.8rem',
                        border: `1px solid rgba(148,163,184,0.2)`,
                        borderRadius: 2,
                        px: 1.5,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          color: COLORS.white,
                          borderColor: COLORS.indigo,
                          backgroundColor: 'rgba(99,102,241,0.1)',
                        },
                      }}
                      startIcon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                        </svg>
                      }
                    >
                      GitHub
                    </Button>
                  </Box>

                  {/* Metrics */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: { xs: 1.5, md: 2.5 },
                      flexWrap: 'wrap',
                      my: 2,
                    }}
                  >
                    <Box
                      sx={{
                        textAlign: 'center',
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        backgroundColor: 'rgba(201,169,98,0.08)',
                        border: `1px solid rgba(201,169,98,0.15)`,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: '1.3rem',
                          color: COLORS.gold,
                          lineHeight: 1,
                        }}
                      >
                        {project.containers}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.textSecondary, mt: 0.3 }}>
                        Containers
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        textAlign: 'center',
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        backgroundColor: 'rgba(0,212,170,0.08)',
                        border: `1px solid rgba(0,212,170,0.15)`,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: '1.3rem',
                          color: COLORS.teal,
                          lineHeight: 1,
                        }}
                      >
                        {project.tests}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: COLORS.textSecondary, mt: 0.3 }}>
                        Testes
                      </Typography>
                    </Box>
                  </Box>

                  {/* Microservices */}
                  <Typography
                    sx={{
                      fontSize: '0.82rem',
                      color: COLORS.textSecondary,
                      mb: 0.5,
                    }}
                  >
                    <Box component="span" sx={{ color: COLORS.indigo, fontWeight: 600 }}>
                      Microservices:
                    </Box>{' '}
                    {project.microservices}
                  </Typography>

                  {/* Features (KRT Bank only) */}
                  {project.features && (
                    <Typography
                      sx={{
                        fontSize: '0.82rem',
                        color: COLORS.textSecondary,
                        mb: 1.5,
                      }}
                    >
                      <Box component="span" sx={{ color: COLORS.teal, fontWeight: 600 }}>
                        Features:
                      </Box>{' '}
                      {project.features}
                    </Typography>
                  )}

                  {/* Tech badges */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 'auto', pt: 1.5 }}>
                    {project.tech.map((t) => (
                      <Chip
                        key={t}
                        label={t}
                        size="small"
                        sx={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '0.72rem',
                          fontWeight: 500,
                          color: COLORS.text,
                          backgroundColor: COLORS.surface,
                          border: `1px solid rgba(148,163,184,0.1)`,
                          height: 24,
                        }}
                      />
                    ))}
                  </Box>
                </Paper>
              </div>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ================================================================ */}
      {/* EDUCATION SECTION                                                 */}
      {/* ================================================================ */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 2, md: 4 },
          maxWidth: 1100,
          mx: 'auto',
        }}
      >
        <div ref={addRevealRef} className="reveal">
          <SectionHeading>Formação</SectionHeading>
        </div>

        <Box sx={{ mt: 5 }}>
          {EDUCATION.map((edu, idx) => (
            <div key={edu} ref={addRevealRef} className={`reveal reveal-delay-${(idx % 4) + 1}`}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  py: 1.5,
                  px: 2,
                  borderRadius: 2,
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(30,41,59,0.5)',
                  },
                }}
              >
                {/* Graduation cap icon */}
                <Box
                  sx={{
                    mt: 0.2,
                    flexShrink: 0,
                    color: idx === EDUCATION.length - 1 ? COLORS.gold : COLORS.indigo,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
                  </svg>
                </Box>
                <Typography
                  sx={{
                    color: idx === EDUCATION.length - 1 ? COLORS.gold : COLORS.text,
                    fontWeight: idx === EDUCATION.length - 1 ? 700 : 400,
                    fontSize: { xs: '0.88rem', md: '0.95rem' },
                    lineHeight: 1.6,
                  }}
                >
                  {edu}
                </Typography>
              </Box>
            </div>
          ))}
        </Box>

        {/* Languages */}
        <div ref={addRevealRef} className="reveal">
          <Box sx={{ mt: 5 }}>
            <Typography
              sx={{
                fontWeight: 700,
                color: COLORS.gold,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                mb: 2,
              }}
            >
              Idiomas
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {[
                { lang: 'Português', level: 'Nativo' },
                { lang: 'Inglês', level: 'Intermediário' },
                { lang: 'Espanhol', level: 'Intermediário' },
              ].map((l) => (
                <Chip
                  key={l.lang}
                  label={`${l.lang} — ${l.level}`}
                  sx={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    color: COLORS.text,
                    backgroundColor: COLORS.paper,
                    border: `1px solid rgba(148,163,184,0.12)`,
                    px: 1,
                  }}
                />
              ))}
            </Box>
          </Box>
        </div>
      </Box>

      {/* ================================================================ */}
      {/* CONTACT SECTION                                                   */}
      {/* ================================================================ */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 2, md: 4 },
          background: `linear-gradient(180deg, transparent 0%, rgba(30,41,59,0.5) 50%, transparent 100%)`,
        }}
      >
        <Box sx={{ maxWidth: 700, mx: 'auto', textAlign: 'center' }}>
          <div ref={addRevealRef} className="reveal">
            <Typography
              variant="h3"
              sx={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 800,
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.8rem' },
                color: COLORS.white,
                mb: 2,
              }}
            >
              Vamos conversar?
            </Typography>
            <Typography
              sx={{
                color: COLORS.textSecondary,
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                lineHeight: 1.8,
                mb: 4,
              }}
            >
              Estou sempre aberto a discutir novos projetos, desafios de engenharia ou
              oportunidades de colaboração.
            </Typography>
          </div>

          <div ref={addRevealRef} className="reveal reveal-delay-2">
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: { xs: 1.5, md: 2 },
                flexWrap: 'wrap',
              }}
            >
              <Button
                href="mailto:klisteneswar2@hotmail.com"
                variant="contained"
                sx={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${COLORS.gold}, #b8963a)`,
                  color: '#0f172a',
                  boxShadow: `0 4px 20px rgba(201,169,98,0.3)`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: `linear-gradient(135deg, #d4b570, ${COLORS.gold})`,
                    boxShadow: `0 6px 30px rgba(201,169,98,0.4)`,
                    transform: 'translateY(-2px)',
                  },
                }}
                startIcon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                }
              >
                Enviar Email
              </Button>

              <Button
                href="https://www.linkedin.com/in/klistenes-de-lima-leite-257209194/"
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                sx={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  color: COLORS.indigo,
                  borderColor: COLORS.indigo,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: COLORS.indigo,
                    backgroundColor: 'rgba(99,102,241,0.08)',
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 20px rgba(99,102,241,0.2)`,
                  },
                }}
                startIcon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                }
              >
                LinkedIn
              </Button>

              <Button
                href="https://github.com/KlistenesLima"
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                sx={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  color: COLORS.text,
                  borderColor: 'rgba(148,163,184,0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: COLORS.text,
                    backgroundColor: 'rgba(148,163,184,0.08)',
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 20px rgba(148,163,184,0.1)`,
                  },
                }}
                startIcon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                }
              >
                GitHub
              </Button>
            </Box>
          </div>
        </Box>
      </Box>

      {/* ================================================================ */}
      {/* BACK BUTTON + FOOTER                                              */}
      {/* ================================================================ */}
      <Box
        sx={{
          py: 6,
          textAlign: 'center',
          borderTop: `1px solid rgba(148,163,184,0.08)`,
        }}
      >
        <Button
          onClick={() => navigate('/')}
          sx={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.9rem',
            color: COLORS.textSecondary,
            border: `1px solid rgba(148,163,184,0.2)`,
            borderRadius: 2,
            px: 3,
            py: 1,
            mb: 3,
            transition: 'all 0.3s ease',
            '&:hover': {
              color: COLORS.gold,
              borderColor: COLORS.gold,
              backgroundColor: 'rgba(201,169,98,0.05)',
            },
          }}
          startIcon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          }
        >
          Voltar ao Admin
        </Button>

        <Typography
          sx={{
            color: 'rgba(148,163,184,0.4)',
            fontSize: '0.78rem',
          }}
        >
          Klístenes de Lima Leite &copy; {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  );
}
