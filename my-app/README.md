# MiTienda E-commerce

Este proyecto es una plataforma de e-commerce desarrollada con React y Vite. Su propósito es permitir a los usuarios explorar productos, visualizar sus detalles, añadirlos al carrito y completar un proceso de compra eficiente.

## Descripción del Proyecto

El desarrollo de MiTienda se enfocó en construir una aplicación robusta y de fácil mantenimiento. A continuación, se detallan las decisiones clave y funcionalidades implementadas:

-   **Gestión de Datos con Firebase Firestore**: Firebase Firestore se utiliza para el manejo de la información esencial del proyecto, incluyendo el catálogo de productos (`items`) y el registro de órdenes de compra (`orders`). Esta elección facilita la gestión dinámica de datos en tiempo real.

-   **Arquitectura Modular Basada en Componentes**: Para organizar el código y promover la reutilización, la interfaz de usuario se ha dividido en componentes modulares. Esto incluye elementos específicos como la `Navbar`, listados de productos (`ItemListContainer`), detalles de productos (`ItemDetailContainer`), el carrito de compras (`Cart`) y el flujo de pago (`Checkout`). Este enfoque mejora la claridad y la escalabilidad del proyecto.

-   **Manejo Centralizado del Carrito de Compras**: La información del carrito se gestiona mediante un Context de React (`CartContext`). Esto permite un acceso y modificación uniformes del carrito desde cualquier parte de la aplicación, optimizando la gestión del estado global.

-   **Navegación Intuitiva con React Router**: La implementación de `react-router-dom` asegura una navegación fluida y sin recargas completas de página. Esto habilita rutas limpias como `/`, `/categoria/:categoryId` o `/item/:id`, proporcionando una experiencia de usuario moderna.

-   **Mejoras en la Experiencia de Compra**: Se ha incorporado un selector de cantidad en la vista de detalle del producto. La lógica del carrito también se ha refinado para asegurar una adición y remoción de productos precisa.

-   **Autenticación de Usuarios**: Se ha integrado Firebase Authentication para permitir el registro y el inicio de sesión de usuarios.

-   **Historial de Órdenes**: Los usuarios autenticados tienen acceso a un historial detallado de sus compras en la sección "Mis Órdenes".

-   **Lista de Deseos (Wishlist)**: Se permite a los usuarios añadir productos a una lista de deseos personal, con persistencia en Firebase.

-   **Notificaciones al Usuario**: Se utiliza `react-toastify` para proporcionar notificaciones discretas y amigables al usuario en respuesta a diversas acciones (éxito, error, advertencia).

## Tecnologías Utilizadas

- **Frontend**:

\* **React** (versión 19.0.0)

\* **Vite** (versión 6.3.1)

- **Base de Datos / Backend-as-a-Service**:

\* **Firebase Firestore**

\* **Firebase Authentication**

- **Estilos**:

\* **Bootstrap** (versión 5.3.5)

\* **CSS Personalizado** (`custom.css`)

- **Manejo de Rutas**:

\* **React Router DOM** (versión 7.5.2)

## Librerías Implementadas y sus Funcionalidades

Aparte de las tecnologías principales, se integraron las siguientes librerías por sus aportes específicos:

- **`firebase` (JS SDK)**

