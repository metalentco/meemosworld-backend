import { Tag } from "./tag.model";
import { Mood } from "./mood.model";
import { STAGE, GIFT } from "../const/index";

export interface User {
  id: string;
  nonce: number;
  publicAddress: string;
  avatar: string;
  name?: string;
  gender?: string;
  ageRange?: string;
  purpose?: Array<string>;
  tags: Array<Tag>;
  moods: Array<Mood>;
  energy?: number;
  uidTemps?: Array<string>;
  createAt?: string;
  isHasMeemosNFT?: boolean;
  petName?: string;
  gem: number;
  fire: number;
  stage: STAGE; // has 3 stage: EGG, TODDLER, TEEN
  level: number; // current level
  exp: number; // current exp at level
  expRequire: number; // exp need to up level
}
