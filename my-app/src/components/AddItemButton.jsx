const AddItemButton = ({ onAddToCart, cantidad, className = "btn btn-primary mt-3" }) => {
  return (
    <button className={className} onClick={() => onAddToCart(cantidad)}>
      Añadir al carrito ({cantidad} {cantidad === 1 ? 'unidad' : 'unidades'})
    </button>
  );
};

export default AddItemButton;