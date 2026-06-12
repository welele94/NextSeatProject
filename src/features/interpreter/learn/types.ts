export type LearnArticleCategory = string;

export type LearnArticle = {
  id: string;
  category: LearnArticleCategory;
  title: string;
  readTimeMinutes: number;
} & Record<string, string | number>;
