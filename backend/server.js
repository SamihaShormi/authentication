import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
dotenv.config();

app.use(express.json());
app.use(cors({credentials: true}));
app.use(cookieParser());

app.get("/", (req,  res) => {
    res.send("Hello from backend");
})
app.use("/api/auth",authRoutes);


const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectDB();
});

