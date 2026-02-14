export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-xl font-bold text-white">KLL Store</span>
            </div>
            <p className="text-sm">Plataforma de e-commerce distribuída com microserviços.</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/products" className="hover:text-white transition-colors">Produtos</a></li>
              <li><a href="/tracking" className="hover:text-white transition-colors">Rastrear Pedido</a></li>
              <li><a href="/orders" className="hover:text-white transition-colors">Meus Pedidos</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Serviços</h3>
            <ul className="space-y-2 text-sm">
              <li>KLL Store - Catálogo</li>
              <li>KLL Pay - Pagamentos</li>
              <li>KLL Logistics - Entregas</li>
              <li>KRT Bank - Gateway Financeiro</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Tech Stack</h3>
            <ul className="space-y-2 text-sm">
              <li>.NET 8 Microservices</li>
              <li>React + TypeScript</li>
              <li>PostgreSQL + Redis</li>
              <li>Kafka + RabbitMQ</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2025 KLL Platform — Distributed E-Commerce Ecosystem</p>
        </div>
      </div>
    </footer>
  );
}