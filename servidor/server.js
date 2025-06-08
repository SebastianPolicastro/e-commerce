// RUTA: servidor/server.js

import cors from 'cors';
import express from 'express';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// REEMPLAZA CON TU ACCESS TOKEN DE PRUEBA
const client = new MercadoPagoConfig({ 
    accessToken: 'TEST-6650500995567549-060800-52bbc7aa1b56dee76ead7337fe80dc12-238292163' 
});

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post('/create_preference', async (req, res) => {
    try {
        const body = {
            items: req.body.items,
            back_urls: {
                success: "http://localhost:5173/my-orders",
                failure: "http://localhost:5173",
                pending: "http://localhost:5173"
            },
            auto_return: "approved",
        };

        const preference = new Preference(client);
        const result = await preference.create({ body });
        
        res.json({ id: result.id });

    } catch (error) {
        console.error("Error al crear la preferencia:", error);
        res.status(500).json({
            error: "Error interno del servidor",
            message: error.cause?.message || error.message
        });
    }
});

app.listen(port, () => {
    console.log(`El servidor está corriendo en el puerto ${port}`);
});