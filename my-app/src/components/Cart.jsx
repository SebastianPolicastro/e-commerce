import { useContext } from 'react';
import { FaCheckCircle, FaMinus, FaPlus, FaTrashAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import CartContext from '../context/CartContext';
import './styles/custom.css'; // Asegúrate de que los estilos se importen

function Carrito() {
  const { carrito, agregarAlCarrito, eliminarDelCarrito, vaciarCarrito } = useContext(CartContext);

  const totalCarrito = carrito.reduce((acc, prod) => acc + (prod.precio * prod.cantidad), 0);

  const getOptionsString = (options) => {
    if (!options || Object.keys(options).length === 0) {
      return '';
    }
    return ` (${Object.entries(options).map(([key, value]) => `${key}: ${value}`).join(', ')})`;
  };

  return (
    // Quitamos el <div className="container mt-5">. El título se manejará en App.jsx
    // El contenedor general y el título "Carrito de Compras" vienen de App.jsx
    <>
      {carrito.length === 0 ? (
        <p className="text-center">El carrito está vacío. <Link to="/">Explora nuestros productos</Link>.</p>
      ) : (
        <div className="cart-content-wrapper"> {/* Nuevo contenedor para aplicar max-width */}
          <ul className="list-group mb-3">
            {carrito.map((producto) => (
              <li key={`${producto.id}-${JSON.stringify(producto.opcionesSeleccionadas || {})}`} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  {producto.nombre}
                  {getOptionsString(producto.opcionesSeleccionadas)}
                  <br />
                  <small className="text-muted">${producto.precio.toFixed(2)} c/u</small>
                </div>
                <div className="d-flex align-items-center">
                  <button
                    className="btn btn-outline-danger btn-sm me-2" // Cambiado a btn-outline-danger
                    onClick={() => eliminarDelCarrito(producto.id, producto.opcionesSeleccionadas)}
                    aria-label={`Restar ${producto.nombre}`}
                  >
                    <FaMinus />
                  </button>
                  <span className="mx-2 quantity-text">{producto.cantidad}</span>
                  <button
                    className="btn btn-outline-primary btn-sm ms-2" // Cambiado a btn-outline-primary
                    onClick={() => agregarAlCarrito({ ...producto, cantidad: 1 })}
                    aria-label={`Sumar ${producto.nombre}`}
                    disabled={producto.cantidad >= producto.stock}
                  >
                    <FaPlus />
                  </button>
                </div>
              </li>
            ))}
            <li className="list-group-item d-flex justify-content-between fw-bold">
              <span>Total del carrito:</span>
              <span>${totalCarrito.toFixed(2)}</span>
            </li>
          </ul>
          <div className="cart-actions"> {/* Usamos la clase que ya teníamos para los botones */}
            <button className="btn btn-outline-danger" onClick={vaciarCarrito}>
              <FaTrashAlt className="me-1" /> Vaciar Carrito
            </button>
            <Link to="/checkout" className="btn btn-success btn-lg">
              <FaCheckCircle className="me-1" /> Finalizar Compra
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export default Carrito;