import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from parent directory (project root)
const envPath = path.join(__dirname, '../.env');
console.log('Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Error loading .env file:', result.error);
} else {
    console.log('.env file loaded successfully');
    console.log('AWS_REGION:', process.env.AWS_REGION);
    console.log('S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME);
}

import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import pollingRoutes from "./routes/pollingRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js";

import connectToMongoDb from "./db/connectMongoDb.js";
import { app, server } from "./socket/socket.js";


const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '50mb' })); // parse incoming request with JSON payload (from req.body)
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/polling", pollingRoutes);
app.use("/api/gemini", geminiRoutes);

app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"))
})



app.get("/", (req, res) =>
    res.send("server ready")
);


server.listen(PORT, () => {
    connectToMongoDb();
    console.log(`Server Running on port ${PORT}`)
});
