import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { db } from '../../firebase/config';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({ nombre: '', descripcion: '', precio: '', stock: '', categoria: '', imagen: '' });
    const [editingId, setEditingId] = useState(null); // Para saber si estamos editando o creando

    const fetchProducts = async () => {
        const productsCollection = collection(db, 'items');
        const productSnapshot = await getDocs(productsCollection);
        const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productList);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const resetForm = () => {
        setFormData({ nombre: '', descripcion: '', precio: '', stock: '', categoria: '', imagen: '' });
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const productData = {
            ...formData,
            precio: Number(formData.precio),
            stock: Number(formData.stock),
        };

        try {
            if (editingId) {
                // Actualizando un producto existente
                const productRef = doc(db, 'items', editingId);
                await updateDoc(productRef, productData);
                toast.success('¡Producto actualizado con éxito!');
            } else {
                // Creando un producto nuevo
                await addDoc(collection(db, 'items'), productData);
                toast.success('¡Producto añadido con éxito!');
            }
            resetForm();
            fetchProducts(); // Refrescar la lista de productos
        } catch (error) {
            console.error("Error al guardar el producto:", error);
            toast.error('Hubo un error al guardar el producto.');
        }
    };

    const handleEdit = (product) => {
        setFormData({ ...product });
        setEditingId(product.id);
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
            try {
                await deleteDoc(doc(db, 'items', id));
                toast.info('Producto eliminado.');
                fetchProducts(); // Refrescar la lista
            } catch (error) {
                console.error("Error al eliminar el producto:", error);
                toast.error('Hubo un error al eliminar el producto.');
            }
        }
    };

    return (
        <div>
            <h4>{editingId ? 'Editando Producto' : 'Añadir Nuevo Producto'}</h4>
            <form onSubmit={handleSubmit} className="mb-5">
                {/* Aquí podrías tener más campos del formulario */}
                <input name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Nombre" required className="form-control mb-2" />
                <input name="descripcion" value={formData.descripcion} onChange={handleInputChange} placeholder="Descripción" required className="form-control mb-2" />
                <input name="precio" type="number" value={formData.precio} onChange={handleInputChange} placeholder="Precio" required className="form-control mb-2" />
                <input name="stock" type="number" value={formData.stock} onChange={handleInputChange} placeholder="Stock" required className="form-control mb-2" />
                <input name="categoria" value={formData.categoria} onChange={handleInputChange} placeholder="Categoría" required className="form-control mb-2" />
                <input name="imagen" value={formData.imagen} onChange={handleInputChange} placeholder="URL de la Imagen" required className="form-control mb-2" />
                <button type="submit" className="btn btn-primary me-2">{editingId ? 'Actualizar' : 'Añadir'}</button>
                {editingId && <button type="button" onClick={resetForm} className="btn btn-secondary">Cancelar Edición</button>}
            </form>

            <h4>Listado de Productos</h4>
            <ul className="list-group">
                {products.map(product => (
                    <li key={product.id} className="list-group-item d-flex justify-content-between align-items-center">
                        {product.nombre}
                        <div>
                            <button onClick={() => handleEdit(product)} className="btn btn-sm btn-warning me-2">Editar</button>
                            <button onClick={() => handleDelete(product.id)} className="btn btn-sm btn-danger">Eliminar</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProductManagement;