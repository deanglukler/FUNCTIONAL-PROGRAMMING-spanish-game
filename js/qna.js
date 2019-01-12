// Questions and Answers
// const v = window.VERBS.filter(ver => Object.keys(ver.preterite).length > 0 );
const v = window.VERBS.filter(ver => R.path(['preterite', 'group'])(ver) === 4);
window.QNA = {};

// must match the verbs data
const CONJ_PRONOUNS = ['yo', 'tu', 'el', 'noso', 'ellos'];
const PRETTY_PRONOUNS = {
  yo: 'Yo',
  tu: 'Tu',
  el: 'El/Ella',
  noso: 'Nosotros',
  ellos: 'Ustedes/Ellos/Ellas',
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
  stem = 'xoxo',
  alteredStems = {},
  endings = defaulConjugationEndings(),
  verbTenseData = {},
}) =>
  CONJ_PRONOUNS.reduce((col, pronoun, index) => {
    return {
      ...col,
      [pronoun]:
        verbTenseData[pronoun] ||
        `${alteredStems[pronoun] || stem}${endings[index]}`,
    };
  }, {});

const prettify = str => str.charAt(0).toUpperCase() + str.slice(1);

// yo, tu, el .. etc..
const pickRanConjPronoun = conjugatedVerb => {
  const pronoun = ranArrElement(CONJ_PRONOUNS);
  return {
    conjugation: conjugatedVerb[pronoun],
    pronoun: PRETTY_PRONOUNS[pronoun],
  };
};

const checkForDefaultStemTenseData = R.curry((conjTense, verb) =>
  R.path([conjTense, 'stem'])(verb)
);

const replaceSecondEWithI = str => str.replace(/e([^e]*)$/, 'i' + '$1');

//
//

window.QNA.create = () => {
  const randomVerb = ranArrElement(v);
  return R.ifElse(
    R.isNil,
    () => console.warn('NO VERBS IN LIST!'),
    iregPreteriteConjQ
  )(randomVerb);
};

//
//

// BASIC TRANSLATION QUESTIONS

const translationQ = verb => {
  return {
    q: `translate this verb: ${prettify(getSpa(verb))}`,
    aConfirm: [...getEn(verb)],
  };
};

//
//

// PRETERITE CONJUGATION QUESTIONS

const createPreteriteGroup1Conj = verb => {
  const stem = R.path(['preterite', 'stem'])(verb);
  return createConjugationObj({
    stem,
    endings: ['e', 'iste', 'o', 'imos', 'ieron'],
    verbTenseData: R.prop('preterite'),
  });
};

const createPreteriteGroup3Conj = verb => {
  const preteriteData = R.prop('preterite')(verb);
  const stem = R.either(checkForDefaultStemTenseData('preterite'), v => {
    const spanish = getSpa(v);
    return spanish.slice(0, spanish.lastIndexOf('cir'));
  })(verb);
  return createConjugationObj({
    stem,
    endings: ['je', 'jiste', 'jo', 'jimos', 'jeron'],
    verbTenseData: preteriteData,
  });
};

const createPreteriteGroup4Conj = verb => {
  const preteriteData = R.prop('preterite')(verb);
  const stem = R.either(checkForDefaultStemTenseData('preterite'), v => {
    const spanish = getSpa(v);
    return spanish.slice(0, spanish.lastIndexOf('ir'));
  })(verb);

  const alteredElandEllosStem = replaceSecondEWithI(stem);
  return createConjugationObj({
    stem,
    alteredStems: {
      el: alteredElandEllosStem,
      ellos: alteredElandEllosStem,
    },
    endings: ['i', 'iste', 'ió', 'imos', 'ieron'],
    verbTenseData: preteriteData,
  });
};

const iregPreteriteConjQ = verb => {
  const getPreteriteGroup = R.path(['preterite', 'group']);
  const groupIs = R.curry((group, verb) =>
    R.equals(group, getPreteriteGroup(verb))
  );

  const conjugations = R.cond([
    [groupIs(1), createPreteriteGroup1Conj],
    [groupIs(3), createPreteriteGroup3Conj],
    [groupIs(4), createPreteriteGroup4Conj],
    [R.T, () => createConjugationObj({ verbTenseData: verb.preterite })],
  ])(verb);

  const chosenPronoun = pickRanConjPronoun(conjugations);
  return {
    q: `Conjugate Preterite: ${chosenPronoun.pronoun} -> ${prettify(
      getSpa(verb)
    )}`,
    aConfirm: [chosenPronoun.conjugation],
  };
};
