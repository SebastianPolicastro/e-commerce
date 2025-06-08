import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { auth } from '../../firebase/config';

// ¡IMPORTANTE! Reemplaza esto con el UID de tu usuario administrador en Firebase.
// Lo encuentras en la consola de Firebase > Authentication > Users > User UID.
const ADMIN_UID = '5PsdAc292xcL7JpyDiL0cV7AGUu2';

const AdminRoute = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.uid === ADMIN_UID) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setIsChecking(false);
    });

    return () => unsubscribe();
  }, []);

  if (isChecking) {
    return <p className="text-center mt-5">Verificando permisos...</p>;
  }

  // Si es admin, renderiza el contenido de la ruta (Outlet). Si no, redirige a la página de inicio.
  return isAdmin ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;