import express from "express";
import {
  getUserActivities,
  addUserActivity,
  rearrangeActivity,
  getUserTags,
  addUserTag,
  editUserTag,
  addJournalEntry,
} from "./controller";
export const journalRouter = express.Router();
import { auth } from "../../middleware/controller";

journalRouter
  .route("/")
  .get(auth, getUserActivities)
  .post(auth, addJournalEntry)
  .put(auth, rearrangeActivity);

journalRouter
  .route("/tags")
  .get(auth, getUserTags)
  .post(auth, addUserTag)
  .put(auth, editUserTag);
