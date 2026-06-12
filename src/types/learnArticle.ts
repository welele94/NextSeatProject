export type LearnArticleCategory =
  | "Sensations"
  | "Sounds"
  | "Route"
  | "Arrival"
  | "General";

export type LearnArticle = {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: LearnArticleCategory;
  durationLabel: string;
  reassurance?: {
    title: string;
    body: string;
  };
  relatedArticleIds?: string[];
};
