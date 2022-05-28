import { NextFunction, Request, Response } from "express";
import {
  findActivitiesByUserId,
  addActivity,
  updateTagData,
  rearrangeActivities,
  getCurrentDateActivites,
} from "./service";

import Joi from "joi";
import moment from "moment";
import { v4 } from "uuid";

import {
  ACTIVITY_TIME_FORMAT,
  ACTIVITY_TIME_FORMAT_NO_DAY,
  MAX_TAGS_LENGTH,
  JOURNAL_CONTENT_LENGTH,
} from "../../const";
import { getUserById, updateUser, addHistory } from "../users/service";
import { User } from "../../models";
import { Tag } from "../../models/tag.model";
import { Activity } from "../../models/activity.model";

import { USER_ACTION } from "../../const";

export const getUserActivities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const querySchema = Joi.object({
    time: Joi.string(),
    tagId: Joi.array(),
  });
  try {
    const { userId } = req.headers;
    const { time, tagId: tagIds } = await querySchema.validateAsync(req.query);
    const queryTime = time && moment(time).format(ACTIVITY_TIME_FORMAT_NO_DAY);
    const activities = await findActivitiesByUserId(
      <string>userId,
      queryTime,
      tagIds
    );

    return res.json(activities);
  } catch (error: any) {
    if (error.message) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }
};

export const addJournalEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const activityItem = Joi.object().keys({
    id: Joi.string().optional(),
    content: Joi.string().max(JOURNAL_CONTENT_LENGTH).required(),
    score: Joi.number().required(),
    tagId: Joi.string().optional(),
    date: Joi.string().optional(),
  });
  const bodySchema = Joi.object({
    journalEntry: Joi.array().items(activityItem).required(),
  });
  try {
    const { userId } = req.headers;
    const { journalEntry } = await bodySchema.validateAsync(req.body);
    const date =
      (journalEntry[0] &&
        journalEntry[0].date &&
        moment(journalEntry[0].date).format(ACTIVITY_TIME_FORMAT)) ||
      moment().format(ACTIVITY_TIME_FORMAT);

    // get all current Activities of user by currentDate
    const activitiesResult: Activity[] = [];
    for (let activity of journalEntry) {
      const activityResult = await addActivity(<string>userId, {
        ...activity,
        date,
      });
      activitiesResult.push(activityResult);
    }
    return res.json(activitiesResult);
  } catch (error: any) {
    if (error.message) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }
};

export const addUserActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bodySchema = Joi.object({
    id: Joi.string().optional(),
    content: Joi.string().max(JOURNAL_CONTENT_LENGTH).required(),
    score: Joi.number().required(),
    tagId: Joi.string().required(),
    lastModifiedDate: Joi.string().required(),
  });
  try {
    const { userId } = req.headers;

    const activity = await bodySchema.validateAsync(req.body);
    const date = moment().format(ACTIVITY_TIME_FORMAT);

    // get all current Activities of user by currentDate
    const currentActivities = await getCurrentDateActivites(<string>userId);

    const activities = await addActivity(<string>userId, {
      ...activity,
      date,
      index: currentActivities.length,
    });
    return res.json(activities);
  } catch (error: any) {
    if (error.message) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }
};

export const rearrangeActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const item = Joi.object().keys({
    id: Joi.string().required(),
    index: Joi.number().required(),
    lastModifiedDate: Joi.string().required(),
  });

  const bodySchema = Joi.object({
    activityIndexList: Joi.array().items(item).required(),
  });
  try {
    const { activityIndexList } = await bodySchema.validateAsync(req.body);
    // get all current Activities of user
    await rearrangeActivities(activityIndexList);
    // save new index data;
    return res.json(activityIndexList);
  } catch (error: any) {
    if (error.message) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }
};

export const getUserTags = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.headers;

    const userInfo = <User>await getUserById(<string>userId);
    const { tags } = await userInfo;
    return res.json(tags);
  } catch (error: any) {
    if (error.message) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }
};

export const addUserTag = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bodySchema = Joi.object({
    content: Joi.string().required(),
    icon: Joi.string().required(),
    color: Joi.string().required(),
    lastModifiedDate: Joi.string().required(),
  });
  try {
    const { userId } = req.headers;

    const newTag = {
      ...(await bodySchema.validateAsync(req.body)),
      id: v4(),
    };
    const userInfo = <User>await getUserById(<string>userId);
    let { tags } = userInfo;
    // validate new tag

    // MAX TAGS = 6;
    if (tags && tags.length === MAX_TAGS_LENGTH) {
      throw new Error(`Exceeds maximum length of ${MAX_TAGS_LENGTH}`);
    }
    if (!tags) {
      tags = [];
    }
    // Should not have dupplicated color
    tags.forEach((tag) => {
      if (tag.color === newTag.color) {
        throw new Error(`Tags color should be different`);
      }
    });

    tags.push(newTag);
    userInfo.tags = tags;
    await updateUser(<string>userId, userInfo);
    // await addHistory(<string> userId,USER_ACTION.SETTING_JOURNAL_TAG);
    return res.json(tags);
  } catch (error: any) {
    if (error.message) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }
};

export const editUserTag = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bodySchema = Joi.object({
    id: Joi.string().required(),
    content: Joi.string().required(),
    icon: Joi.string().required(),
    color: Joi.string().required(),
    lastModifiedDate: Joi.string().required(),
  });
  try {
    const { userId } = req.headers;

    const newTag = await bodySchema.validateAsync(req.body);
    const userInfo = <User>await getUserById(<string>userId);
    const { tags } = await userInfo;
    if (!tags || tags.length === 0) {
      return res.send(`There is no tag to update`);
    }

    tags?.forEach((tag) => {
      if (tag.color === newTag.color) {
        throw new Error(`Tags color should be different`);
      }
    });

    updateTagData(<Tag[]>tags, newTag);
    userInfo.tags = tags;
    await updateUser(<string>userId, userInfo);
    // await addHistory(<string> userId,USER_ACTION.SETTING_JOURNAL_TAG);
    return res.json(tags);
  } catch (error: any) {
    if (error.message) {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.sendStatus(500);
  }
};
