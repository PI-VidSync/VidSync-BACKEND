import express from "express";
import routes from "./routes/auth.routes";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/auth", routes);

export default app;
