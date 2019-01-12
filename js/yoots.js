window.window.gs = initGameState;

const getQuestion = R.view(LENS.questionLens);
const getAnswer = R.view(LENS.answerLens);

const questionIsNil = R.pipe(
  getQuestion,
  R.isNil
);

const answerIsNil = R.pipe(
  getAnswer,
  R.isNil
);

//
//
//

const setDOMQuestionText = state => {
  document.getElementById('game-question').innerText = getQuestion(state);
};

const setInputValue = state => {
  document.getElementById('game-input').value = R.either(
    getAnswer,
    R.always('')
  )(state);
};

const updateDOM = (prvState, nxtState) => {
  // update the question text only when it's changed.
  R.unless(
    s => R.equals(getQuestion(prvState), getQuestion(s)),
    setDOMQuestionText
  )(nxtState);

  R.unless(s => R.equals(getAnswer(prvState), getAnswer(s)), setInputValue)(
    nxtState
  );
};

const updateGameState = nxtState => {
  window.gs = R.mergeDeepRight(window.gs, nxtState);
  console.log(window.gs);
};

const updateGameStateAndDOM = nxtState => {
  const prvState = window.gs;
  updateGameState(nxtState);
  updateDOM(prvState, nxtState);
};

//
//
//

window.yo = {
  answerIsNil,
  questionIsNil,
  updateGameStateAndDOM,
  // return true or false
  shouldRunGameLoop: R.cond([
    [questionIsNil, R.T],
    [answerIsNil, R.F],
    [R.T, R.T]
  ]),
  newQuestion: state => {
    const nxtQ = window.QNA.create();
    R.pipe(
      R.set(LENS.questionAndAnswerLens, nxtQ),
      updateGameStateAndDOM
    )(state);
  },
  updateAnswer: (nxtAnswer, gameState) =>
    R.pipe(
      R.set(LENS.answerLens, nxtAnswer),
      updateGameStateAndDOM
    )(gameState),
  clearAnswerInput: () => {
    updateGameStateAndDOM({ question: { a: '' } });
  },
  checkAnswer: state => {
    const aConfirm = R.view(LENS.answerConfirmLens)(state);
    const a = R.view(LENS.answerLens)(state);
    return (aConfirm || []).includes(a);
  }
};
