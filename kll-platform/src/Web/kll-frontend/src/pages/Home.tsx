import { Link } from 'react-router-dom';
import { FiTruck, FiShield, FiCreditCard, FiArrowRight } from 'react-icons/fi';

const categories = [
  { name: 'Electronics', emoji: '📱', color: 'from-blue-500 to-blue-600' },
  { name: 'Computers', emoji: '💻', color: 'from-purple-500 to-purple-600' },
  { name: 'Audio', emoji: '🎧', color: 'from-pink-500 to-pink-600' },
  { name: 'Furniture', emoji: '🪑', color: 'from-amber-500 to-amber-600' },
  { name: 'Peripherals', emoji: '🖱️', color: 'from-green-500 to-green-600' },
  { name: 'Gaming', emoji: '🎮', color: 'from-red-500 to-red-600' },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              A melhor experiência de compra com <span className="text-accent-400">entrega rastreada</span>
            </h1>
            <p className="mt-4 text-lg text-primary-100">
              Pagamento seguro via PIX integrado com KRT Bank. Rastreamento em tempo real. Milhares de produtos.
            </p>
            <div className="mt-8 flex gap-4">
              <Link to="/products" className="btn-accent inline-flex items-center gap-2">
                Ver Produtos <FiArrowRight />
              </Link>
              <Link to="/tracking" className="btn-secondary !text-white !border-white/30 hover:!bg-white/10">
                Rastrear Pedido
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4 p-6 card">
            <div className="p-3 bg-green-100 rounded-xl"><FiCreditCard className="text-green-600" size={24} /></div>
            <div>
              <h3 className="font-semibold">PIX Instantâneo</h3>
              <p className="text-sm text-gray-500 mt-1">Pagamento processado via KRT Bank com confirmação em segundos</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 card">
            <div className="p-3 bg-blue-100 rounded-xl"><FiTruck className="text-blue-600" size={24} /></div>
            <div>
              <h3 className="font-semibold">Rastreamento Real-time</h3>
              <p className="text-sm text-gray-500 mt-1">Acompanhe cada etapa da entrega pelo KLL Logistics</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 card">
            <div className="p-3 bg-purple-100 rounded-xl"><FiShield className="text-purple-600" size={24} /></div>
            <div>
              <h3 className="font-semibold">Compra Segura</h3>
              <p className="text-sm text-gray-500 mt-1">Dados protegidos com criptografia e anti-fraude</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-8">Categorias</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${cat.name}`}
              className="card p-6 text-center hover:scale-105 transition-transform"
            >
              <span className="text-4xl">{cat.emoji}</span>
              <p className="mt-2 font-medium text-sm">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Architecture Banner */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Arquitetura Distribuída</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            4 microserviços .NET 8 comunicando via Kafka e HTTP, com API Gateway YARP, PostgreSQL por serviço, Redis cache e integração com KRT Bank.
          </p>
          <div className="flex justify-center gap-6 flex-wrap">
            {['Store :5200', 'Pay :5300', 'Logistics :5400', 'Gateway :5100'].map((s) => (
              <div key={s} className="px-4 py-2 bg-gray-800 rounded-lg text-sm font-mono text-primary-400">{s}</div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}