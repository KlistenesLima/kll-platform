import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const PortfolioIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22V6h6v16" />
    <path d="M4 6h16" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
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
  { href: 'https://linkedin.com/in/klisteneslima', icon: <LinkedInIcon />, label: 'LinkedIn', external: true },
  { href: '/about', icon: <PersonIcon />, label: 'Sobre', external: false },
  { href: 'https://github.com/KlistenesLima', icon: <GitHubIcon />, label: 'GitHub', external: true },
  { href: '/docs', icon: <DocIcon />, label: 'Documentação', external: false },
  { href: '/portfolio', icon: <InfoIcon />, label: 'Portfólio', external: false },
];

export default function DemoBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <div
        className="portfolio-banner"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderBottom: '1px solid rgba(201, 169, 98, 0.3)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      >
        <div className="pb-inner" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '12px', padding: '8px 16px',
          fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif",
          fontSize: '13px', color: '#e0e0e0', flexWrap: 'wrap',
        }}>
          <div className="pb-text" style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
            <span style={{ color: '#c9a962', display: 'flex', alignItems: 'center' }}>
              <PortfolioIcon />
            </span>
            <span>
              <span className="pb-prefix">Case de Portfólio — </span>
              <span style={{ color: '#c9a962', fontWeight: 600 }}>Klístenes Lima</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {links.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.label}
                  className="pb-link"
                >
                  {link.icon}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  title={link.label}
                  className="pb-link"
                >
                  {link.icon}
                </Link>
              )
            )}
          </div>
        </div>
      </div>
      <style>{`
        .pb-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.08);
          color: #a0a0b0;
          text-decoration: none;
          transition: all 0.2s;
        }
        .pb-link:hover {
          background: rgba(201, 169, 98, 0.2);
          color: #c9a962;
        }
        .pb-link svg {
          width: 16px;
          height: 16px;
        }
        @media (max-width: 600px) {
          .pb-inner {
            padding: 6px 12px !important;
            gap: 8px !important;
            font-size: 12px !important;
          }
          .pb-text {
            font-size: 11px;
          }
          .pb-prefix {
            display: none !important;
          }
          .pb-link {
            width: 28px !important;
            height: 28px !important;
            border-radius: 6px !important;
          }
          .pb-link svg {
            width: 14px !important;
            height: 14px !important;
          }
        }
        @media (max-width: 380px) {
          .pb-inner {
            padding: 4px 8px !important;
            gap: 6px !important;
          }
          .pb-link {
            width: 26px !important;
            height: 26px !important;
          }
        }
      `}</style>
    </>
  );
}
