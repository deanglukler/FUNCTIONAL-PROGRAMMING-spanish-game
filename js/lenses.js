const questionLens = R.lensPath(['question', 'q']);
const answerLens = R.lensProp('answer');
const answerConfirmLens = R.lensPath(['question', 'aConfirm']);
const questionDataLens = R.lensProp('question');
const reviewQuestionsLens = R.lensProp('reviewQuestions');
const questionCountLens = R.lensProp('questionCount');
const questionTimestampLens = R.lensProp('questionTimestamp');
const questionAddedToReviewLens = R.lensProp('questionAddedToReview');

window.LENS = {
  questionLens,
  answerLens,
  answerConfirmLens,
  questionDataLens,
  reviewQuestionsLens,
  questionCountLens,
  questionTimestampLens,
  questionAddedToReviewLens
};
