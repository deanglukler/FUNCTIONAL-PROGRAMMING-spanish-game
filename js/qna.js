// Questions and Answers
const v = window.VERBS.filter(ver => Object.keys(ver.preterite).length > 0);
window.QNA = {};

// must match the verbs data
const CONJ_PRONOUNS = ['yo', 'tu', 'el', 'noso', 'ellos'];
const PRETTY_PRONOUNS = {
  yo: 'Yo',
  tu: 'Tu',
  el: 'El/Ella',
  noso: 'Nosotros',
  ellos: 'Ustedes/Ellos/Ellas'
};

const getSpa = R.prop('spanish');
const getEn = R.prop('english');

const ranArrElement = array => {
  if ((array || []).length === 0) {
    return;
  }
  return array[Math.trunc(Math.random() * array.length)];
};

const defaulConjugationEndings = () => {
  console.warn(
    'No endings supplied for this conjugation.. I hope the verbTenseData has all the conjugations'
  );
  return CONJ_PRONOUNS.map(() => 'x');
};

const createConjugationObj = ({
  stem = 'Default',
  endings = defaulConjugationEndings(),
  verbTenseData = {}
}) =>
  CONJ_PRONOUNS.reduce((col, pronoun, index) => {
    return {
      ...col,
      [pronoun]: verbTenseData[pronoun] || `${stem}${endings[index]}`
    };
  }, {});

const prettify = str => str.charAt(0).toUpperCase() + str.slice(1);

// yo, tu, el .. etc..
const pickRanConjPronoun = conjugatedVerb => {
  const pronoun = ranArrElement(CONJ_PRONOUNS);
  return {
    conjugation: conjugatedVerb[pronoun],
    pronoun: PRETTY_PRONOUNS[pronoun]
  };
};

//
//

window.QNA.create = () => {
  const randomVerb = ranArrElement(v);
  return iregPreteriteConjQ(randomVerb);
};

//
//

const translationQ = verb => {
  return {
    q: `translate this verb: ${prettify(getSpa(verb))}`,
    aConfirm: [...getEn(verb)]
  };
};

const createPreteriteGroup1Conj = verb => {
  const preterite = R.prop('preterite');
  const stem = R.path(['preterite', 'stem'])(verb);
  return createConjugationObj({
    stem,
    endings: ['e', 'iste', 'o', 'imos', 'ieron'],
    verbTenseData: preterite
  });
};

const iregPreteriteConjQ = verb => {
  const getPreteriteGroup = R.path(['preterite', 'group']);

  const groupIs = R.curry((group, verb) =>
    R.equals(group, getPreteriteGroup(verb))
  );

  const conjugations = R.cond([
    [groupIs(1), createPreteriteGroup1Conj],
    [R.T, () => createConjugationObj({ verbTenseData: verb.preterite })]
  ])(verb);

  const chosenPronoun = pickRanConjPronoun(conjugations);
  return {
    q: `Conjugate Preterite: ${chosenPronoun.pronoun} -> ${prettify(getSpa(verb))}`,
    aConfirm: [chosenPronoun.conjugation]
  };
};
