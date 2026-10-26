import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
dotenv.config({});

const app = express();
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: "https//localhost:5173",
  Credential: true,
};
app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;

app.get("/home", (req, res) => {
  return res.status(200).json({
    message: "i am backend",
    success: true,
  });
});

// API
app.use("/api/v1/", userRoute);

// ("http://localhost:8000/api/v1/register");

app.listen(PORT, () => {
  connectDB();
  console.log(`serve is running ${PORT}`);
});
