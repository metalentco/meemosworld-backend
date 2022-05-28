export enum HttpStatusCode {
  SUCCESS = 200,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  INTERNAL_SERVER = 500,
}

interface Intro {
  PURPOSE: Array<string>;
  GENDER: Array<string>;
  AGE_RANGE: Array<string>;
}

export const IntroData: Intro = {
  PURPOSE: [
    "Exercise",
    "Diet",
    "Sleep",
    "Relationships",
    "Mental Resilience",
    "Finding Purpose",
  ],
  GENDER: ["Male", "Female", "Prefer not to say"],
  AGE_RANGE: ["< 21", "21-30", "31-40", "41+"],
};

export enum STAGE {
  EGG = "EGG",
  TODDLER = "TODDLER",
  TEEN = "TEEN",
}

export enum GIFT {
  FOOD = "EGG",
  TOY = "TODDLER",
  BOOK = "TEEN",
  PLUSHIE = "PLUSHIE",
}

export const ACTIVITY_TIME_FORMAT: string = "YYYY-MM-DD, hh:mm";
export const ACTIVITY_TIME_FORMAT_NO_TIME: string = "YYYY-MM-DD";

export const ACTIVITY_TIME_FORMAT_NO_DAY: string = "YYYY-MM";

export const MOODFEELING_TIME_FORMAT: string = "YYYY-MM-DD";
export const MOODFEELING_TIME_FORMAT_NO_DAY: string = "YYYY";

export const MAX_TAGS_LENGTH = 6;
export const JOURNAL_CONTENT_LENGTH = 140;

export enum USER_ACTION {
  PET_PATTING,
  PET_FEEDING,
  PET_PLAYING,
  DAILY_LOGIN,
  MOOD_ENTRY,
  JOURNAL_ENTRY,
  SETTING_JOURNAL_TAG,
  ADDING_PHOTO,
  FILTERING_MOOD,
  FILTERING_JOURNAL,
}
export const USER_ACTION_TIME_FORMAT: string = "YYYY-MM-DD HH:mm:ss";

//PET leveling
export const MAX_PATTING = 10;
export const MAX_FEEDING = 3;
export const MAX_PLAYING = 5;
export const MAX_DAILY_LOGIN = 1;
export const MAX_MOOD_ENTRY = 2;
export const MAX_JOURNAL_ENTRY = 3;
export const MAX_SETTING_JOURNAL_TAG = 3;
export const MAX_ADDING_PHOTO = 3;
export const MAX_FILTERING_MOOD = 1;
export const MAX_FILTERING_JOURNAL = 1;

//  hệ số (factor)
export const EXP_PATTING = 10;
export const EXP_FEEDING = 20;
export const EXP_PLAYING = 15;
export const EXP_DAILY_LOGIN = 30;
export const EXP_MOOD_ENTRY = 50;
export const EXP_JOURNAL_ENTRY = 20;
export const EXP_SETTING_JOURNAL_TAG = 10;
export const EXP_ADDING_PHOTO = 5;
export const EXP_FILTERING_MOOD = 10;
export const EXP_FILTERING_JOURNAL = 10;
