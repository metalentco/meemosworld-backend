import express from "express";

import {} from "./controller";

export const nftRouter = express.Router();

/** POST /api/auth */
nftRouter.route("/").get().post();
