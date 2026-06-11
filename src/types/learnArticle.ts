export type LearnArticleCategory =
  | "sounds"
  | "movement"
  | "takeoff"
  | "cruise"
  | "arrival"
  | "delays"
  | "general";

export interface LearnArticle {
  id: string;
  category: LearnArticleCategory;
  title: string;
  explanation: string;
  reassurance: {
    title: string;
    body: string;
  };
  relatedArticleIds: string[];
}