\* [Link al Proyecto](https://firebase.google.com/docs/web/setup)

\* **Funcionalidad**: Permite la conexión y el uso de los servicios de Firebase, como Firestore para la base de datos y Authentication para la gestión de usuarios, agilizando el desarrollo del backend.

- **`react-router-dom`**

\* [Link al Proyecto](https://reactrouter.com/web/guides/quick-start)

\* **Funcionalidad**: Es el estándar para la gestión de rutas en aplicaciones React. Facilita una navegación sin interrupciones y la creación de URLs amigables dentro de la aplicación.

- **`bootstrap`**

\* [Link al Proyecto](https://getbootstrap.com/)

\* **Funcionalidad**: Provee un conjunto de componentes y utilidades CSS predefinidos que aceleran el desarrollo de interfaces responsivas y visualmente atractivas, como la barra de navegación, tarjetas de productos y formularios.

- **`react-icons`** (Versión: 5.5.0)

\* **Funcionalidad**: Permite la inclusión sencilla de iconos vectoriales en la interfaz de usuario, mejorando la estética y la usabilidad.

- **`react-toastify`** (Versión: 11.0.5)

\* **Funcionalidad**: Ofrece un sistema de notificaciones "toast" personalizable para proporcionar retroalimentación al usuario de manera no intrusiva ante diversas acciones o eventos.

## Configuración de Variables de Entorno (`.env`)

Para conectar la aplicación a tu proyecto de Firebase, es necesario configurar variables de entorno. Estas variables **no deben ser versionadas en repositorios públicos** por razones de seguridad.

1.  **Crea un archivo `.env`** en la **raíz de tu proyecto** (al mismo nivel que `package.json` y `vite.config.js`).

2.  **Añade el siguiente contenido** al archivo `.env` con tus credenciales de Firebase. Estas se obtienen de la Consola de Firebase, en la configuración de tu proyecto (dentro de "Tus aplicaciones", selecciona tu aplicación web).

```env

VITE_FIREBASE_API_KEY=

VITE_FIREBASE_AUTH_DOMAIN=

VITE_FIREBASE_PROJECT_ID=

VITE_FIREBASE_STORAGE_BUCKET=

VITE_FIREBASE_MESSAGING_SENDER_ID=

VITE_FIREBASE_APP_ID=

```

3.  **Asegúrate de que `.env` esté listado en tu archivo `.gitignore`**. Esto previene que se suba accidentalmente al repositorio.

## Cómo Levantar el Proyecto

Para configurar y ejecutar este proyecto en tu entorno local, sigue estos pasos:

1.  **Clonar el Repositorio:**
    Abre tu terminal o consola y clona el repositorio en tu máquina local usando HTTPS o SSH (reemplaza `tu-usuario/tu-repositorio.git` con la URL real de tu repositorio):

    ```bash
    git clone [https://github.com/tu-usuario/tu-repositorio.git](https://github.com/tu-usuario/tu-repositorio.git)
    ```

    Luego, navega al directorio del proyecto:

    ```bash
    cd tu-repositorio
    ```

2.  **Instalar Dependencias:**
    Este proyecto utiliza `npm` (Node Package Manager) para gestionar las dependencias. Ejecuta el siguiente comando en la raíz del proyecto para instalar todas las librerías necesarias definidas en el archivo `package.json`:

    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    Como se mencionó en la sección anterior, necesitas configurar tus credenciales de Firebase:

    - Crea un archivo llamado `.env` en la raíz del proyecto (al mismo nivel que `package.json`).
    - Añade tus claves de Firebase al archivo `.env` con el prefijo `VITE_`, como se muestra a continuación:
      ```env
      VITE_FIREBASE_API_KEY=TU_API_KEY
      VITE_FIREBASE_AUTH_DOMAIN=TU_AUTH_DOMAIN
      VITE_FIREBASE_PROJECT_ID=TU_PROJECT_ID
      VITE_FIREBASE_STORAGE_BUCKET=TU_STORAGE_BUCKET
      VITE_FIREBASE_MESSAGING_SENDER_ID=TU_MESSAGING_SENDER_ID
      VITE_FIREBASE_APP_ID=TU_APP_ID
      ```
    - Reemplaza `TU_API_KEY`, `TU_AUTH_DOMAIN`, etc., con tus credenciales reales obtenidas de la Consola de Firebase.
    - Asegúrate de que el archivo `.env` esté listado en tu `.gitignore` para no subirlo al repositorio.

4.  **Ejecutar el Proyecto en Modo Desarrollo:**
    Una vez instaladas las dependencias y configuradas las variables de entorno, puedes iniciar el servidor de desarrollo de Vite con el siguiente comando:
    ```bash
    npm run dev
    ```
    Esto iniciará la aplicación, generalmente en `http://localhost:5173` (Vite te indicará la URL en la consola). La aplicación se recargará automáticamente cuando hagas cambios en los archivos fuente.
