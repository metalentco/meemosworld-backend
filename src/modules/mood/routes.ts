import express from "express";
import { auth } from "../../middleware/controller";
import {
  getMoodQuestion,
  getUserMoodfeelings,
  getTodayUserMoodfeelings,
  getUserMoods,
  addUserMoodfeeling,
  addEditUserMood,
  upadteUserMoodFeeling,
} from "./controller";
export const moodRouter = express.Router();

moodRouter.route("/question").get(auth, getMoodQuestion);

moodRouter.route("/overview").get(auth, getUserMoodfeelings);

moodRouter
  .route("/feeling")
  .get(auth, getTodayUserMoodfeelings)
  .post(auth, addUserMoodfeeling)
  .put(auth, upadteUserMoodFeeling);

moodRouter.route("/").get(auth, getUserMoods).post(auth, addEditUserMood);
