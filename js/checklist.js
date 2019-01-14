(() => {
  const CL_OPTIONS = ['present', 'preterite', 'imperfect', 'general-vocab'];
  const gameChecklistEl = document.getElementById('game-checklist');

  const checklistLIInnerHTML = ({ name }) => `
  <input type="checkbox" name="${name}" id="checklist-${name}">
  <label for="${name}">${name}</label>
  `;

  const createChecklist = name => {
    const el = document.createElement('li');
    el.innerHTML = checklistLIInnerHTML({ name });
    return el;
  };

  CL_OPTIONS.forEach(name => {
    gameChecklistEl.appendChild(createChecklist(name));
  });

  gameChecklistEl.addEventListener('change', e => {
    const checkboxId = R.path(['srcElement', 'id'])(e);
    const checkBoxWasClicked = R.startsWith('checklist-')(checkboxId);
    const name = R.path(['srcElement', 'name'])(e);
    const isChecked = R.path(['srcElement', 'checked'])(e);

    const setCheckStateToGS = nxtState =>
      R.unless(R.isNil(window.yo), window.yo.updateGameStateAndDOM(nxtState));

    const nxtCheckState = R.evolve({
      [name]: R.always(isChecked),
    })(R.view(LENS.checklist)(gs));

    const nxtState = R.assoc('checklist', nxtCheckState, gs);

    R.unless(R.always(R.not(checkBoxWasClicked)), setCheckStateToGS)(nxtState);
  });

  // init checklist states..
  CL_OPTIONS.forEach(name => {
    const checklist = document.getElementById(`checklist-${name}`);
    const checklistState = R.view(LENS.checklist)(gs);
    checklist.checked = R.prop(name)(checklistState);
  });
})();
