import { NextFunction, Request, Response } from "express";
import {
  findMoodfeelingsByUserId,
  findTodayMoodfeelingsByUserId,
  updateMoodfeeling,
  addMoodfeeling,
  updateMoodData,
} from "./service";

import Joi from "joi";
import moment from "moment";
import { v4 } from "uuid";

import {
  MOODFEELING_TIME_FORMAT,
  MOODFEELING_TIME_FORMAT_NO_DAY,
  MAX_TAGS_LENGTH,
} from "../../const";
import { getUserById, updateUser, updateUserData } from "../users/service";
import { User } from "../../models";
import { Mood } from "../../models/mood.model";

export const getMoodQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("check header", req.headers.userId);

    return res.json({ question: "How are you feeling today?" });
  } catch (error: any) {
    if (error.message) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }
};

export const getUserMoodfeelings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const querySchema = Joi.object({
    year: Joi.string(),
    moodIds: Joi.string(),
  });
  try {
    const { userId } = req.headers;

    const { year, moodIds } = await querySchema.validateAsync(req.query);
    let moodIdArr: string[] = [];
    if (moodIds) {
      moodIdArr = moodIds.split(",");
    }

    const queryTime =
      year && moment(year).format(MOODFEELING_TIME_FORMAT_NO_DAY);
    const moodfeelings = await findMoodfeelingsByUserId(
      <string>userId,
      queryTime,
      moodIdArr
    );
    return res.json(moodfeelings);
  } catch (error: any) {
    if (error.message) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }
};

export const getTodayUserMoodfeelings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const querySchema = Joi.object({
    date: Joi.string(),
  });
  try {
    const { userId } = req.headers;
    const { date } = await querySchema.validateAsync(req.query);
    console.log("getTodayUserMoodfeelings:", date);

    const moodfeelings = await findTodayMoodfeelingsByUserId(
      <string>userId,
      date
    );
    return res.json(moodfeelings);
  } catch (error: any) {
    if (error.message) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }
};

export const addUserMoodfeeling = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bodySchema = Joi.object({
    id: Joi.string().optional(),
    point: Joi.number().required(),
    moodId: Joi.string().required(),
    lastModifiedDate: Joi.string().required(),
  });

  try {
    const { userId } = req.headers;
    const moodFeeling = await bodySchema.validateAsync(req.body);
    const moodfeeling = await addMoodfeeling(<string>userId, {
      ...moodFeeling,
    });
    return res.json(moodfeeling);
  } catch (error: any) {
    if (error.message) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }
};

export const upadteUserMoodFeeling = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bodySchema = Joi.object({
    id: Joi.string().optional(),
    point: Joi.number().required(),
    moodId: Joi.string().required(),
    lastModifiedDate: Joi.string().required(),
  });

  try {
    const { userId } = req.headers;
    const moodFeeling = await bodySchema.validateAsync(req.body);
    const moodfeeling = await updateMoodfeeling(<string>userId, {
      ...moodFeeling,
    });
    return res.json(moodfeeling);
  } catch (error: any) {
    if (error.message) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }
};

export const getUserMoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.headers;

    const userInfo = <User>await getUserById(<string>userId);
    const { moods } = await userInfo;
    return res.json(moods);
  } catch (error: any) {
    if (error.message) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }
};

export const addEditUserMood = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bodySchema = Joi.object({
    id: Joi.string().optional(),
    name: Joi.string().required(),
    icon: Joi.string().required(),
    color: Joi.string().required(),
    index: Joi.number().required(),
    lastModifiedDate: Joi.string().required(),
  });
  try {
    const { userId } = req.headers;

    if (!req.body.id) {
      const newMood = {
        ...(await bodySchema.validateAsync(req.body)),
        id: v4(),
      };
      const userInfo = <User>await getUserById(<string>userId);

      let { moods } = userInfo;
      if (!moods) {
        moods = [];
      }

      // Mood color should be unique
      moods.forEach((mood) => {
        if (mood.color === newMood.color) {
          throw new Error(`Mood color should be unique`);
        }
      });

      moods.push(newMood);
      userInfo.moods = moods;
      await updateUserData(<string>userId, { moods: moods });
      return res.json(newMood);
    } else {
      const newMood = await bodySchema.validateAsync(req.body);
      const userInfo = <User>await getUserById(<string>userId);
      const { moods } = userInfo;

      // Mood color should be unique
      moods?.forEach((mood) => {
        if (mood.id !== newMood.id && mood.color === newMood.color) {
          throw new Error(`Mood color should be unique`);
        }
      });

      updateMoodData(<Mood[]>moods, newMood);
      userInfo.moods = moods;
      await updateUserData(<string>userId, { moods: moods });
      return res.json(newMood);
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

export const editUserMood = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bodySchema = Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
    icon: Joi.string().required(),
    color: Joi.string().required(),
    index: Joi.number().required(),
    lastModifiedDate: Joi.string().required(),
  });
  try {
    const { userId } = req.headers;

    const newMood = await bodySchema.validateAsync(req.body);
    const userInfo = <User>await getUserById(<string>userId);
    const { moods } = await userInfo;
    updateMoodData(<Mood[]>moods, newMood);
    userInfo.moods = moods;
    await updateUserData(<string>userId, { moods: moods });
    return res.json(moods);
  } catch (error: any) {
    if (error.message) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }
};
