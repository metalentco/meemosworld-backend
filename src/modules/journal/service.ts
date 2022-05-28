import { db } from "../firebase";
import moment from "moment";

import { Activity } from "../../models/activity.model";
import { Tag } from "../../models/tag.model";
import { getUserById, calculExpAfterAdded, addHistory } from "../users/service";

import { ACTIVITY_TIME_FORMAT, USER_ACTION } from "../../const";

const activityCollection = db.collection("activity");

const processActivity = (activities: Activity[]) => {
  let result: any[] = [];
  if (activities.length == 0) {
    return result;
  }
  let data: any = {};
  activities.forEach((activity) => {
    // compare date
    if (
      data.date == "" ||
      data.date == undefined ||
      data.date != activity.date.slice(0, 10)
    ) {
      if (data.date != "" && data.date != undefined) {
        let result2: any[] = [];
        let data2: any = {};
        data.data.forEach((a: Activity) => {
          if (data2.time != a.date) {
            if (data2.time != "" && data2.time != undefined) {
              result2.push(data2);
            }
            data2 = {
              time: a.date,
              data: [],
            };
          }
          data2.time = a.date;
          data2.data.push(a);
        });
        result2.push(data2);

        data.data = result2;
        result.push(data);
      }
      data = {
        date: activity.date.slice(0, 10),
        data: [],
      };
    }
    data.date = activity.date.slice(0, 10);
    data.data.push(activity);
  });

  let result2: any[] = [];
  let data2: any = {};
  data.data.forEach((a: Activity) => {
    if (data2.time != a.date) {
      if (data2.time != "" && data2.time != undefined) {
        result2.push(data2);
      }
      data2 = {
        time: a.date,
        data: [],
      };
    }
    data2.time = a.date;
    data2.data.push(a);
  });
  result2.push(data2);

  data.data = result2;
  result.push(data);

  // const newListActivity = [];
  // let tempActivity: any = {};

  // result.forEach((item) => {
  // 	if (tempActivity.date !== item.time.slice(0, 10)) {
  // 		tempActivity.date = item.time.slice(0, 10);
  // 		tempActivity.data = [item];
  // 	} else {
  // 		tempActivity.data.push(item);
  // 	}
  // })
  // newListActivity.push(tempActivity);
  return result;
};

export const findActivitiesByUserId = async (
  userId: string,
  time: string = "",
  tagIds: Array<string> = []
) => {
  // TODOS: handle query with tagIds
  let serviceQuery;
  if (!time && tagIds.length === 0) {
    serviceQuery = await activityCollection
      .where("userId", "==", userId.toLowerCase())
      .orderBy("date", "desc")
      .get();
  } else {
    // serviceQuery =  tagIds.length === 0 ? await activityCollection.where('userId', '==', userId.toLowerCase()).where('date', '>=', `${time}-01`).where('date', '<=', `${time}-31`).orderBy('date', 'desc').get()
    // 	: await activityCollection.where('userId', '==', userId.toLowerCase()).where('date', '>=', `${time}-01`).where('date', '<=', `${time}-31`).where('tagId', 'in', tagIds).orderBy('date', 'desc').get();

    // await addHistory(userId,USER_ACTION.FILTERING_JOURNAL);

    if (tagIds.length === 0) {
      await Promise.all([
        await activityCollection
          .where("userId", "==", userId.toLowerCase())
          .where("date", ">=", `${time}-01`)
          .where("date", "<=", `${time}-31`)
          .orderBy("date", "desc")
          .get(),
        await addHistory(userId, USER_ACTION.FILTERING_JOURNAL),
      ]).then((results) => {
        serviceQuery = results[0];
      });
    } else {
      await Promise.all([
        await activityCollection
          .where("userId", "==", userId.toLowerCase())
          .where("date", ">=", `${time}-01`)
          .where("date", "<=", `${time}-31`)
          .where("tagId", "in", tagIds)
          .orderBy("date", "desc")
          .get(),
        await addHistory(userId, USER_ACTION.FILTERING_JOURNAL),
      ]).then((results) => {
        serviceQuery = results[0];
      });
    }
  }
  const result: any[] = [];
  serviceQuery.forEach((snapshot: any) => {
    const activity: any = {
      ...snapshot.data(),
      id: snapshot?.id.toLowerCase() || 0,
    };
    result.push(activity);
  });
  console.log("findActivitiesByUserId", result);

  const response = processActivity(result);
  return response;
};

export const getAllActivities = async (userId: string) => {
  const serviceQuery = await activityCollection
    .where("userId", "==", userId.toLowerCase())
    .orderBy("date")
    .get();
  const result: Activity[] = [];
  serviceQuery.forEach((snapshot: any) => {
    const activity: any = {
      ...snapshot.data(),
    };
    result.push(activity);
  });
  return result;
};

export const getCurrentDateActivites = async (userId: string) => {
  const currentDate = moment().format(ACTIVITY_TIME_FORMAT);
  const serviceQuery = await activityCollection
    .where("userId", "==", userId.toLowerCase())
    .where("date", "==", currentDate)
    .get();
  const result: Activity[] = [];
  serviceQuery.forEach((snapshot: any) => {
    const activity: any = {
      ...snapshot.data(),
    };
    result.push(activity);
  });
  return result;
};

export const addActivity = async (userId: string, activity: Activity) => {
  const activityData = {
    ...activity,
    userId,
  };
  // await activityCollection.doc().set(activityData);
  // const newActivities = await findActivitiesByUserId(userId.toLowerCase());
  // return newActivities;
  let ref: any = {};

  if (activityData.id) {
    ref = activityCollection.doc(activityData.id);
  } else {
    ref = activityCollection.doc();

    if (activityData.tagId) {
      await Promise.all([
        await addHistory(
          userId,
          USER_ACTION.JOURNAL_ENTRY,
          false,
          activityData.date
        ),
        await addHistory(
          userId,
          USER_ACTION.SETTING_JOURNAL_TAG,
          false,
          activityData.date
        ),
      ]).then((results) => {});
    } else {
      await addHistory(
        userId,
        USER_ACTION.JOURNAL_ENTRY,
        false,
        activityData.date
      );
    }
  }
  const res = await ref.set(activityData);
  return { id: ref.id, ...activityData };
};

export const updateTagData = (listTag: Tag[], newTagData: Tag) => {
  const tagIndex = listTag.findIndex((tag) => tag.id === newTagData.id);
  listTag[tagIndex] = newTagData;
};

export const rearrangeActivities = async (activities: Array<any> = []) => {
  activities.forEach(async ({ id, index }) => {
    await activityCollection.doc(id).update({
      index,
    });
  });
};
