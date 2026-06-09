export type ExpandableMessageContent = {
  learnMore: string;
  whyThisHappens: string;
  whatToExpect: string;
};

export type SituationMessaging = {
  heroTitle: string;
  heroBody: string;
  nextTitle: string;
  nextBody: string;
  expandable: ExpandableMessageContent;
};
