import { FaShoppingCart } from 'react-icons/fa'; // Importa el ícono de carrito

const CartWidget = ({ cantidadCarrito }) => {
  return (
    <div className="widget-carrito d-flex align-items-center">
      <FaShoppingCart size={22} className="me-1" /> {/* Usa el ícono */}
      {cantidadCarrito > 0 && <span className="badge bg-danger rounded-pill">{cantidadCarrito}</span>}
    </div>
  );
};

export default CartWidget;