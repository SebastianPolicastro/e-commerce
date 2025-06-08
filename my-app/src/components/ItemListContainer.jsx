import { onAuthStateChanged } from 'firebase/auth';
import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { FaEye, FaHeart, FaRegHeart, FaShoppingCart } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import CartContext from '../context/CartContext';
import { auth, db } from '../firebase/config';
import './styles/custom.css';

const SkeletonCard = () => (
  <div className="col-12 col-sm-6 col-md-4 col-lg-3 d-flex">
    <div className="card product-card skeleton-card">
      <div className="skeleton-img"></div>
      <div className="card-body">
        <div className="skeleton-title"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  </div>
);

function ItemListContainer() {
  const { categoryId } = useParams();
  const { agregarAlCarrito } = useContext(CartContext);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const obtenerProductos = async () => {
      setCargando(true);
      try {
        const productosRef = collection(db, 'items');
        const q = categoryId
          ? query(productosRef, where('categoria', '==', categoryId))
          : productosRef;

        const querySnapshot = await getDocs(q);
        const productosData = querySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        if (currentUser) {
            const wishlistDocRef = doc(db, 'wishlists', currentUser.uid);
            const wishlistDocSnap = await getDoc(wishlistDocRef);
            if (wishlistDocSnap.exists()) {
                const wishlistItems = wishlistDocSnap.data().items || [];
                const productosConWishlistStatus = productosData.map(p => ({
                    ...p,
                    isInWishlist: wishlistItems.some(item => item.id === p.id)
                }));
                setProductos(productosConWishlistStatus);
            } else {
                setProductos(productosData.map(p => ({ ...p, isInWishlist: false })));
            }
        } else {
            setProductos(productosData.map(p => ({ ...p, isInWishlist: false })));
        }

      } catch (error) {
        console.error("Error al obtener productos:", error);
        toast.error("Error al cargar los productos. Inténtalo de nuevo.");
      } finally {
        setCargando(false);
      }
    };

    obtenerProductos();
  }, [categoryId, currentUser]);

  const handleToggleWishlist = async (producto) => {
    if (!currentUser) {
      toast.warn('Debes iniciar sesión para añadir a tu Wishlist.');
      return;
    }

    const wishlistDocRef = doc(db, 'wishlists', currentUser.uid);

    try {
      const productDataForWishlist = {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: producto.imagen,
        categoria: producto.categoria,
        descripcion: producto.descripcion,
        stock: producto.stock
      };
      const currentWishlistDoc = await getDoc(wishlistDocRef);

      if (producto.isInWishlist) {
        if (currentWishlistDoc.exists()) {
            await updateDoc(wishlistDocRef, {
              items: arrayRemove(productDataForWishlist)
            });
        }
        toast.info(`${producto.nombre} removido de Wishlist.`);
      } else {
        if (currentWishlistDoc.exists()) {
            await updateDoc(wishlistDocRef, {
              items: arrayUnion(productDataForWishlist)
            });
        } else {
            await setDoc(wishlistDocRef, { items: [productDataForWishlist] });
        }
        toast.success(`${producto.nombre} añadido a Wishlist.`);
      }
      setProductos(prevProductos =>
        prevProductos.map(p =>
          p.id === producto.id ? { ...p, isInWishlist: !p.isInWishlist } : p
        )
      );
    } catch (error) {
      console.error('Error al actualizar wishlist:', error);
      toast.error('Hubo un error al actualizar tu wishlist.');
    }
  };

  return (
    <div className="container page-section">
      <div className="products-grid">
        {cargando ? (
          <div className="row g-4">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="row">
            {productos.map((producto) => (
              <div key={producto.id} className="col-12 col-sm-6 col-md-4 col-lg-3 d-flex">
                <div className="card product-card">
                  <Link to={`/item/${producto.id}`} className="product-card-link-image">
                    <img src={producto.imagen} className="card-img-top" alt={producto.nombre} />
                  </Link>
                  <div className="card-body">
                    <div className="card-content">
                      <h5 className="card-title">
                        <Link to={`/item/${producto.id}`} className="product-card-link-title">
                            {producto.nombre}
                        </Link>
                      </h5>
                      <p className="card-text">${producto.precio.toFixed(2)}</p>
                    </div>
                    <div className="product-actions">
                      <div className="product-actions-main">
                        <Link to={`/item/${producto.id}`} className="btn btn-outline-secondary btn-sm">
                          <FaEye /> Detalles
                        </Link>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => agregarAlCarrito({ ...producto, cantidad: 1 })}
                          disabled={producto.stock === 0}
                        >
                          <FaShoppingCart /> {producto.stock > 0 ? 'Añadir' : 'Sin Stock'}
                        </button>
                      </div>
                      {currentUser && (
                        <button
                          className={`btn btn-wishlist ${producto.isInWishlist ? 'btn-accent' : 'btn-outline-accent'} btn-sm`}
                          onClick={() => handleToggleWishlist(producto)}
                        >
                          {producto.isInWishlist ? <FaHeart /> : <FaRegHeart />}
                          {producto.isInWishlist ? 'En Wishlist' : 'Añadir a Wishlist'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {!cargando && productos.length === 0 && (
          <p className="text-center w-100">No se encontraron productos en esta categoría.</p>
        )}
      </div>
    </div>
  );
}

export default ItemListContainer;