window.window.gs = initGameState;
const updateGameState = nxtState => (window.gs = nxtState);
// these functions will all take gameState as an argument
const getQuestion = R.path(['question']);
const getAnswer = R.path(['answer']);
const getRealAnswer = R.path(['realAnswer']);

const questionIsNil = R.pipe(
  getQuestion,
  R.isNil
);

const answerIsNil = R.pipe(
  getAnswer,
  R.isNil
);

const questionLens = R.lensProp('question');
const answerLens = R.lensProp('answer');

const createQuestion = () => 'this is the question';

window.yo = {
  answerIsNil,
  questionIsNil,
  updateGameState,
  pickRanVerb: verbs => {
    if ((verbs || []).length === 0) {
      return;
    }
    return verbs[Math.trunc(Math.random() * verbs.length)];
  },
  // return true or false
  shouldRunGameLoop: R.cond([
    [questionIsNil, R.T],
    [answerIsNil, R.F],
    [R.T, R.T]
  ]),
  newQuestion: R.pipe(
    R.set(questionLens, createQuestion()),
    updateGameState
  ),
  // updateAnswer: (nxtAnswer) => window.gs = R.set(answerLens, nxtAnswer, window.gs)
  updateAnswer: (nxtAnswer, gameState) =>
    R.pipe(
      R.set(answerLens, nxtAnswer),
      updateGameState
    )(gameState)
};
