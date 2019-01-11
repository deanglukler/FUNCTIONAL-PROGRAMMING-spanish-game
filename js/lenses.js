const questionLens = R.lensPath(['question', 'q']);
const answerLens = R.lensPath(['question', 'a']);
const answerConfirmLens = R.lensPath(['question', 'aConfirm']);
const questionAndAnswerLens = R.lensProp('question');

window.LENS = {
  questionLens,
  answerLens,
  answerConfirmLens,
  questionAndAnswerLens,
};
