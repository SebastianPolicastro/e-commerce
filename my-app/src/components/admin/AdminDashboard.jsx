import { NavLink, Outlet } from 'react-router-dom';
import './AdminStyles.css'; // Crearemos este archivo para estilos básicos

const AdminDashboard = () => {
    return (
        <div className="admin-dashboard">
            <h2 className="mb-4">Panel de Administración</h2>
            <nav className="nav nav-pills flex-column flex-sm-row mb-4">
                <NavLink to="products" className="nav-link">Gestionar Productos</NavLink>
                <NavLink to="orders" className="nav-link">Ver Órdenes</NavLink>
            </nav>
            <div className="card">
                <div className="card-body">
                    {/* Aquí se renderizará ProductManagement u OrderManagement */}
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;