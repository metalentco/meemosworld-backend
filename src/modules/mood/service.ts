import { db } from "../firebase";

import { MoodFeeling } from "../../models/moodFeeling.model";
import { Mood } from "../../models/mood.model";
import * as functions from "firebase-functions";
import { async } from "@firebase/util";
import { getUserById, calculExpAfterAdded, addHistory } from "../users/service";

import {
  MOODFEELING_TIME_FORMAT,
  MOODFEELING_TIME_FORMAT_NO_DAY,
  MAX_MOOD_ENTRY,
  USER_ACTION,
} from "../../const";

const moodfeelingCollection = db.collection("moodfeelings");

const processMoodfeeling = (datas: MoodFeeling[]) => {
  let result: any[] = [];
  let data: any = {};
  datas.forEach((moodfeeling) => {
    if (data.date != moodfeeling.lastModifiedDate.slice(0, 10)) {
      if (data.date != "" && data.date != undefined) {
        result.push(data);
      }
      data = {
        date: moodfeeling.lastModifiedDate.slice(0, 10),
        data: [],
      };
    }
    (data.date = moodfeeling.lastModifiedDate.slice(0, 10)),
      data.data.push(moodfeeling);
  });
  result.push(data);
  return result;
};

export const findMoodfeelingsByUserId = async (
  userId: string,
  time: string = "",
  moodIds: Array<string> = []
) => {
  // TODOS: handle query with tagIds
  let serviceQuery;
  if (!time && moodIds.length === 0) {
    serviceQuery = await moodfeelingCollection
      .where("userId", "==", userId)
      .orderBy("lastModifiedDate")
      .get();
  } else {
    serviceQuery =
      moodIds.length === 0
        ? await moodfeelingCollection
            .where("userId", "==", userId)
            .where("lastModifiedDate", ">=", `${time}-01-01`)
            .where("lastModifiedDate", "<=", `${time}-12-31T23:59:59`)
            .orderBy("lastModifiedDate")
            .get()
        : await moodfeelingCollection
            .where("userId", "==", userId)
            .where("lastModifiedDate", ">=", `${time}-01-01`)
            .where("lastModifiedDate", "<=", `${time}-12-31T23:59:59`)
            .where("moodId", "in", moodIds)
            .orderBy("lastModifiedDate")
            .get();
  }
  // await addHistory(userId,USER_ACTION.FILTERING_MOOD);

  const result: MoodFeeling[] = [];
  if (serviceQuery.empty) {
    return result;
  }
  // console.log(serviceQuery.data());

  serviceQuery.forEach((doc: any) => {
    // console.log(doc.id, '=>', doc.data());
    const moodfeeling: any = {
      ...doc.data(),
      id: doc.id,
    };
    result.push(moodfeeling);
  });

  const response = processMoodfeeling(result);
  return response;
};

export const findTodayMoodfeelingsByUserId = async (
  userId: string,
  time: string = ""
) => {
  // TODOS: handle query with tagIds
  const serviceQuery = await moodfeelingCollection
    .where("userId", "==", userId)
    .where("lastModifiedDate", ">=", `${time}`)
    .where("lastModifiedDate", "<=", `${time}T23:59:59`)
    .get();

  const result: MoodFeeling[] = [];
  if (serviceQuery.empty) {
    return result;
  }
  // console.log(serviceQuery.data());

  serviceQuery.forEach((doc: any) => {
    // console.log(doc.id, '=>', doc.data());
    const moodfeeling: any = {
      ...doc.data(),
      id: doc.id,
    };
    result.push(moodfeeling);
  });

  const response = processMoodfeeling(result);
  return response;
};

export const addMoodfeeling = async (
  userId: string,
  moodfeeling: MoodFeeling
) => {
  // let serviceQuery =   await moodfeelingCollection.where('userId', '==', userId).where('moodId', '==', moodfeeling.moodId).where('lastModifiedDate', '>=', `${moodfeeling.lastModifiedDate.slice(0,10)}`).get()
  const moodfeelingData = {
    ...moodfeeling,
    userId,
  };
  let r: any;
  // if (serviceQuery.empty) {
  await Promise.all([
    await moodfeelingCollection.doc().set(moodfeelingData),
    await addHistory(
      userId,
      USER_ACTION.MOOD_ENTRY,
      false,
      moodfeeling.lastModifiedDate
    ),
  ]).then((results) => {
    // console.log(`Results: ${results}`);

    r = { id: results[0].id, ...moodfeelingData };
  });
  return r;
  // let ref = await moodfeelingCollection.doc().set(moodfeelingData);
  // await addHistory(userId,USER_ACTION.MOOD_ENTRY,false,moodfeeling.lastModifiedDate);
  // return ({id:ref.id,...moodfeelingData});

  // } else {
  // 	const result : MoodFeeling[] = [];

  // 	serviceQuery.forEach((doc:any) => {
  // 		const moodfeeling: any = {
  // 			...doc.data(),
  // 			id:doc.id
  // 		}
  // 		result.push(moodfeeling);
  // 	});

  // 	await updateMoodfeeling(userId,{id:result[0].id,...moodfeeling,userId})
  // 	return {id:result[0].id,...moodfeelingData}
  // }
};

export const updateMoodfeeling = async (
  userId: string,
  moodfeeling: MoodFeeling
) => {
  const moodfeelingData = {
    ...moodfeeling,
    userId,
  };
  let ref: any = {};

  if (moodfeeling.id) {
    ref = await moodfeelingCollection
      .doc(moodfeeling.id)
      .update({ ...moodfeelingData });
    return { ...moodfeelingData };
  } else {
    throw new Error("Mood feeling not found");
  }
};

export const updateMoodData = (listMood: Mood[], newMoodData: Mood) => {
  const tagIndex = listMood.findIndex((mood) => mood.id === newMoodData.id);
  listMood[tagIndex] = newMoodData;
};
