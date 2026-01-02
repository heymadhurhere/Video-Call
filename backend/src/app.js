import express from 'express';
import { createServer } from  "node:http";
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

import { Server } from "socket.io";

import mongoose from 'mongoose';
import cors from 'cors';

import userRoutes from './routes/users.routes.js';

const app = express();

import { connectToSocket } from './controllers/socketManager.js';

const server = createServer(app);
const io = connectToSocket(server);


app.set("port", (process.env.PORT || 8080));
app.use(cors());
app.use(express.json({ limit: '40kb' }));
app.use(express.urlencoded({ limit: '40kb', extended: true }));

app.use("/api/v1/users", userRoutes);

app.get("/home", (req, res) => {
    return res.json({"hello": "world"});
})

const start = async () => {
    const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}`;
    await mongoose.connect(uri);
    console.log(`MongoDB connected: ${mongoose.connection.host}`); // Tells us the host name to which the mongoDb is connected
    server.listen(app.get("port"), () => {
        console.log(`Server is running on port ${app.get("port")}`);
    })
}
start();