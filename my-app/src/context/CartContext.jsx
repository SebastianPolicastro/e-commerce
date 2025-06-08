import { createContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify'; // Importa toast

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [carrito, setCarrito] = useState(() => {
    try {
      const persistedCart = localStorage.getItem('cart');
      return persistedCart ? JSON.parse(persistedCart) : [];
    } catch (error) {
      console.error("Error al cargar el carrito del localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(carrito));
    } catch (error) {
      console.error("Error al guardar el carrito en el localStorage:", error);
    }
  }, [carrito]);

  const areOptionsEqual = (options1, options2) => {
    const keys1 = Object.keys(options1 || {});
    const keys2 = Object.keys(options2 || {});

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (let key of keys1) {
      if (options1[key] !== options2[key]) {
        return false;
      }
    }
    return true;
  };

  const agregarAlCarrito = (producto) => {
    const productoExistente = carrito.find((item) =>
      item.id === producto.id && areOptionsEqual(item.opcionesSeleccionadas, producto.opcionesSeleccionadas)
    );

    if (productoExistente) {
      setCarrito(
        carrito.map((item) =>
          item.id === producto.id && areOptionsEqual(item.opcionesSeleccionadas, producto.opcionesSeleccionadas)
            ? { ...item, cantidad: item.cantidad + (producto.cantidad || 1) }
            : item
        )
      );
      toast.info(`Se añadió una unidad más de ${producto.nombre} al carrito.`); // Notificación
    } else {
      setCarrito([...carrito, { ...producto, cantidad: producto.cantidad || 1 }]);
      toast.success(`${producto.nombre} añadido al carrito.`); // Notificación
    }
  };

  const eliminarDelCarrito = (idProducto, opcionesProducto = {}) => {
    const itemIndexToRemove = carrito.findIndex((item) =>
      item.id === idProducto && areOptionsEqual(item.opcionesSeleccionadas, opcionesProducto)
    );

    if (itemIndexToRemove > -1) {
      const itemToUpdate = carrito[itemIndexToRemove];
      if (itemToUpdate.cantidad > 1) {
        setCarrito(
          carrito.map((item, index) =>
            index === itemIndexToRemove ? { ...item, cantidad: item.cantidad - 1 } : item
          )
        );
        toast.info(`Se eliminó una unidad de ${itemToUpdate.nombre}.`); // Notificación
      } else {
        setCarrito(carrito.filter((item, index) => index !== itemIndexToRemove));
        toast.error(`${itemToUpdate.nombre} eliminado del carrito.`); // Notificación
      }
    }
  };

  const vaciarCarrito = () => {
    setCarrito([]);
    toast.warn('El carrito ha sido vaciado.'); // Notificación
  };

  const cantidadCarrito = carrito.reduce((total, producto) => total + producto.cantidad, 0);

  return (
    <CartContext.Provider value={{ carrito, agregarAlCarrito, eliminarDelCarrito, cantidadCarrito, vaciarCarrito }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;