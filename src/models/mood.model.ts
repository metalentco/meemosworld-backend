import { BaseEntity } from "./base.model";

export interface Mood extends BaseEntity {
  id: string;
  name: string;
  icon: string;
  color: string;
  index: number;
  createdAt?: string;
}
