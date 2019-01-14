(() => {
  const initGameState = {
    question: {
      aConfirm: null,
      q: null,
    },
    answer: null,
    reviewQuestions: [],
    questionCount: 0,
    questionTimestamp: null,
    questionAddedToReview: false,
    checklist: {
      present: true,
      preterite: true,
      imperfect: true,
      'general-vocab': true,
    },
  };

  window.gs = initGameState;
})();
