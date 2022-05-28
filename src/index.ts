import "./db";

import "dotenv/config";
import bodyParser from "body-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { services } from "./modules";
import { webhookHandler } from "./modules/nft/controller";
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "./swagger.json";

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

// Mount REST on /api
app.use("/api", services);
app.post("/", webhookHandler);
app.get("/", async (req: Request, res: Response, next: NextFunction) => {
  res.send("Hi there!");
});

// Setup Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const port = process.env.PORT || 8000;

app.listen(port, () =>
  console.log(`Express app listening on localhost:${port}`)
);
