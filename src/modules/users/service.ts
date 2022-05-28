// import { randomBytes } from 'crypto';
import { User } from "../../models";

import { db } from "../firebase";
import {
  IntroData,
  STAGE,
  GIFT,
  USER_ACTION,
  USER_ACTION_TIME_FORMAT,
  EXP_PATTING,
  EXP_ADDING_PHOTO,
  EXP_DAILY_LOGIN,
  EXP_FEEDING,
  EXP_MOOD_ENTRY,
  EXP_FILTERING_JOURNAL,
  EXP_FILTERING_MOOD,
  EXP_JOURNAL_ENTRY,
  EXP_PLAYING,
  EXP_SETTING_JOURNAL_TAG,
  MAX_PATTING,
  MAX_ADDING_PHOTO,
  MAX_DAILY_LOGIN,
  MAX_FEEDING,
  MAX_FILTERING_JOURNAL,
  MAX_FILTERING_MOOD,
  MAX_JOURNAL_ENTRY,
  MAX_MOOD_ENTRY,
  MAX_PLAYING,
  MAX_SETTING_JOURNAL_TAG,
  MAX_TAGS_LENGTH,
} from "../../const/index";

import { signTypedData_v4 } from "eth-sig-util";
import { v4 } from "uuid";
import moment from "moment";
import { any } from "joi";
import {
  verifyNFTs,
  addWebhookAddress,
  getListTokenIdMeemo,
  getImageNft,
} from "../nft/service";

const NONCE_LIMIT_VALUE = 100000;

const userCollection = db.collection("user");
const historyCollection = db.collection("userHistories");

const generateNonce = () => {
  return Math.floor(Math.random() * NONCE_LIMIT_VALUE);
};

export const findUserByPubicAddress = async (publicAddress: string) => {
  const userQuery = await userCollection
    .where("publicAddress", "==", publicAddress.toLowerCase())
    .get();
  const result: User[] = [];
  if (userQuery.empty) {
    return result;
  }
  userQuery.forEach((snapshot: any) => {
    const user: any = {
      // TODO: -> Meemos type
      id: snapshot.id,
      ...snapshot.data(),
    };
    result.push(user);
  });
  return result;
};

export const createNewUser = async (publicAddress: string) => {
  // Create new user
  const nonce = generateNonce();
  const tokenIds = await getListTokenIdMeemo(publicAddress.toLowerCase());
  let avatar = "";
  if (tokenIds.length > 0) {
    await addWebhookAddress(publicAddress.toLowerCase());
    avatar = await getImageNft(tokenIds[0]);
  }
  const user = {
    nonce,
    id: publicAddress.toLowerCase(),
    publicAddress: publicAddress.toLowerCase(),
    isHasMeemosNFT: tokenIds.length > 0,
    avatar,
    petName: "",
    stage: STAGE.EGG,
    level: 0,
    exp: 0,
    expRequire: 100,
    gem: 0,
    fire: 0,
    tags: [
      {
        id: v4(),
        icon: "icHappy",
        color: "FF7379",
        content: "Pleasure",
      },
      {
        id: v4(),
        icon: "icExcited",
        color: "7EDBFE",
        content: "Accomplishment",
      },
    ],
    moods: [
      {
        id: v4(),
        name: "Very bad",
        icon: "icAngry",
        color: "FF7379",
        index: 0,
      },
      {
        id: v4(),
        name: "Bad",
        icon: "icSad",
        color: "F688C1",
        index: 1,
      },
      {
        id: v4(),
        name: "Okay",
        icon: "icBored",
        color: "F0C164",
        index: 2,
      },
      {
        id: v4(),
        name: "Good",
        icon: "icExcited",
        color: "5AE391",
        index: 3,
      },
      {
        id: v4(),
        name: "Very good",
        icon: "icHappy",
        color: "38C8FF",
        index: 4,
      },
    ],
  };
  await userCollection.doc(publicAddress.toLowerCase()).set(user);
  const newUser = {
    ...user,
  };
  return newUser;
};

