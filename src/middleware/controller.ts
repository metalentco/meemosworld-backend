import { NextFunction, Request, Response } from "express";
import { getUserWithUid } from "../modules/users/service";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { getAuth } = require("firebase-admin/auth");
    console.log("token middleware", req.headers.authorization);

    getAuth()
      .verifyIdToken(req.headers.authorization)
      .then(async (decodedToken: any) => {
        const user = await getUserWithUid(decodedToken.uid);
        console.log("user at authen", user);
        if (!user) {
          return res.status(404).json({
            message: "User not found",
          });
        }

        if (!user.isHasMeemosNFT) {
          return res.status(403).json({
            message: "User does not have Meemos NFT",
          });
        }

        req.headers.userId = user.id;
        next();
      })
      .catch((error: any) => {
        console.log(error);

        if (error.code == "auth/id-token-expired") {
          return res.status(401).json({
            message: "token expired",
          });
        } else if (error.code == "auth/argument-error") {
          return res.status(404).json({
            message: "User not found",
          });
        }
      });
  } catch (e: any) {
    console.log(e.message);

    return res.status(404).json({
      message: "User not found",
    });
  }
};
