export type LearnArticleCategory =
  | "sounds"
  | "movement"
  | "flight_phases"
  | "delays_waiting"
  | "cabin";

export type LearnArticle = {
  id: string;
  category: LearnArticleCategory;
  title: string;
  readTimeMinutes: number;
  whatIsHappening: string;
  whyDoesItHappen: string;
  isItNormal: string;
  whatMightINotice: string;
};
