import express from "express";

import { verifyNFT, addWebhookAddr } from "./controller";

export const nftRouter = express.Router();

/** POST /api/auth */
nftRouter.route("/").get(addWebhookAddr).post(verifyNFT);
