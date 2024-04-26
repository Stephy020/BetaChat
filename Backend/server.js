import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import connectToMongoDb from "./db/connectMongoDb.js";

const app = express();
const PORT = process.env.PORT || 5000;

dotenv.config();

app.use(express.json()); // parse incoming request with JSON payload (from req.body)
app.use(cookieParser());

app.use("/api/auth", authRoutes );
app.use("/api/messages", messageRoutes );
app.use("/api/users", userRoutes );





app.get("/", (req, res) => 
    res.send("server ready")
);


app.listen(PORT,() => {
    connectToMongoDb();
    console.log(`Server Running on port ${PORT}`)
});
