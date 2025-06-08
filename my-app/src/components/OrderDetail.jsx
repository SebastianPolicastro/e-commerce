import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '../firebase/config';

function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, 'orders', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const orderData = { id: docSnap.id, ...docSnap.data() };
          if (orderData.fecha && typeof orderData.fecha.toDate === 'function') {
            orderData.fecha = orderData.fecha.toDate();
          }
          setOrder(orderData);
        } else {
          console.log("No se encontró la orden!");
          setOrder(null);
        }
      } catch (error) {
        console.error("Error al obtener los detalles de la orden:", error);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const getOptionsString = (options) => {
    if (!options || Object.keys(options).length === 0) {
      return '';
    }
    return ` (${Object.entries(options).map(([key, value]) => `${key}: ${value}`).join(', ')})`;
  };

  if (loading) {
    return <p className="text-center mt-5">Cargando detalles de la orden...</p>;
  }

  if (!order) {
    return (
      <div className="container mt-5 text-center">
        <h2>Orden no encontrada</h2>
        <p>La orden con ID {id} no existe o no se pudo cargar.</p>
        <Link to="/my-orders" className="btn btn-primary mt-3">
          Volver a Mis Órdenes
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Detalle de la Orden #{order.id}</h2>
      <div className="card">
        <div className="card-body">
          <p><strong>Fecha:</strong> {order.fecha ? order.fecha.toLocaleString() : 'N/A'}</p>
          <p><strong>Estado:</strong> {order.estado}</p>
          <h4 className="mt-4">Productos:</h4>
          <ul className="list-group mb-3">
            {order.items.map((item) => (
              <li key={`${item.id}-${JSON.stringify(item.opcionesSeleccionadas || {})}`} className="list-group-item d-flex justify-content-between">
                <span>
                  {item.nombre}
                  {getOptionsString(item.opcionesSeleccionadas)}
                  {' (x'}
                  {item.cantidad})
                </span>
                <span>${(item.precio * item.cantidad).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <h4 className="text-end">Total de la Orden: ${order.total.toFixed(2)}</h4>
          <Link to="/my-orders" className="btn btn-secondary mt-3">
            Volver a Mis Órdenes
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;