import express from "express";

import * as controller from "./controller";

export const authRouter = express.Router();

/** POST /api/auth */
authRouter.route("/").post(controller.create);

authRouter.route("/refresh-token").post(controller.refreshToken);

authRouter.route("/logout").get(controller.logout);

authRouter.route("/test-auth-firebase").post(controller.testAuthFB);
authRouter.route("/check-firebase-token").post(controller.loginWithFBtoken);
