import express from 'express';
import { createServer } from  "node:http";

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
    const connectionDb = await mongoose.connect("mongodb+srv://anandmadhurrkm7_db_user:EchSkOFWjrkvOg9S@cluster0.lhdabph.mongodb.net/")

    console.log(`MongoDB connected: ${connectionDb.connection.host}`); // Tells us the host name to which the mongoDb is connected
     server.listen(app.get("port"), () => {
        console.log("Server is running on port 8080");
     })
}

start();