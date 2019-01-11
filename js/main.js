const gameLoop = state => {
  R.cond([
    [yo.questionIsNil, yo.newQuestion],
    [yo.checkAnswer, yo.newQuestion],
    [R.T, () => console.log(`nothing ran`)]
  ])(state);
};

setInterval(() => {
  gameLoop(window.gs);
}, 500);

const gameInput = document.getElementById('game-input');
document.addEventListener('input', e => yo.updateAnswer(e.target.value, gs));
