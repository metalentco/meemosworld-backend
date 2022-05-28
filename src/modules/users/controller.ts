import { NextFunction, Request, Response } from "express";
import {
  addHistory,
  createNewUser,
  getUserById,
  getIntro,
  getUserWithUid,
  removeUid,
  updateUserData,
  deleteById,
  calculateEXPNeedToUpLevel,
  addExp,
  updateUserAvatar,
} from "./service";
import Joi from "joi";
import { USER_ACTION, IntroData } from "../../const";
import { getImageNft, getListTokenIdMeemo } from "../nft/service";

export const find = async (req: Request, res: Response, next: NextFunction) => {
  // If a query string ?publicAddress=... is given, then filter results
  const schema = Joi.object({
    publicAddress: Joi.string().required(),
  });

  try {
    const { publicAddress } = await schema.validateAsync(req.query);
    // const isHasMeemosNFT = await verifyNFTs(publicAddress.toLowerCase());
    // if (!isHasMeemosNFT) {
    // 	return res.status(403).json({
    // 		message: "User does not have Meemos NFT"
    // 	})
    // }
    let isFirstLogin = false;
    let user = await getUserById(<string>publicAddress);
    if (!user) {
      user = await createNewUser(<string>publicAddress);
      isFirstLogin = true;
    }
    return res.send({
      isFirstLogin,
      user: user,
    });
  } catch (error: any) {
    if (error.message) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = <string>req.headers.userId;
    const user = await getUserById(userId);

    // Start Devis Edited 2022-05-27
    if (!user?.avatar || user?.avatar == "") {
      const tokenIds = await getListTokenIdMeemo(userId.toLowerCase());
      let avatar = "";
      if (tokenIds.length > 0) {
        avatar = await getImageNft(tokenIds[0]);
      }
      if (user && avatar) {
        user.avatar = avatar;
        await updateUserAvatar(userId.toLowerCase(), avatar);
      }
    }
    // End Devis Edited 2022-05-27

    await addHistory(userId, USER_ACTION.DAILY_LOGIN);

    return res.json(user);
  } catch (error: any) {
    if (error.message) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }
};

// Start Devis Added 2022-05-27
export const getAllNFTImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = <string>req.headers.userId;
    const tokenIds = await getListTokenIdMeemo(userId.toLowerCase());
    let images = [];
    for (const tokenId of tokenIds) {
      const image = await getImageNft(tokenId);
      if (image && image != "") {
        images.push(image);
      }
    }
    return res.json({ images });
  } catch (error: any) {
    if (error.message) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }
};
// End Devis Added 2022-05-27

// Start Devis Added 2022-05-27
export const setAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = <string>req.headers.userId;
    const avatar = <string>req.headers.avatar;
    if (userId && userId != "" && avatar && avatar != "") {
      await updateUserAvatar(userId.toLowerCase(), avatar);
      return res.json({ message: "avatar successfully updated" });
    } else {
      if (!userId) {
        return res.status(400).json({ message: "user id invalid" });
      }
      if (!avatar) {
        return res.status(400).json({ message: "avatar invalid" });
      }
    }
  } catch (error: any) {
    if (error.message) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }
};
// End Devis Added 2022-05-27

export const updateUserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userSchema = Joi.object({
    purpose: Joi.array().items(
      Joi.string().valid(
        "Exercise",
        "Diet",
        "Sleep",
        "Relationships",
        "Mental Resilience",
        "Finding Purpose"
      )
    ),
    gender: Joi.string(),
    ageRange: Joi.string(),
  });

  try {
    const userId = <string>req.headers.userId;
    const newUserInfo = await userSchema.validateAsync(req.body);
    await updateUserData(userId, { ...newUserInfo });
    return res.json({ message: "update successfull" });
  } catch (error: any) {
    if (error.message) {
      // if (error.code === 'not-found') {
      // 	return res.status(400).json({
      // 		message: error.message
      // 	  })
      // }
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }
};

export const updatePetName = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userSchema = Joi.object({
    petName: Joi.string().required(),
  });

  try {
    const { petName } = await userSchema.validateAsync(req.body);
    const userId = <string>req.headers.userId;
    await updateUserData(userId, { petName: petName });
    return res.json({ message: "update successfull" });
  } catch (error: any) {
    if (error.message) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }
};

export const getIntroData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const introData = getIntro();
    return res.json(introData);
  } catch (error: any) {
    if (error.message) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }
};

export const getUwithUid = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const introData = await getUserWithUid(req.body.uid);
    return res.json(introData);
  } catch (error: any) {
    if (error.message) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }
};

export const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await deleteById(<string>req.headers.userId);
    return res.json({
      message: "Delete account successful",
    });
  } catch (error: any) {
    if (error.message) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }
};

export const petPatting = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = <string>req.headers.userId;
    await addHistory(userId, USER_ACTION.PET_PATTING);
    let data = await addExp(userId, USER_ACTION.PET_PATTING);
    return res.json(data);
  } catch (error: any) {
    if (error.message) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }
};

export const petFeeding = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (error: any) {
    if (error.message) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }
};

export const petPlaying = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (error: any) {
    if (error.message) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }
};
//test
export const removeUidC = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const introData = await removeUid(req.body.uid);
    return res.json(introData);
  } catch (error: any) {
    if (error.message) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }
};

export const testExpLevel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const introData = await calculateEXPNeedToUpLevel(req.body.level);
    return res.json(introData);
  } catch (error: any) {
    if (error.message) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }
};
