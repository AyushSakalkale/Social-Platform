import express from "express";
import dotenv from "dotenv";
import dataBaseConnection from "./config/dbconnection.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoute from "./routes/userRoute.js";
import tweetRoute from "./routes/tweetRoute.js";
import notificationRoute from "./routes/notificationRoute.js";
dotenv.config({
  path: "./.env",
});

dataBaseConnection();

const app = express();

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: ["http://localhost", "http://localhost:80", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
};

app.use(cors(corsOptions));

// Add OPTIONS handling for preflight requests
app.options("*", cors(corsOptions));

app.use("/api/v1/user", userRoute);
app.use("/api/v1/tweet", tweetRoute);
app.use("/api/v1/notification", notificationRoute);

// Add health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server Listening to port ${process.env.PORT}`);
});
