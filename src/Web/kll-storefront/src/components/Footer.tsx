export default function Footer() {
  return (
    <footer className="bg-kll-900 text-gray-400 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-accent-400 font-bold text-xl mb-3">KLL Store</h3>
            <p className="text-sm">O melhor marketplace para suas compras online. Qualidade e seguranca em cada pedido.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/categories" className="hover:text-white transition">Categorias</a></li>
              <li><a href="/orders" className="hover:text-white transition">Meus Pedidos</a></li>
              <li><a href="/help" className="hover:text-white transition">Ajuda</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Contato</h4>
            <p className="text-sm">suporte@kllstore.com</p>
            <p className="text-sm mt-1">(85) 9 9999-9999</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm">
          <p>&copy; 2026 KLL Store. Todos os direitos reservados.</p>
          <p className="text-xs text-gray-500 mt-1">.NET 8 + React 18 + Kafka + PostgreSQL</p>
        </div>
      </div>
    </footer>
  );
}
