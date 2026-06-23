export const userConfirmationCopy = {
  question: "Does this still feel accurate?",
  options: {
    yes: "Yes",
    notSure: "Not sure",
    somethingChanged: "Something changed"
  },
  responses: {
    yes: {
      title: "Thanks",
      body: "Next Seat will continue using the current guidance."
    },
    notSure: {
      title: "That is okay",
      body: "Next Seat will continue using the most likely explanation for this stage of the journey."
    },
    somethingChanged: {
      title: "Thanks for letting us know",
      body: "Next Seat will adjust the guidance to better match what you are experiencing."
    }
  },
  followUpQuestion: "Which of these feels closer to what you are experiencing?"
};