export const updateUser = async (id: string, newUser: User) => {
  const userDoc = await userCollection
    .doc(id.toLowerCase())
    .update({ ...newUser });
  //   await updateDoc(userDoc, {
  // 	  ...newUser
  // 	});
};

export const updateUserData = async (id: string, data: any) => {
  const userDoc = await userCollection.doc(id.toLowerCase()).update(data);
};

export const addUidTemp = async (id: string, uidTemps: string[]) => {
  const userDoc = await userCollection.doc(id.toLowerCase()).update({
    uidTemps,
  });
};

export const getUserWithUid = async (uid: string) => {
  const user = await userCollection
    .where("uidTemps", "array-contains", uid)
    .get();
  if (user.empty) {
    return null;
  }
  const result: any[] = [];
  user.forEach((doc: any) => {
    result.push(doc.data());
  });
  console.log("getUserWithUid", result);

  if (result.length > 0) {
    return result[0];
  }
  return null;
};

export const removeUid = async (uid: string) => {
  const user = await userCollection
    .where("uidTemps", "array-contains", uid)
    .get();
  if (user.empty) {
    return true;
  }
  const result: any[] = [];
  user.forEach((doc: any) => {
    result.push(doc.data());
  });
  console.log("getUserWithUid", result);

  for (let i = 0; i < result.length; i++) {
    let uidTemps: string[] = result[i].uidTemps;
    let index = uidTemps.indexOf(uid);
    if (index >= 0) {
      uidTemps.splice(index, 1);
    }
    await userCollection.doc(result[i].id).update({ uidTemps });
  }
  return true;
};

export const updateUserNonce = async (user: User) => {
  const nonce = generateNonce();
  await userCollection.doc(user.id.toLowerCase()).update({
    nonce,
  });
  // await updateUser(user.id, {
  // 	...user,
  // 	nonce
  // })
};

export const updateUserNFTVerify = async (
  userAddress: string,
  tokenIds: string[]
) => {
  // Start Devis Commented 2022-05-27
  // let avatar = "";
  // if (tokenIds.length > 0) {
  //   avatar = await getImageNft(tokenIds[0]);
  // }
  // End Devis Commented 2022-05-27
  const rs = await userCollection.doc(userAddress.toLowerCase()).update({
    isHasMeemosNFT: tokenIds.length > 0,
    // Start Devis Commented 2022-05-27
    // avatar,
    // End Devis Commented 2022-05-27
  });

  return rs;
  // await updateUser(user.id, {
  // 	...user,
  // 	nonce
  // })
};

// Start Devis Added 2022-05-27
export const updateUserAvatar = async (userAddress: string, avatar: string) => {
  const userCollection = db.collection("user");
  await userCollection.doc(userAddress).update({
    avatar
  });
};
// End Devis Added 2022-05-27

export const getUserById = async (id: string) => {
  const userDoc = await userCollection.doc(id.toLowerCase()).get();
  if (!userDoc.exists) {
    return null;
  } else {
    let user: User = {
      // TODO: -> Meemos type
      ...userDoc.data(),
    };
    return user;
  }
};

export const getIntro = () => {
  return IntroData;
};

export const deleteById = async (id: string) => {
  const userDoc = await userCollection.doc(id.toLowerCase()).delete();
  await deleteDataRelateUserId("activity", id);
  await deleteDataRelateUserId("moodfeelings", id);
  await deleteDataRelateUserId("userHistories", id);
};

export const deleteDataRelateUserId = async function deleteDataRelateUserId(
  collectionName: string,
  userId: string
) {
  const snapshot = await db
    .collection(collectionName)
    .where("userId", "==", userId)
    .get();
  if (!snapshot.exists) {
    console.log("delete log: khong tim thay doc in: ", collectionName);
  }
  const batch = db.batch();
  snapshot.docs.forEach((doc: any) => {
    console.log("delete log", doc);

    batch.delete(doc.ref);
  });
  await batch.commit();
};

