import mongoose from "mongoose";

import dotenv from "dotenv";

dotenv.config({
  path: "../.env",
});

const dataBaseConnection = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connected TO Mongodb");
    })
    .catch((error) => {
      console.log(error);
    });
};

export default dataBaseConnection;
