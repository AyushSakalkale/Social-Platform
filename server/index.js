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
  origin: [
   "https://social-platform-eta.vercel.app"
    // Add more origins as necessary
  ],
  credentials: true,
};

app.use("*", cors(corsOptions));

app.use("/api/v1/user", userRoute);
app.use("/api/v1/tweet", tweetRoute);
app.use("/api/v1/notification", notificationRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server Listening to port ${process.env.PORT}`);
});