export const addHistory = async (
  userId: string,
  action: USER_ACTION,
  force = false,
  time = ""
) => {
  if (action == USER_ACTION.DAILY_LOGIN && !force) {
    const check = await historyCollection
      .where("userId", "==", userId)
      .where("time", "<", moment().format("YYYY-MM-DD"))
      .get();
    if (check.empty) {
      await historyCollection.doc().set({
        userId: userId,
        action: action,
        time: time != "" ? time : moment().format(USER_ACTION_TIME_FORMAT),
      });
    }
  } else {
    await historyCollection.doc().set({
      userId: userId,
      action: action,
      time: time != "" ? time : moment().format(USER_ACTION_TIME_FORMAT),
    });
  }

  switch (action) {
    case USER_ACTION.DAILY_LOGIN:
    case USER_ACTION.MOOD_ENTRY:
    case USER_ACTION.JOURNAL_ENTRY:
    case USER_ACTION.SETTING_JOURNAL_TAG:
    case USER_ACTION.FILTERING_JOURNAL:
    case USER_ACTION.FILTERING_MOOD:
      await addExp(userId, action, time);
      break;
    default:
      break;
  }
};
export const addExp = async (
  userId: string,
  action: USER_ACTION,
  time = ""
) => {
  let numberActionToday = await getNumberActionToDay(userId, action, time);
  console.log("addExp ==> numberActionToday ", numberActionToday);

  const config = getMaxActionAndExpAdd(action);
  const maxAction = config.maxAction;
  const expAdd = config.expAdd;

  if (numberActionToday <= maxAction) {
    let user = await getUserById(userId);
    if (user) {
      let r = calculExpAfterAdded(user, expAdd);
      let newData = {
        level: r.level,
        exp: r.exp,
        stage: r.stage,
        expRequire: r.expRequire,
        gem: user.gem || 0,
      };
      if (r.reward.gem > 0) {
        newData.gem += r.reward.gem;
      }
      await updateUserData(userId, newData);

      return {
        ...newData,
        expAdded: expAdd,
        isLevelUp: r.isLevelUp,
        numberActionToday: numberActionToday,
        maxAction,
        user: await getUserById(userId),
      };
    }
    return {
      message: "User not found.",
    };
  } else {
    return {
      message: "Max patting today.",
    };
  }
};

export const getNumberActionToDay = async (
  userId: string,
  action: USER_ACTION,
  time = ""
) => {
  const date =
    time != "" ? `${time.slice(0, 10)}` : moment().format("YYYY-MM-DD");
  const snapshot = await historyCollection
    .where("userId", "==", userId)
    .where("action", "==", action)
    .where("time", ">=", date)
    .get();
  if (snapshot.empty) {
    return 0;
  }
  return snapshot.size;
};

const getMaxActionAndExpAdd = (action: USER_ACTION) => {
  switch (action) {
    case USER_ACTION.PET_PATTING:
      return {
        maxAction: MAX_PATTING,
        expAdd: EXP_PATTING,
      };
    case USER_ACTION.PET_FEEDING:
      return {
        maxAction: MAX_FEEDING,
        expAdd: EXP_FEEDING,
      };
    case USER_ACTION.PET_PLAYING:
      return {
        maxAction: MAX_PLAYING,
        expAdd: EXP_PLAYING,
      };
    case USER_ACTION.DAILY_LOGIN:
      return {
        maxAction: MAX_DAILY_LOGIN,
        expAdd: EXP_DAILY_LOGIN,
      };
    case USER_ACTION.JOURNAL_ENTRY:
      return {
        maxAction: MAX_JOURNAL_ENTRY,
        expAdd: EXP_JOURNAL_ENTRY,
      };
    case USER_ACTION.SETTING_JOURNAL_TAG:
      return {
        maxAction: MAX_SETTING_JOURNAL_TAG,
        expAdd: EXP_SETTING_JOURNAL_TAG,
      };
    case USER_ACTION.FILTERING_JOURNAL:
      return {
        maxAction: MAX_FILTERING_JOURNAL,
        expAdd: EXP_FILTERING_JOURNAL,
      };
    case USER_ACTION.MOOD_ENTRY:
      return {
        maxAction: MAX_MOOD_ENTRY,
        expAdd: EXP_MOOD_ENTRY,
      };
    case USER_ACTION.FILTERING_MOOD:
      return {
        maxAction: MAX_FILTERING_MOOD,
        expAdd: EXP_FILTERING_MOOD,
      };
    case USER_ACTION.ADDING_PHOTO:
      return {
        maxAction: MAX_ADDING_PHOTO,
        expAdd: EXP_ADDING_PHOTO,
      };
    default:
      return {
        maxAction: MAX_PATTING,
        expAdd: EXP_PATTING,
      };
      break;
  }
};
// calculevel exp need to level up when user at <level>
export const calculateEXPNeedToUpLevel = (level: number) => {
  let f1 = 100;

  if (level == 0) {
    return f1;
  }
  for (let i = 1; i <= level; i++) {
    if (i < 10) {
      f1 *= 1.84;
    }
    if (10 <= i && i < 20) {
      f1 *= 1.08;
    }
    if (20 <= i && i < 30) {
      f1 *= 1.07;
    }
    if (30 <= i && i < 40) {
      f1 *= 1.03;
    }
    if (40 <= i && i < 50) {
      f1 *= 1.026;
    }
    if (50 <= i && i < 60) {
      f1 *= 1.024;
    }
    if (60 <= i && i < 70) {
      f1 *= 1.021;
    }
    if (70 <= i && i < 80) {
      f1 *= 1.019;
    }
    if (80 <= i && i < 90) {
      f1 *= 1.012;
    }
    if (90 <= i) {
      f1 *= 1.008;
    }
  }

  return Math.round(f1);
};

