const gameLoop = (state) => {
  R.when(
    yo.questionIsNil,
    yo.newQuestion,
  )(state);
};

setInterval(() => {
  gameLoop(window.gs);
}, 500);

const gameInput = document.getElementById('game-input');
document.addEventListener('input', e => yo.updateAnswer(e.target.value, gs));
