// RUTA: src/components/Checkout.jsx

import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, Timestamp, writeBatch } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CartContext from '../context/CartContext';
import { auth, db } from '../firebase/config';

function Checkout() {
    const { carrito, vaciarCarrito } = useContext(CartContext);
    const [orderId, setOrderId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [preferenceId, setPreferenceId] = useState(null);

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [emailConfirmacion, setEmailConfirmacion] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && carrito.length === 0 && !orderId) {
            toast.info('Tu carrito está vacío, te redirigimos a la tienda.');
            navigate('/');
        }
    }, [carrito, loading, orderId, navigate]);

    useEffect(() => {
        initMercadoPago('TEST-d8850eb0-25b4-4f0f-8625-703448900b43', { locale: 'es-AR' });
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (user) {
                setEmail(user.email);
                setEmailConfirmacion(user.email);
            }
        });
        return () => unsubscribe();
    }, []);

    const totalCompra = carrito.reduce((acc, prod) => acc + (prod.precio * prod.cantidad), 0);

    // --- ESTA FUNCIÓN ESTÁ CORREGIDA ---
    const createPreference = async (itemsDeLaOrden) => {
        try {
            const response = await fetch('http://localhost:3001/create_preference', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // El body ahora solo contiene la propiedad "items"
                body: JSON.stringify({ items: itemsDeLaOrden }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error del servidor');
            }
            const data = await response.json();
            return data.id;
        } catch (error) {
            console.error('Error en createPreference:', error);
            toast.error(`No se pudo crear el link de pago: ${error.message}`);
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (email !== emailConfirmacion) {
            toast.error('Los correos electrónicos no coinciden.');
            setLoading(false);
            return;
        }
        
        // Preparamos los items en el formato que necesita el backend
        const itemsParaEnviar = carrito.map(prod => ({
            id: prod.id,
            title: prod.nombre,
            unit_price: Number(prod.precio),
            quantity: Number(prod.cantidad),
        }));
        
        const orden = {
            comprador: { nombre, apellido, telefono, email: currentUser ? currentUser.email : email },
            items: itemsParaEnviar, // usamos los items ya formateados
            total: totalCompra,
            fecha: Timestamp.fromDate(new Date()),
            estado: 'generada',
            userId: currentUser ? currentUser.uid : null,
        };

        try {
            const batch = writeBatch(db);
            for (const prod of carrito) {
                const docRef = doc(db, 'items', prod.id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().stock >= prod.cantidad) {
                    batch.update(docRef, { stock: docSnap.data().stock - prod.cantidad });
                } else {
                    toast.error(`El producto ${prod.nombre} no tiene stock suficiente.`);
                    setLoading(false);
                    return; 
                }
            }

            const docRef = await addDoc(collection(db, 'orders'), orden);
            setOrderId(docRef.id);
            await batch.commit();

            // Llamamos a createPreference SOLAMENTE con los items.
            const prefId = await createPreference(itemsParaEnviar);
            
            if (prefId) {
                setPreferenceId(prefId);
                vaciarCarrito();
            }
        } catch (error) {
            console.error("Error al procesar la orden:", error);
            toast.error('Hubo un error al guardar tu orden.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p className="text-center mt-5">Procesando tu orden...</p>;

    if (preferenceId) {
        return (
            <div className="container mt-5 text-center">
                <h2>¡Casi listo! Finaliza tu pago</h2>
                <p>Tu orden <strong>{orderId}</strong> ha sido generada.</p>
                <p>Haz clic en el botón para pagar de forma segura con Mercado Pago.</p>
                <Wallet initialization={{ preferenceId }} />
            </div>
        );
    }
    
    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-body">
                            <h4 className="mb-4">Datos del comprador</h4>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="nombre" className="form-label">Nombre</label>
                                    <input type="text" className="form-control" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="apellido" className="form-label">Apellido</label>
                                    <input type="text" className="form-control" id="apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="telefono" className="form-label">Teléfono</label>
                                    <input type="tel" className="form-control" id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
                                </div>
                                {!currentUser && (
                                    <>
                                        <div className="mb-3">
                                            <label htmlFor="email" className="form-label">Email</label>
                                            <input type="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="emailConfirmacion" className="form-label">Confirmar Email</label>
                                            <input type="email" className="form-control" id="emailConfirmacion" value={emailConfirmacion} onChange={(e) => setEmailConfirmacion(e.target.value)} required />
                                        </div>
                                    </>
                                )}
                                <button type="submit" className="btn btn-success w-100" disabled={loading}>
                                    {loading ? 'Procesando...' : 'Generar Orden y Pagar'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;