import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CartContext from '../context/CartContext';
import { auth, db } from '../firebase/config';
import './styles/custom.css';

function Navbar() {
  const { cantidadCarrito } = useContext(CartContext);
  const [categorias, setCategorias] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const obtenerCategorias = async () => {
      try {
        const categoriasRef = collection(db, 'categories');
        const querySnapshot = await getDocs(categoriasRef);
        const categoriasData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategorias(categoriasData);
      } catch (error) {
        console.error("Error al obtener categorías:", error);
      }
    };
    obtenerCategorias();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('Sesión cerrada con éxito.');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container-fluid d-flex justify-content-between align-items-center"> {/* Usar container-fluid para full width y luego max-width en CSS */}
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <img src="/images/logo.webp" alt="Logo" className="navbar-logo me-2" />
          <span className="brand-name">MiTienda</span>
        </Link>

      
        <div className="cart-container d-flex align-items-center me-3"> 
          <Link to="/carrito" className="btn btn-outline-primary d-flex align-items-center">
            <i className="bi bi-cart me-2"></i>
            Carrito <span className="badge ms-2">{cantidadCarrito}</span>
          </Link>
        </div>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto d-flex align-items-center">
            <li className="nav-item">
              <Link to="/" className="nav-link styled-link">
                Inicio
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/about" className="nav-link styled-link">
                Sobre Nosotros
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/contact" className="nav-link styled-link">
                Contáctanos
              </Link>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle styled-link"
                href="#"
                id="categoriesDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Categorías
              </a>
              <ul className="dropdown-menu" aria-labelledby="categoriesDropdown">
                {categorias.map((categoria) => (
                  <li key={categoria.id}>
                    <Link to={`/categoria/${categoria.id}`} className="dropdown-item">
                      {categoria.nombre}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            {user && (
              <>
                <li className="nav-item">
                  <Link to="/my-orders" className="nav-link styled-link">
                    Mis Órdenes
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/wishlist" className="nav-link styled-link">
                    Wishlist
                  </Link>
                </li>
              </>
            )}
            <li className="nav-item">
              {user ? (
                <div className="nav-link d-flex align-items-center">
                  <span className="me-2 text-muted">{user.email}</span>
                  <button className="btn btn-sm btn-outline-secondary" onClick={handleLogout}>
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <Link to="/auth" className="nav-link styled-link">
                  Iniciar Sesión
                </Link>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;