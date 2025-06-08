import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase/config';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true); // Estado de carga para las órdenes
  const [loadingAuth, setLoadingAuth] = useState(true); // Estado de carga para la autenticación
  const [currentUser, setCurrentUser] = useState(null);

  // Efecto para observar el estado de autenticación (se ejecuta una vez)
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoadingAuth(false); // La carga de autenticación ha terminado
    });
    return () => unsubscribeAuth(); // Limpia la suscripción
  }, []);

  // Efecto para obtener órdenes basado en el usuario actual y el fin de la carga de autenticación
  useEffect(() => {
    const fetchOrders = async () => {
      if (currentUser) {
        setLoadingOrders(true); // Inicia la carga de órdenes
        try {
          const ordersRef = collection(db, 'orders');
          const q = query(
            ordersRef,
            where('userId', '==', currentUser.uid),
            orderBy('fecha', 'desc')
          );
          const querySnapshot = await getDocs(q);
          const userOrders = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            fecha: doc.data().fecha.toDate(),
          }));
          setOrders(userOrders);
        } catch (error) {
          console.error("Error al obtener mis órdenes:", error);
        } finally {
          setLoadingOrders(false); // Finaliza la carga de órdenes
        }
      } else if (!loadingAuth) {
        // Si no hay usuario y la carga de autenticación ya terminó, no hay órdenes que cargar
        setOrders([]);
        setLoadingOrders(false);
      }
    };

    // Solo ejecuta fetchOrders si la autenticación ya cargó
    if (!loadingAuth) {
      fetchOrders();
    }
  }, [currentUser, loadingAuth]); // Depende de currentUser y de que loadingAuth sea false

  if (loadingAuth || loadingOrders) { // Muestra "Cargando órdenes..." si la autenticación o las órdenes están cargando
    return <p className="text-center mt-5">Cargando órdenes...</p>;
  }

  if (!currentUser) {
    return (
      <div className="container mt-5 text-center">
        <h2>Acceso Denegado</h2>
        <p>Debes iniciar sesión para ver tus órdenes.</p>
        <Link to="/auth" className="btn btn-primary mt-3">
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Mis Órdenes</h2>
      {orders.length === 0 ? (
        <p>No tienes órdenes realizadas. <Link to="/">¡Empieza a comprar!</Link></p>
      ) : (
        <ul className="list-group">
          {orders.map((order) => (
            <li key={order.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-1">Orden #{order.id}</h5>
                <p className="mb-1">Fecha: {order.fecha.toLocaleString()}</p>
                <p className="mb-1">Total: ${order.total.toFixed(2)}</p>
                <p className="mb-0">Estado: {order.estado}</p>
              </div>
              <Link to={`/order/${order.id}`} className="btn btn-info btn-sm">
                Ver Detalles
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyOrders;