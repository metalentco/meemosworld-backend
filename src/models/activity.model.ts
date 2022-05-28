export interface Activity {
  id?: string;
  userId: string;
  content: string;
  score: number;
  date: string;
  tagId: string; // to map with Tag model
  index: number;
}
