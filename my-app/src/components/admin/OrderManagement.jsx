import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../firebase/config';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const ordersRef = collection(db, 'orders');
                const q = query(ordersRef, orderBy('fecha', 'desc'));
                const querySnapshot = await getDocs(q);
                const allOrders = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    fecha: doc.data().fecha.toDate(),
                }));
                setOrders(allOrders);
            } catch (error) {
                console.error("Error al obtener órdenes:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) {
        return <p>Cargando órdenes...</p>;
    }

    return (
        <div>
            <h4>Historial de Órdenes</h4>
            {orders.length === 0 ? (
                <p>No hay órdenes para mostrar.</p>
            ) : (
                <div className="list-group">
                    {orders.map(order => (
                        <div key={order.id} className="list-group-item list-group-item-action flex-column align-items-start mb-2">
                            <div className="d-flex w-100 justify-content-between">
                                <h5 className="mb-1">Orden: {order.id}</h5>
                                <small>{order.fecha.toLocaleDateString()}</small>
                            </div>
                            <p className="mb-1">Comprador: {order.comprador.nombre} {order.comprador.apellido} ({order.comprador.email})</p>
                            <p className="mb-1"><strong>Total: ${order.total.toFixed(2)}</strong></p>
                            <Link to={`/order/${order.id}`} className="btn btn-sm btn-info">Ver Detalles</Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderManagement;