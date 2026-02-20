import { useEffect, useState } from 'react';

const sections = [
  { id: 'overview', label: 'Visão Geral' },
  { id: 'navigation', label: 'Navegação' },
  { id: 'catalog', label: 'Catálogo e Busca' },
  { id: 'cart', label: 'Carrinho e Checkout' },
  { id: 'pix', label: 'Pagamento PIX' },
  { id: 'boleto', label: 'Pagamento Boleto' },
  { id: 'card', label: 'Pagamento Cartão' },
  { id: 'favorites', label: 'Favoritos' },
  { id: 'admin', label: 'Painel Admin' },
  { id: 'api', label: 'API Endpoints' },
  { id: 'integration', label: 'Integração KRT Bank' },
];

const endpoints = [
  { method: 'GET', path: '/api/v1/products', desc: 'Listar produtos' },
  { method: 'GET', path: '/api/v1/products/{id}', desc: 'Detalhe do produto' },
  { method: 'GET', path: '/api/v1/categories', desc: 'Listar categorias' },
  { method: 'POST', path: '/api/v1/orders', desc: 'Criar pedido' },
  { method: 'POST', path: '/api/v1/pay/pix/charge', desc: 'Criar cobrança PIX' },
  { method: 'POST', path: '/api/v1/pay/boleto/charge', desc: 'Criar cobrança Boleto' },
  { method: 'GET', path: '/api/v1/pay/health/krt', desc: 'Health check da integração' },
];

