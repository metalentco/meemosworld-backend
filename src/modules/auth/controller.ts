import { recoverPersonalSignature } from "eth-sig-util";
import { bufferToHex } from "ethereumjs-util";
import { NextFunction, Request, Response } from "express";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getAuth as getAdminAuth } from "firebase-admin/auth";

import {
  updateUserNonce,
  addUidTemp,
  getUserById,
  updateUserNFTVerify,
  removeUid,
  getUserWithUid,
  addHistory,
} from "../users/service";
import {
  verifyNFTs,
  addWebhookAddress,
  getListTokenIdMeemo,
} from "../nft/service";
import { USER_ACTION } from "../../const";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { signature, publicAddress, accessToken } = req.body;
  if (!signature || !publicAddress) {
    return res.status(400).json({
      message: "Request should have signature and publicAddress",
    });
  }

  // Step 1: Get the user with the given publicAddress
  const user = await getUserById(publicAddress);
  if (!user) {
    return res.status(404).json({
      message: "Address not found!",
    });
  }

  // Step 2: Verify digital signature
  const msg = `Signing with nonce: ${user.nonce}`;
  // We now are in possession of msg, publicAddress and signature. We
  // will use a helper from eth-sig-util to extract the address from the signature
  const msgBufferHex = bufferToHex(Buffer.from(msg, "utf8"));
  const address = recoverPersonalSignature({
    data: msgBufferHex,
    sig: signature,
  });
  console.log(
    `🚀  verify signature ~ address: ${address} === publicAddress ${publicAddress}`
  );

  //   The signature verification is successful if the address found with
  //   sigUtil.recoverPersonalSignature matches the initial publicAddress
  if (address.toLowerCase() !== publicAddress.toLowerCase()) {
    // !COMMENT IF TEST POSTMAN LOCAL
    return res.status(400).send({
      message: "Signature verification failed",
    });
  }

  // Step 3: Generate a new nonce for the user
  await updateUserNonce(user);

  // step 4: Verify NFT...
  try {
    const tokenIds = await getListTokenIdMeemo(publicAddress);
    console.log(
      "🚀 ~ file: controller.ts ~ line 57 ~ create ~ isHasMeemosNFT",
      tokenIds.length > 0
    );
    if (tokenIds.length == 0) {
      return res.status(403).json({
        message: "Address doesn't have Meemos's NFT",
      });
    }
    await updateUserNFTVerify(publicAddress, tokenIds);
  } catch (error: any) {
    if (error.message) {
      return res.status(403).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }

  // step 5.1: Crreate webhook for publicAddress
  await addWebhookAddress(publicAddress);

  console.log("token send by client", req.body.accessToken);
  await addHistory(publicAddress, USER_ACTION.DAILY_LOGIN, true);
  getAdminAuth()
    .verifyIdToken(req.body.accessToken)
    .then(async (decodedToken: any) => {
      console.log("DECODE token send by client", decodedToken);

      const uid = decodedToken.uid;
      if (!user.uidTemps) {
        user.uidTemps = [];
      }
      if (!user.uidTemps.includes(uid)) {
        user.uidTemps.push(uid);
      }
      await removeUid(uid);
      await addUidTemp(publicAddress, user.uidTemps);

      return res.json({
        message: "Log in successful",
      });
    })
    .catch((error: any) => {
      if (error.code == "auth/id-token-expired") {
        return res.status(401).json({
          message: "token expired",
        });
      } else {
        return res.status(400).json(error);
      }
    });
};

export const testAuthFB = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // const { getAuth } = require('firebase-admin/auth');
  // getAuth()
  // 	.createCustomToken(req.body.publicAddress)
  // 	.then((accessToken: any) => {
  // 		// Send token back to client
  // 		return res.json({
  // 			accessToken
  // 		});
  // 	})
  // 	.catch((error: any) => {
  // 		console.log('Error creating custom token:', error);
  // 	});
  // return;

  const auth = getAuth();
  signInAnonymously(auth)
    .then(async (userRef) => {
      const u = userRef.user;
      // console.log(u);

      const publicAddress = req.body.publicAddress;
      const user = await getUserById(publicAddress);

      if (user) {
        if (!user.uidTemps) {
          user.uidTemps = [];
        }
        if (!user.uidTemps.includes(u.uid)) {
          user.uidTemps.push(u.uid);
        }
        // console.log(user);
        await removeUid(u.uid);
        await addUidTemp(publicAddress, user.uidTemps);
      }

      const accessToken = await u.getIdToken();
      const refreshToken = u.refreshToken;
      return res.json({
        accessToken,
        refreshToken,
      });
      // Signed in..
    })
    .catch((error) => {
      if (error.message) {
        return res.status(400).json({
          message: error.message,
        });
      }
      return res.sendStatus(500);
    });
};

export const loginWithFBtoken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  getAdminAuth()
    .verifyIdToken(req.body.accessToken)
    .then((decodedToken: any) => {
      console.log(decodedToken);

      const uid = decodedToken.uid;
      return res.json({
        uid,
      });
    })
    .catch((error: any) => {
      // Handle error
    });
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  var request = require("request");

  var options = {
    method: "POST",
    url: "https://securetoken.googleapis.com/v1/token",
    qs: { key: process.env.FIREBASE_API_KEY },
    headers: { "content-type": "application/x-www-form-urlencoded" },
    form: { grant_type: "refresh_token", refresh_token: req.body.refreshToken },
  };

  request(options, function (error: any, response: any, body: any) {
    const data = JSON.parse(body);
    if (data.error) {
      console.log(data.error);
      return res.status(407).send({ message: data.error.message });
    }
    return res.json({
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      refreshToken: data.refresh_token,
    });
  });
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { getAuth } = require("firebase-admin/auth");
    console.log("token logout", req.headers.authorization);

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
        await removeUid(decodedToken.uid);

        return res.json({
          message: "Logout successful",
        });
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
