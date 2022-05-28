import express from "express";
import * as controller from "./controller";
import { auth } from "../../middleware/controller";

export const userRouter = express.Router();

/** GET /api/users */
userRouter
  .route("/")
  .get(controller.find)
  .delete(auth, controller.deleteAccount);

/** GET /api/users/:userId */
/** Authenticated route */
userRouter
  .route("/profile")
  .get(auth, controller.get)
  .put(auth, controller.updateUserInfo);

userRouter.route("/profile/pet-name").put(auth, controller.updatePetName);

// Start Devis Added 2022-05-27
userRouter.route("/profile/get-all-nft-images").get(auth, controller.getAllNFTImages);
userRouter.route("/profile/set-avatar").post(auth, controller.setAvatar);
// End Devis Added 2022-05-27

userRouter.route("/pet/patting").post(auth, controller.petPatting);
userRouter.route("/pet/feeding").post(auth, controller.petPatting);
userRouter.route("/pet/playing").post(auth, controller.petPlaying);

userRouter.route("/test-get-user-with-uid").post(controller.getUwithUid);
userRouter.route("/test-remove-uid").post(controller.removeUidC);
userRouter.route("/test-calculate-exp-level").post(controller.testExpLevel);