export default function Docs() {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState('overview');
  const [generating, setGenerating] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleDownloadPdf = async () => {
    setGenerating(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const content = document.getElementById('docs-content');
      if (!content) return;

      const clone = content.cloneNode(true) as HTMLElement;
      clone.style.color = '#1a1a1a';
      clone.style.background = '#ffffff';
      clone.style.padding = '30px';
      clone.querySelectorAll('*').forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.style) {
          htmlEl.style.color = '#1a1a1a';
          htmlEl.style.borderColor = '#ddd';
          htmlEl.style.background = htmlEl.tagName === 'CODE' ? '#f5f5f5' : 'transparent';
        }
      });
      clone.querySelectorAll('h1, h2, h3, h4').forEach((el) => {
        (el as HTMLElement).style.color = '#0047BB';
      });

      const wrapper = document.createElement('div');
      wrapper.style.fontFamily = 'Helvetica, Arial, sans-serif';
      wrapper.innerHTML = `<h1 style="font-size: 24px; color: #0047BB; border-bottom: 2px solid #0047BB; padding-bottom: 10px;">AUREA Maison — Manual de Uso</h1>`;
      wrapper.appendChild(clone);

      await html2pdf().set({
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: 'AUREA-Maison-Manual.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      }).from(wrapper).save();
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    } finally {
      setGenerating(false);
    }
  };

  const renderContent = () => {
    switch (active) {
      case 'overview':
        return (
          <div>
            <h2 className="font-playfair text-2xl text-white mb-4">Visão Geral</h2>
            <p className="text-text-secondary mb-4 leading-relaxed">
              O <strong className="text-gold">AUREA Maison</strong> é um e-commerce de joias de luxo construído como case de portfólio.
              Ele demonstra uma arquitetura completa de microsserviços com frontend React e backend .NET 8.
            </p>
            <p className="text-text-secondary mb-4 leading-relaxed">
              O sistema oferece navegação por catálogo, busca avançada, carrinho de compras, checkout com múltiplas formas
              de pagamento (PIX, Boleto e Cartão), sistema de favoritos, rastreamento de pedidos e painel administrativo.
            </p>
            <div className="p-4 rounded-xl bg-gold/5 border border-gold/20 mt-6">
              <p className="text-gold text-sm font-semibold mb-1">Importante</p>
              <p className="text-text-secondary text-sm">
                Este é um projeto de demonstração. Nenhuma transação é real e nenhum dado financeiro é processado.
                Os pagamentos são simulados através da integração com o KRT Bank.
              </p>
            </div>
          </div>
        );

      case 'navigation':
        return (
          <div>
            <h2 className="font-playfair text-2xl text-white mb-4">Navegação</h2>
            <p className="text-text-secondary mb-6 leading-relaxed">
              O menu principal oferece acesso rápido a todas as categorias de produtos:
            </p>
            <div className="flex flex-col gap-3">
              {[
                { name: 'JOIAS', desc: 'Menu dropdown com subcategorias: Anéis, Colares, Brincos, Pulseiras, Pingentes' },
                { name: 'ALIANÇAS & NOIVADO', desc: 'Alianças de casamento e noivado em ouro e diamantes' },
                { name: 'RELÓGIOS', desc: 'Relógios de luxo masculinos e femininos' },
                { name: 'PRESENTES', desc: 'Seleção especial para presentes' },
                { name: 'NOVIDADES', desc: 'Lançamentos e produtos recém-adicionados' },
              ].map((item) => (
                <div key={item.name} className="p-4 rounded-xl bg-surface/50 border border-gold/10">
                  <span className="text-gold font-semibold text-sm font-poppins">{item.name}</span>
                  <p className="text-text-secondary text-sm mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-text-secondary mt-6 text-sm">
              A <strong className="text-white">barra de busca</strong> no header permite pesquisar produtos por nome. No mobile, o menu é acessível pelo ícone hamburger.
            </p>
          </div>
        );

      case 'catalog':
        return (
          <div>
            <h2 className="font-playfair text-2xl text-white mb-4">Catálogo e Busca</h2>
            <p className="text-text-secondary mb-6 leading-relaxed">
              A página de busca oferece filtros avançados para encontrar o produto ideal:
            </p>
            <div className="flex flex-col gap-4">
              <Step num={1} title="Filtrar por Categoria" text="Selecione uma ou mais categorias no painel lateral." />
              <Step num={2} title="Faixa de Preço" text="Defina o valor mínimo e máximo para filtrar por preço." />
              <Step num={3} title="Ordenação" text="Ordene por preço (menor/maior), nome (A-Z/Z-A) ou novidades." />
              <Step num={4} title="Paginação" text="Navegue entre as páginas de resultados com os controles de paginação." />
            </div>
          </div>
        );

      case 'cart':
        return (
          <div>
            <h2 className="font-playfair text-2xl text-white mb-4">Carrinho e Checkout</h2>
            <p className="text-text-secondary mb-6 leading-relaxed">
              O carrinho utiliza localStorage para persistência e sincroniza com o backend quando o usuário está logado.
            </p>
            <h3 className="text-white text-lg font-poppins font-semibold mb-3">Carrinho</h3>
            <ul className="flex flex-col gap-2 mb-8">
              {['Adicione produtos clicando em "Adicionar ao Carrinho"', 'Altere a quantidade diretamente no carrinho', 'Remova itens individualmente', 'O total é atualizado automaticamente'].map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-text-secondary text-sm">
                  <span className="text-gold mt-1 text-[6px]">●</span>{t}
                </li>
              ))}
            </ul>
            <h3 className="text-white text-lg font-poppins font-semibold mb-3">Checkout (3 etapas)</h3>
            <div className="flex flex-col gap-4">
              <Step num={1} title="Endereço" text="Selecione ou cadastre um endereço de entrega." />
              <Step num={2} title="Envio" text="Escolha a modalidade de frete e veja o prazo estimado." />
              <Step num={3} title="Pagamento" text="Selecione PIX, Boleto ou Cartão e finalize o pedido." />
            </div>
          </div>
        );

      case 'pix':
        return (
          <div>
            <h2 className="font-playfair text-2xl text-white mb-4">Pagamento PIX</h2>
            <div className="flex flex-col gap-4">
              <Step num={1} title="Selecionar PIX" text="Na etapa de pagamento do checkout, selecione PIX como forma de pagamento." />
              <Step num={2} title="QR Code Gerado" text="Um QR Code PIX é gerado automaticamente com o valor exato do pedido." />
              <Step num={3} title="Timer de Expiração" text="O QR Code tem validade de 30 minutos. Um timer exibe o tempo restante." />
              <Step num={4} title="Copia e Cola" text="Também é gerado um código PIX Copia e Cola para pagamento manual." />
              <Step num={5} title="Polling Automático" text="O sistema verifica o pagamento a cada 5 segundos automaticamente." />
              <Step num={6} title="Confirmação" text="Assim que o pagamento é detectado, o pedido é confirmado instantaneamente." />
            </div>
            <div className="p-4 rounded-xl bg-gold/5 border border-gold/20 mt-6">
              <p className="text-text-secondary text-sm">
                O QR Code segue o padrão EMV do Banco Central. O pagamento é processado pelo <strong className="text-gold">KRT Bank</strong>.
              </p>
            </div>
          </div>
        );

      case 'boleto':
        return (
          <div>
            <h2 className="font-playfair text-2xl text-white mb-4">Pagamento Boleto</h2>
            <div className="flex flex-col gap-4">
              <Step num={1} title="Selecionar Boleto" text="Na etapa de pagamento, selecione Boleto como forma de pagamento." />
              <Step num={2} title="Boleto Gerado" text="O sistema gera um código de barras e uma linha digitável." />
              <Step num={3} title="Copiar Código" text="Copie a linha digitável para pagar no seu app bancário." />
              <Step num={4} title="Pagar no KRT Bank" text="Acesse o KRT Bank, vá em Boleto e cole a linha digitável." />
              <Step num={5} title="Confirmação" text="O pagamento é confirmado em até 3 dias úteis." />
            </div>
          </div>
        );

      case 'card':
        return (
          <div>
            <h2 className="font-playfair text-2xl text-white mb-4">Pagamento Cartão</h2>
            <div className="flex flex-col gap-4">
              <Step num={1} title="Selecionar Cartão" text="Na etapa de pagamento, selecione Cartão de Crédito." />
              <Step num={2} title="Dados do Cartão" text="Preencha número, validade, CVV e nome do titular." />
              <Step num={3} title="Confirmar Compra" text="Revise os dados e confirme a compra." />
              <Step num={4} title="Processamento" text="O pagamento é processado em tempo real via KRT Bank." />
            </div>
            <div className="p-4 rounded-xl bg-gold/5 border border-gold/20 mt-6">
              <p className="text-text-secondary text-sm">
                Use o cartão virtual gerado no <strong className="text-gold">KRT Bank</strong> para pagar. O valor é debitado do limite do cartão.
              </p>
            </div>
          </div>
        );

      case 'favorites':
        return (
          <div>
            <h2 className="font-playfair text-2xl text-white mb-4">Favoritos</h2>
            <p className="text-text-secondary mb-4 leading-relaxed">
              O sistema de favoritos permite salvar produtos para ver depois. Os favoritos são persistidos no backend
              via API, não apenas no navegador.
            </p>
            <ul className="flex flex-col gap-2">
              {[
                'Clique no ícone de coração em qualquer produto para favoritar',
                'Acesse sua lista de favoritos pelo ícone no header',
                'Remova favoritos clicando novamente no coração',
                'Favoritos são sincronizados com o servidor (requer login)',
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-text-secondary text-sm">
                  <span className="text-gold mt-1 text-[6px]">●</span>{t}
                </li>
              ))}
            </ul>
          </div>
        );

      case 'admin':
        return (
          <div>
            <h2 className="font-playfair text-2xl text-white mb-4">Painel Admin</h2>
            <p className="text-text-secondary mb-6 leading-relaxed">
              O painel administrativo oferece gerenciamento completo do e-commerce. Acesse em{' '}
              <code className="text-gold bg-gold/10 px-2 py-0.5 rounded text-sm">/admin</code> ou{' '}
              <code className="text-gold bg-gold/10 px-2 py-0.5 rounded text-sm">admin.klisteneslima.dev</code>
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: 'Produtos', desc: 'Criar, editar, remover produtos. Upload de imagens, preços, estoque.' },
                { title: 'Pedidos', desc: 'Visualizar pedidos, atualizar status, ver detalhes de pagamento.' },
                { title: 'Categorias', desc: 'Gerenciar categorias e subcategorias do catálogo.' },
                { title: 'Clientes', desc: 'Visualizar dados dos clientes e histórico de compras.' },
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-xl bg-surface/50 border border-gold/10">
                  <h4 className="text-gold text-sm font-semibold font-poppins mb-1">{item.title}</h4>
                  <p className="text-text-secondary text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'api':
        return (
          <div>
            <h2 className="font-playfair text-2xl text-white mb-4">API Endpoints</h2>
            <p className="text-text-secondary mb-6 leading-relaxed">
              Principais endpoints disponíveis no KLL Gateway:
            </p>
            <div className="flex flex-col gap-3">
              {endpoints.map((ep) => (
                <div key={ep.path} className="flex items-center gap-3 p-3 rounded-xl bg-surface/50 border border-gold/10">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono shrink-0 ${
                    ep.method === 'GET' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {ep.method}
                  </span>
                  <code className="text-white text-sm flex-1 font-mono">{ep.path}</code>
                  <span className="text-text-secondary text-sm hidden sm:block">{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'integration':
        return (
          <div>
            <h2 className="font-playfair text-2xl text-white mb-4">Integração KRT Bank</h2>
            <p className="text-text-secondary mb-6 leading-relaxed">
              O AUREA Maison utiliza o KRT Bank como processador de pagamentos através de uma
              Anti-Corruption Layer (ACL), seguindo os princípios de DDD.
            </p>
            <h3 className="text-white text-lg font-poppins font-semibold mb-3">Fluxo de Pagamento</h3>
            <div className="flex flex-col gap-3 mb-8">
              {[
                { from: 'KLL Pay Service', to: 'KRT Gateway', desc: 'Envio da cobrança via API Key' },
                { from: 'KRT Gateway', to: 'KRT Payments API', desc: 'Processamento do pagamento' },
                { from: 'KRT Payments', to: 'Conta Bancária', desc: 'Débito/Crédito atômico' },
                { from: 'KRT Bank', to: 'KLL Pay', desc: 'Confirmação via webhook/polling' },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface/50 border border-gold/10">
                  <span className="bg-gold/20 text-gold text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shrink-0">{i + 1}</span>
                  <span className="text-white text-sm font-poppins font-medium">{step.from}</span>
                  <span className="text-gold">→</span>
                  <span className="text-white text-sm font-poppins font-medium">{step.to}</span>
                  <span className="text-text-secondary text-xs hidden sm:block ml-auto">{step.desc}</span>
                </div>
              ))}
            </div>
            <h3 className="text-white text-lg font-poppins font-semibold mb-3">Resiliência</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-surface/50 border border-gold/10">
                <h4 className="text-gold text-sm font-semibold font-poppins mb-1">Circuit Breaker (Polly)</h4>
                <p className="text-text-secondary text-sm">Se o KRT Bank estiver offline, o circuito abre e evita chamadas desnecessárias.</p>
              </div>
              <div className="p-4 rounded-xl bg-surface/50 border border-gold/10">
                <h4 className="text-gold text-sm font-semibold font-poppins mb-1">Fallback</h4>
                <p className="text-text-secondary text-sm">Quando o KRT Bank está indisponível, o sistema informa o usuário e tenta novamente.</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Hero */}
      <section className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-surface/80 to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <h1 className="font-playfair text-3xl sm:text-4xl text-white mb-3">
            Documentação <span className="text-gold">AUREA Maison</span>
          </h1>
          <p className="text-text-secondary text-lg font-poppins">Manual de uso do sistema</p>
          <button
            onClick={handleDownloadPdf}
            disabled={generating}
            className="mt-6 px-6 py-3 rounded-xl bg-gold text-dark font-semibold text-sm font-poppins hover:bg-gold-light transition-colors duration-300 disabled:opacity-50 cursor-pointer border-none"
          >
            {generating ? 'Gerando PDF...' : 'Download Manual (PDF)'}
          </button>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden px-4 py-3 rounded-xl bg-surface border border-gold/20 text-gold text-sm font-poppins font-medium cursor-pointer flex items-center justify-between"
          >
            <span>{sections.find(s => s.id === active)?.label || 'Menu'}</span>
            <span className={`transition-transform duration-300 ${mobileMenuOpen ? 'rotate-180' : ''}`}>▾</span>
          </button>

          {/* Sidebar */}
          <nav className={`lg:w-64 shrink-0 ${mobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="lg:sticky lg:top-32 flex flex-col gap-1">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setActive(s.id); setMobileMenuOpen(false); }}
                  className={`text-left px-4 py-2.5 rounded-lg text-sm font-poppins transition-all duration-200 border-none cursor-pointer ${
                    active === s.id
                      ? 'bg-gold/15 text-gold font-medium'
                      : 'bg-transparent text-text-secondary hover:text-white hover:bg-surface/50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Content area */}
          <div id="docs-content" className="flex-1 min-w-0">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({ num, title, text }: { num: number; title: string; text: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-surface/50 border border-gold/10">
      <span className="bg-gold/20 text-gold text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full shrink-0 font-poppins">
        {num}
      </span>
      <div>
        <h4 className="text-white text-sm font-semibold font-poppins mb-1">{title}</h4>
        <p className="text-text-secondary text-sm">{text}</p>
      </div>
    </div>
  );
}
