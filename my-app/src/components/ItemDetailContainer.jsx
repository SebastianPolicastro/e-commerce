import { onAuthStateChanged } from 'firebase/auth';
import { arrayRemove, arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import CartContext from '../context/CartContext';
import { auth, db } from '../firebase/config';
import AddItemButton from './AddItemButton';
import ItemQuantitySelector from './ItemQuantitySelector';
import './styles/custom.css';


function ItemDetailContainer() {
  const { id } = useParams();
  const { agregarAlCarrito } = useContext(CartContext);
  const [producto, setProducto] = useState(null);
  const [cargandoProducto, setCargandoProducto] = useState(true);
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState(1);
  const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState({});

  const [currentUser, setCurrentUser] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loadingWishlistAction, setLoadingWishlistAction] = useState(false);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);


  useEffect(() => {
    const obtenerProducto = async () => {
      setCargandoProducto(true);
      try {
        const itemDocRef = doc(db, 'items', id);
        const docSnap = await getDoc(itemDocRef);

        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() };
          setProducto(productData);
          setCantidadSeleccionada(1);
          if (productData.opciones && productData.opciones.length > 0) {
            const initialOptions = {};
            productData.opciones.forEach(option => {
              if (option.valores && option.valores.length > 0) {
                initialOptions[option.nombre] = option.valores[0];
              }
            });
            setOpcionesSeleccionadas(initialOptions);
          } else {
            setOpcionesSeleccionadas({});
          }
        } else {
          setProducto(null);
        }
      } catch (errorObteniendoProducto) {
        console.error("Error al cargar el producto:", errorObteniendoProducto);
        toast.error("Error al cargar el producto.");
        setProducto(null);
      } finally {
        setCargandoProducto(false);
      }
    };
    obtenerProducto();
  }, [id]);

  useEffect(() => {
    if (!currentUser || !producto) {
      setIsInWishlist(false);
      return;
    }
    const checkWishlist = async () => {
      try {
        const wishlistDocRef = doc(db, 'wishlists', currentUser.uid);
        const wishlistDocSnap = await getDoc(wishlistDocRef);
        if (wishlistDocSnap.exists()) {
          const wishlistItems = wishlistDocSnap.data().items || [];
          setIsInWishlist(wishlistItems.some(item => item.id === producto.id));
        } else {
          setIsInWishlist(false);
        }
      } catch (errorCheckingWishlist) {
        console.error("Error verificando wishlist:", errorCheckingWishlist);
        setIsInWishlist(false);
      }
    };
    checkWishlist();
  }, [currentUser, producto]);


  const handleSumar = () => {
    if (producto && cantidadSeleccionada < producto.stock) {
      setCantidadSeleccionada(prev => prev + 1);
    }
  };

  const handleRestar = () => {
    setCantidadSeleccionada(prev => (prev > 1 ? prev - 1 : 1));
  };

  const handleOpcionChange = (nombreOpcion, valorSeleccionado) => {
    setOpcionesSeleccionadas(prev => ({
      ...prev,
      [nombreOpcion]: valorSeleccionado
    }));
  };

  const handleAddToCart = (cantidad) => {
    if (producto && cantidad > 0 && cantidad <= producto.stock) {
      const productoParaCarrito = { ...producto, cantidad: cantidad, opcionesSeleccionadas };
      agregarAlCarrito(productoParaCarrito);
    } else if (producto && cantidad > producto.stock) {
        toast.error(`No hay suficiente stock. Solo quedan ${producto.stock} unidades.`);
    } else if (producto && producto.stock === 0) {
        toast.error(`Producto sin stock disponible.`);
    }
  };

  const handleToggleWishlist = async () => {
    if (!currentUser) {
      toast.warn('Debes iniciar sesión para gestionar tu Wishlist.');
      return;
    }
    if (!producto) return;

    setLoadingWishlistAction(true);
    const wishlistDocRef = doc(db, 'wishlists', currentUser.uid);
    const productDetailsForWishlist = {
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      categoria: producto.categoria,
      descripcion: producto.descripcion,
      stock: producto.stock
    };

    try {
      const wishlistDocSnap = await getDoc(wishlistDocRef);
      if (isInWishlist) {
        await updateDoc(wishlistDocRef, { items: arrayRemove(productDetailsForWishlist) });
        toast.info(`${producto.nombre} removido de Wishlist.`);
        setIsInWishlist(false);
      } else {
        if (wishlistDocSnap.exists()) {
            await updateDoc(wishlistDocRef, { items: arrayUnion(productDetailsForWishlist) });
        } else {
            await setDoc(wishlistDocRef, { items: [productDetailsForWishlist] });
        }
        toast.success(`${producto.nombre} añadido a Wishlist.`);
        setIsInWishlist(true);
      }
    } catch (errorWishlist) {
      console.error("Error al actualizar wishlist:", errorWishlist);
      toast.error('Error al actualizar tu Wishlist.');
    } finally {
        setLoadingWishlistAction(false);
    }
  };


  if (cargandoProducto) {
    return (
        <div className="container page-section text-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
            </div>
        </div>
    );
  }

  if (!producto) {
    return (
        <div className="container page-section text-center">
            <h2>Producto no encontrado</h2>
            <p>El producto que buscas no existe o no está disponible.</p>
            <Link to="/" className="btn btn-primary mt-3">Volver al inicio</Link>
        </div>
    );
  }

  return (
    <div className="item-detail-card">
        <div className="row">
            <div className="col-md-6 item-detail-image-wrapper">
                 <img src={producto.imagen} className="card-img-top" alt={producto.nombre} />
            </div>
            <div className="col-md-6 item-detail-info">
                <h2 className="card-title">{producto.nombre}</h2>
                <p className="price">${producto.precio.toFixed(2)}</p>
                <p className="card-text">{producto.descripcion}</p>

                {producto.stock > 0 ? (
                    <p className="stock text-success">Stock disponible: {producto.stock}</p>
                 ) : (
                    <p className="stock text-danger fw-bold">Producto sin stock</p>
                )}

                {producto.opciones && producto.opciones.length > 0 && (
                    <div className="options-container my-3">
                    {producto.opciones.map(option => (
                        <div key={option.nombre} className="mb-2">
                        <label htmlFor={`select-${option.nombre}`} className="form-label">{option.nombre}:</label>
                        <select
                            id={`select-${option.nombre}`}
                            className="form-select form-select-sm"
                            value={opcionesSeleccionadas[option.nombre] || ''}
                            onChange={(e) => handleOpcionChange(option.nombre, e.target.value)}
                        >
                            {option.valores.map(valor => (
                            <option key={valor} value={valor}>{valor}</option>
                            ))}
                        </select>
                        </div>
                    ))}
                    </div>
                )}

                {producto.stock > 0 && (
                    <>
                    <ItemQuantitySelector
                        cantidad={cantidadSeleccionada}
                        onSumar={handleSumar}
                        onRestar={handleRestar}
                    />
                    <AddItemButton
                        onAddToCart={handleAddToCart}
                        cantidad={cantidadSeleccionada}
                        className="btn btn-primary w-100 mb-2"
                    />
                    </>
                )}
                {currentUser && (
                    <button
                    className={`btn ${isInWishlist ? 'btn-accent' : 'btn-outline-accent'} w-100 btn-sm`}
                    onClick={handleToggleWishlist}
                    disabled={loadingWishlistAction}
                    >
                    {loadingWishlistAction ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                        isInWishlist ? <FaHeart className="me-1" /> : <FaRegHeart className="me-1" />
                    )}
                    {isInWishlist ? 'En Wishlist' : 'Añadir a Wishlist'}
                    </button>
                )}
            </div>
        </div>
    </div>
  );
}

export default ItemDetailContainer;