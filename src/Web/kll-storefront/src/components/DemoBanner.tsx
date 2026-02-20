import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

const DocIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

interface BannerLink {
  href: string;
  icon: React.ReactNode;
  label: string;
  external: boolean;
}

const links: BannerLink[] = [
  { href: 'https://www.linkedin.com/in/klistenes-de-lima-leite-257209194/', icon: <LinkedInIcon />, label: 'LinkedIn', external: true },
  { href: 'https://github.com/KlistenesLima/kll-platform', icon: <GitHubIcon />, label: 'GitHub', external: true },
  { href: '/docs', icon: <DocIcon />, label: 'Docs', external: false },
  { href: '/about', icon: <InfoIcon />, label: 'Sobre', external: false },
];

export default function DemoBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'linear-gradient(90deg, #1a1a2e 0%, #16213e 100%)' }}
    >
      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between px-4 py-1.5 max-w-screen-2xl mx-auto gap-1 sm:gap-0">
        {/* Left — Briefcase + Text */}
        <div className="flex items-center gap-2 text-[#c9a962]">
          <BriefcaseIcon />
          <span className="text-xs sm:text-[13px] font-medium tracking-wide text-center sm:text-left whitespace-nowrap"
            style={{ fontFamily: 'Poppins, sans-serif' }}>
            Case de Portfólio —{' '}
            <span className="text-white font-semibold">Klístenes Lima</span>
            <span className="hidden md:inline">, Engenheiro de Software .NET Sênior</span>
          </span>
        </div>

        {/* Right — Icon Links */}
        <div className="flex items-center gap-1 sm:gap-2">
          {links.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[#c9a962]/70 hover:text-[#c9a962] hover:bg-white/5 transition-all duration-300"
                title={link.label}
              >
                {link.icon}
                <span className="text-[11px] font-medium hidden sm:inline">{link.label}</span>
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                className="group relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[#c9a962]/70 hover:text-[#c9a962] hover:bg-white/5 transition-all duration-300"
                title={link.label}
              >
                {link.icon}
                <span className="text-[11px] font-medium hidden sm:inline">{link.label}</span>
              </Link>
            )
          )}
        </div>
      </div>

      {/* Bottom border */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#c9a962]/50 to-transparent" />
    </div>
  );
}
