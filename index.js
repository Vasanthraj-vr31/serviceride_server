import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';



import connectDb from "./Db/db.js";
import route from './Routes/rideRoutes.js';

dotenv.config()

const PORT = process.env.PORT || 5000;
const app = express()

const startServer = async () => {
    try {
        await connectDb();

        const corsOptions = {
            origin: ['https://serviceride-client.vercel.app', 'http://localhost:5173'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        };

        app.use(cors(corsOptions));
        app.use(express.json())

        app.use('/api', route);

        app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        })
    } catch (error) {
        console.error("Failed to start server:", error);
    }
};

startServer();