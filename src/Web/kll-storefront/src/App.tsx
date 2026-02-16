import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import { useCartStore } from "./store/cartStore";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Search from "./pages/Search";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";

export default function App() {
  const { init, isAuthenticated } = useAuthStore();
  const { fetchCart } = useCartStore();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/search" element={<Search />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/order/:id" element={<Orders />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
