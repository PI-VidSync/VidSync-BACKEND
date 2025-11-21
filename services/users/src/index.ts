import express from "express";
import userRoutes from "./routes/user.routes";

export const usersService = express();

usersService.use(express.json());
usersService.use("/api", userRoutes);