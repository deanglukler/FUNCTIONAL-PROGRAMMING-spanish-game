const gameLoop = state => {
  R.when(
    state =>
      R.and(
        R.lt(
          9000, /* amount of milliseconds before q becomes review */
          R.subtract(Date.now(), R.view(LENS.questionTimestampLens)(state))
        ),
        R.not(R.view(LENS.questionAddedToReviewLens)(state))
      ),
    yo.addQuestionToReviewList
  )(state);

  R.cond([
    [yo.questionIsNil, yo.newQuestion],
    [yo.checkAnswer, yo.newQuestion],
    [R.T, () => console.log('nothing ran')],
  ])(state);
};

setInterval(() => {
  gameLoop(window.gs);
}, 350);

document.addEventListener('input', e => yo.updateAnswer(e.target.value, gs));
