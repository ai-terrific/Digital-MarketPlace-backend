import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";

import checkRoutes from "./routes/healthcheck";
// import userRoutes from "./routes/user";
import ipfsRoutes from "./routes/ipfs";
import productRoutes from "./routes/product";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ origin: "*", credentials: true }));
app.use(morgan("dev"));

app.use("/api/health", checkRoutes);

app.use("/api/ipfs", ipfsRoutes);

app.use("/api/product", productRoutes);

app.use(errorHandler);

export default app;
