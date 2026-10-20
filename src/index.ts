import mongoose from "mongoose";
import http from "http";

import { MONGO_URI, PORT } from "./config/key";
import app from "./app";
import { logger } from "./config/winston";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    logger.info("Connected to mongoDB...");
  })
  .catch((err) => logger.error(err));

const server = http.createServer(app);

server.listen(PORT, () => logger.info(`Server is running on port ${PORT}`));
