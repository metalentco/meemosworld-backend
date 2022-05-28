import express from "express";

import { authRouter } from "./auth";
import { userRouter } from "./users";
import { moodRouter } from "./mood";
import { nftRouter } from "./nft";
import { journalRouter } from "./journal";
import { getIntroData } from "./users/controller";

export const services = express.Router();

services.use("/auth", authRouter);
services.use("/users", userRouter);
services.use("/nft", nftRouter);
services.use("/moods", moodRouter);
services.use("/journal", journalRouter);

services.route("/intro").get(getIntroData);
