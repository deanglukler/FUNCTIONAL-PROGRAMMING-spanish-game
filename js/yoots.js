const getQuestion = R.view(LENS.questionLens);
const getAnswer = R.view(LENS.answerLens);
const getReviewQuestions = R.view(LENS.reviewQuestionsLens);

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

const getNewQuestionFromNoWhereLand = () => window.QNA.create();

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
  debugger
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
    [R.T, R.T],
  ]),
  newQuestion: state => {
    const shouldAskReviewQ = state =>
      R.or(
        R.and(
          R.equals(0, R.modulo(R.view(LENS.questionCountLens)(state), 3)),
          /* don't ask review until there's at least two questions */
          /* this will avoid repeated questions */
          R.gt(1, R.length(R.view(LENS.questionCountLens)(state)))
        ),
        R.lt(5, R.length(R.view(LENS.questionCountLens)(state)))
      );

    const evolveQuestionRelatedState = R.ifElse(
      shouldAskReviewQ,
      state => {
        const q = R.either(
          () => R.head(getReviewQuestions(state)),
          getNewQuestionFromNoWhereLand
        )(null);

        return R.pipe(
          R.set(LENS.questionDataLens, q),
          R.over(LENS.reviewQuestionsLens, R.drop(1))
        )(state);
      },
      R.set(LENS.questionDataLens, getNewQuestionFromNoWhereLand())
    );

    const setAnswerToBlank = R.set(LENS.answerLens, '');

    const setQuestionCount = R.over(LENS.questionCountLens, R.inc);

    const setQuestionTimestamp = R.set(LENS.questionTimestampLens, Date.now());

    const setQuestionAddedToReviewToFalse = R.over(
      LENS.questionAddedToReviewLens,
      R.F
    );

    R.pipe(
      evolveQuestionRelatedState,
      setAnswerToBlank,
      setQuestionCount,
      setQuestionTimestamp,
      setQuestionAddedToReviewToFalse,
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
  },
  addQuestionToReviewList: state => {
    const currentQuestion = R.view(LENS.questionDataLens)(state);
    updateGameState(
      R.pipe(
        R.over(LENS.reviewQuestionsLens, R.append(currentQuestion)),
        R.set(LENS.questionAddedToReviewLens, R.T)
      )(state)
    );
  },
};
