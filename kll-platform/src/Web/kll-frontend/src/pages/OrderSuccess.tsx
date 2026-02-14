import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiPackage, FiHome } from 'react-icons/fi';

export default function OrderSuccess() {
  const { orderId } = useParams();

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <FiCheckCircle className="text-green-600" size={40} />
      </div>
      <h1 className="text-2xl font-bold mt-6">Pedido Confirmado!</h1>
      <p className="text-gray-500 mt-2">Seu pedido foi criado com sucesso e está aguardando pagamento via PIX.</p>

      <div className="card p-6 mt-8 text-left">
        <div className="text-sm space-y-3">
          <div className="flex justify-between"><span className="text-gray-500">Pedido</span><span className="font-mono font-medium">{orderId?.slice(0, 16)}...</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="badge bg-yellow-100 text-yellow-800">Aguardando PIX</span></div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-center mb-2">QR Code PIX</p>
          <div className="w-48 h-48 mx-auto bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <span className="text-gray-400 text-sm">QR Code gerado pelo KRT Bank</span>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">Escaneie com o app do seu banco</p>
        </div>
      </div>

      <div className="flex gap-4 mt-8 justify-center">
        <Link to="/orders" className="btn-primary flex items-center gap-2"><FiPackage /> Meus Pedidos</Link>
        <Link to="/" className="btn-secondary flex items-center gap-2"><FiHome /> Início</Link>
      </div>
    </div>
  );
}