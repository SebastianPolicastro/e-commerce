import { onAuthStateChanged } from 'firebase/auth';
import { arrayRemove, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { FaShoppingCart, FaTrashAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import CartContext from '../context/CartContext';
import { auth, db } from '../firebase/config';
// import './styles/custom.css'; // No es necesario si es global

const SkeletonCard = () => (
  <div className="col-12 col-sm-6 col-md-4 col-lg-3 d-flex"> {/* Añadido d-flex para consistencia con ItemListContainer si se usa el mismo Skeleton */}
    <div className="card product-card skeleton-card">
      <div className="skeleton-img"></div>
      <div className="card-body">
        <div className="skeleton-title"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-button"></div>
        <div className="skeleton-button-small"></div>
      </div>
    </div>
  </div>
);

function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const { agregarAlCarrito } = useContext(CartContext);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoadingAuth(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (currentUser) {
        setLoadingWishlist(true);
        try {
          const wishlistDocRef = doc(db, 'wishlists', currentUser.uid);
          const wishlistDocSnap = await getDoc(wishlistDocRef);
          if (wishlistDocSnap.exists()) {
            setWishlistItems(wishlistDocSnap.data().items || []);
          } else {
            setWishlistItems([]);
          }
        } catch (error) {
          console.error("Error al obtener wishlist:", error);
          toast.error("Error al cargar tu Wishlist. Inténtalo de nuevo.");
          setWishlistItems([]);
        } finally {
          setLoadingWishlist(false);
        }
      } else if (!loadingAuth) {
        setWishlistItems([]);
        setLoadingWishlist(false);
      }
    };

    if (!loadingAuth) {
      fetchWishlist();
    }
  }, [currentUser, loadingAuth]);

  const handleRemoveFromWishlist = async (itemToRemove) => {
    if (!currentUser) return;
    try {
      const wishlistDocRef = doc(db, 'wishlists', currentUser.uid);
      await updateDoc(wishlistDocRef, {
        items: arrayRemove(itemToRemove)
      });
      setWishlistItems(prevItems => prevItems.filter(item => item.id !== itemToRemove.id));
      toast.info(`"${itemToRemove.nombre}" removido de Wishlist.`);
    } catch (error) {
      console.error('Error al remover de wishlist:', error);
      toast.error('Hubo un error al remover el producto de tu wishlist.');
    }
  };

  const handleAddToCarAndRemoveFromWishlist = (item) => {
    if (item.stock === 0) {
        toast.error(`"${item.nombre}" no tiene stock disponible para añadir al carrito.`);
        return;
    }
    agregarAlCarrito({ ...item, cantidad: 1 });
    handleRemoveFromWishlist(item);
  };

  if (loadingAuth || loadingWishlist) {
    return (
      <div className="container mt-5"> {/* Este container es el de la página general, provisto por App.jsx si sigue esa estructura */}
        <div className="section-title-container"> {/* Asumiendo que quieres un título de sección como en otras páginas */}
            <h2 className="section-title mb-4">Mi Wishlist</h2>
        </div>
        <div className="row g-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mt-5 text-center">
        <h2>Acceso Denegado</h2>
        <p>Debes iniciar sesión para ver tu Wishlist.</p>
        <Link to="/auth" className="btn btn-primary mt-3">
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    // El <div className="container page-section"> vendrá de App.jsx
    // El título "Mi Wishlist" también vendrá del section-title-container en App.jsx
    <div className="wishlist-items-grid"> {/* CLASE ESPECÍFICA PARA LA CUADRÍCULA DE LA WISHLIST */}
      {wishlistItems.length === 0 ? (
        <p className="text-center w-100">Tu Wishlist está vacía. <Link to="/">¡Explora productos para añadir!</Link></p>
      ) : (
        <div className="row"> {/* No es necesario g-4 si las columnas tienen su propio padding/margin-bottom */}
          {wishlistItems.map((item) => (
            <div key={item.id} className="col-12 col-sm-6 col-md-4 col-lg-3 d-flex align-items-stretch"> {/* ASEGURAR d-flex y align-items-stretch */}
              <div className="card product-card"> {/* Esta es la tarjeta que queremos afectar */}
                {/* El link para la imagen si lo tienes */}
                <Link to={`/item/${item.id}`} className="product-card-link-image">
                    <img src={item.imagen} className="card-img-top" alt={item.nombre} />
                </Link>
                <div className="card-body">
                  <div className="card-content"> {/* Para agrupar título y precio */}
                    <h5 className="card-title">
                        <Link to={`/item/${item.id}`} className="product-card-link-title">
                            {item.nombre}
                        </Link>
                    </h5>
                    <p className="card-text price">${item.precio.toFixed(2)}</p> {/* Precio */}
                    {/* El texto de stock puede ir aquí o debajo del precio */}
                  </div>
                  <p className="card-text stock-text">Stock: {item.stock > 0 ? `Disponible: ${item.stock}` : 'Sin Stock'}</p>
                  <div className="product-actions"> {/* Contenedor de botones */}
                    <button
                      className="btn btn-primary btn-sm w-100 mb-2" /* Botón más prominente para añadir */
                      onClick={() => handleAddToCarAndRemoveFromWishlist(item)}
                      disabled={item.stock === 0}
                    >
                      {item.stock > 0 ? <FaShoppingCart /> : ''}
                      {item.stock > 0 ? ' Mover al Carrito' : 'Sin Stock'}
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm w-100" /* Botón para eliminar */
                      onClick={() => handleRemoveFromWishlist(item)}
                    >
                      <FaTrashAlt /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;