// add exp to user return new level,exp,expRequire
export const calculExpAfterAdded = (user: User, expAdd: number) => {
  let exp = user.exp || 0;
  let expRequire = user.expRequire || 100;
  let level = user.level || 0;
  let stage: STAGE = user.stage || STAGE.EGG;
  let reward = { gem: 0, gift: "" };
  if (exp + expAdd < expRequire) {
    exp = exp + expAdd;
  } else {
    exp = exp + expAdd;
    // while (exp >= expRequire) {
    exp = exp - expRequire;
    level += 1;
    expRequire = calculateEXPNeedToUpLevel(level);
    reward = rewardGemsWhenLevelUp(stage, level);
    // }
    if (stage == STAGE.EGG && level >= 10) {
      level = 0;
      expRequire = calculateEXPNeedToUpLevel(level);
      stage = STAGE.TODDLER;
    } else if (stage == STAGE.TODDLER && level >= 20) {
      level = 0;
      expRequire = calculateEXPNeedToUpLevel(level);
      stage = STAGE.TEEN;
    }
    return {
      isLevelUp: true,
      level: level,
      exp: exp,
      stage: stage,
      expRequire: expRequire,
      reward: reward,
    };
  }
  return {
    isLevelUp: false,
    level: level,
    exp: exp,
    stage: stage,
    expRequire: expRequire,
    reward: reward,
  };
};

export const rewardGemsWhenLevelUp = (stage: STAGE, level: number) => {
  let gem = 0;
  let gift = "";
  switch (stage) {
    case STAGE.EGG:
      gem = 20;
      break;
    case STAGE.TODDLER:
      if (level % 5 != 0) {
        gem = 30;
      } else {
        switch (level) {
          case 5:
            gift = GIFT.FOOD;
            break;
          case 10:
          case 20:
            gift = GIFT.TOY;
            break;
          case 15:
            gift = GIFT.BOOK;
            break;
          default:
            break;
        }
      }
      break;
    case STAGE.TEEN:
      if (level % 5 != 0) {
        if (1 <= level && level < 10) {
          gem = 50;
        } else if (11 <= level && level < 20) {
          gem = 100;
        } else if (21 <= level && level < 30) {
          gem = 200;
        }
      } else {
        switch (level) {
          case 5:
          case 15:
            gift = GIFT.FOOD;
            break;
          case 10:
            gift = GIFT.BOOK;
            break;
          case 25:
            gift = GIFT.TOY;
            break;
          case 20:
          case 30:
            gift = GIFT.PLUSHIE;
            break;
          default:
            break;
        }
      }
      break;
    default:
      break;
  }
  return {
    gem: gem,
    gift: gift,
  };
};
