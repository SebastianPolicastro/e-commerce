const ItemQuantitySelector = ({ cantidad, onSumar, onRestar }) => {
  return (
    <div className="d-flex align-items-center justify-content-center my-3 item-quantity-selector-container">
      <button className="btn btn-outline-secondary me-2" onClick={onRestar}>
        -
      </button>
      <span className="fs-5">{cantidad}</span>
      <button className="btn btn-outline-secondary ms-2" onClick={onSumar}>
        +
      </button>
    </div>
  );
};

export default ItemQuantitySelector;