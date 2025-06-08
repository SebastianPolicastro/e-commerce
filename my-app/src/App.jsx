import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes, useParams } from 'react-router-dom';
import Auth from './components/Auth';
import Carrito from './components/Cart';
import Checkout from './components/Checkout';
import ItemDetailContainer from './components/ItemDetailContainer';
import ItemListContainer from './components/ItemListContainer';
import MyOrders from './components/MyOrders';
import Navbar from './components/NavBar';
import OrderDetail from './components/OrderDetail';
import './components/styles/custom.css';
import Wishlist from './components/Wishlist';
import { CartProvider } from './context/CartContext';
import { db } from './firebase/config';
import './index.css';

// --- IMPORTACIONES DEL PANEL DE ADMINISTRACIÓN AÑADIDAS AQUÍ ---
// Usamos rutas absolutas desde /src para evitar problemas.
// Asegúrate de que estos archivos existan en 'src/components/admin/'.
import AdminDashboard from '/src/components/admin/AdminDashboard.jsx';
import AdminRoute from '/src/components/admin/AdminRoute.jsx';
import OrderManagement from '/src/components/admin/OrderManagement.jsx';
import ProductManagement from '/src/components/admin/ProductManagement.jsx';
// ----------------------------------------------------------------

const CategoryPageLayout = () => {
  const { categoryId } = useParams();
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    if (categoryId) {
      const fetchCategoryName = async () => {
        try {
          const categoriasRef = collection(db, 'categories');
          const querySnapshot = await getDocs(categoriasRef);
          const categoriasData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          const foundCategory = categoriasData.find(cat => cat.id === categoryId);
          if (foundCategory) {
            setCategoryName(foundCategory.nombre);
          } else {
            setCategoryName(categoryId.charAt(0).toUpperCase() + categoryId.slice(1));
          }
        } catch (error) {
          console.error("Error fetching category name:", error);
          setCategoryName(categoryId.charAt(0).toUpperCase() + categoryId.slice(1));
        }
      };
      fetchCategoryName();
    }
  }, [categoryId]);

  const title = categoryId ? `Productos ${categoryName}` : 'Nuestros Productos';

  return (
    <div className="container page-section">
      <div className="section-title-container">
        <h2 className="section-title">{title}</h2>
      </div>
      <ItemListContainer />
    </div>
  );
};

function App() {
  return (
    <CartProvider>
      <Router>
        <div>
          <Navbar />
          <main className="app-main-content">
              <Routes>
                <Route
                  path="/"
                  element={
                    <>
                      <div className="hero">
                        <h1>Bienvenido a MiTienda</h1>
                        <p>Descubre nuestros increíbles productos y encuentra lo que necesitas.</p>
                      </div>
                      <div className="container page-section">
                        <div className="section-title-container">
                          <h2 className="section-title">Nuestros Productos</h2>
                        </div>
                        <ItemListContainer />
                      </div>
                    </>
                  }
                />
                <Route path="/categoria/:categoryId" element={<CategoryPageLayout />} />
                <Route path="/item/:id" element={
                  <div className="container page-section">
                    <ItemDetailContainer />
                  </div>
                } />
                <Route path="/carrito" element={
                  <div className="container page-section">
                    <div className="section-title-container">
                      <h2 className="section-title">Tu Carrito</h2>
                    </div>
                    <Carrito />
                  </div>
                } />
                <Route path="/checkout" element={
                  <div className="container page-section">
                    <div className="section-title-container">
                      <h2 className="section-title">Finalizar Compra</h2>
                    </div>
                    <div className="checkout-page-content">
                        <Checkout />
                    </div>
                  </div>
                } />
                <Route path="/auth" element={
                  <div className="container page-section">
                    <div className="auth-page-content">
                        <Auth />
                    </div>
                  </div>
                } />
                <Route path="/my-orders" element={
                  <div className="container page-section">
                     <div className="section-title-container">
                      <h2 className="section-title">Mis Órdenes</h2>
                    </div>
                    <MyOrders />
                  </div>
                } />
                <Route path="/order/:id" element={
                  <div className="container page-section">
                    <OrderDetail />
                  </div>
                } />
                <Route path="/wishlist" element={
                  <div className="container page-section">
                     <div className="section-title-container">
                      <h2 className="section-title">Mi Wishlist</h2>
                    </div>
                    <Wishlist />
                  </div>
                } />
                <Route path="/about" element={
                  <div className="container page-section">
                    <div className="section-title-container">
                        <h1 className="section-title">Sobre Nosotros</h1>
                    </div>
                  </div>
                } />
                <Route path="/contact" element={
                  <div className="container page-section">
                    <div className="section-title-container">
                        <h1 className="section-title">Contáctanos</h1>
                    </div>
                  </div>
                } />

                {/* --- RUTA PROTEGIDA PARA EL PANEL DE ADMIN AÑADIDA AQUÍ --- */}
                <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminDashboard />}>
                        <Route path="products" element={<ProductManagement />} />
                        <Route path="orders" element={<OrderManagement />} />
                    </Route>
                </Route>
                {/* ----------------------------------------------------------- */}

              </Routes>
          </main>
          <footer className="footer">
            <p>&copy; 2025 MiTienda. Todos los derechos reservados.</p>
          </footer>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;