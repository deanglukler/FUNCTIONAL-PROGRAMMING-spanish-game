// Questions and Answers
const v = window.VERBS;
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
const getVerbEnding = verb => getSpa(verb).slice(-2);
const getSimpleVerbStem = verb => getSpa(verb).slice(0, -2);

const ranArrElement = array => {
  if ((array || []).length === 0) {
    return;
  }
  return array[Math.trunc(Math.random() * array.length)];
};

const defaultConjugationEndings = () => {
  console.warn(
    'No endings supplied for this conjugation.. I hope the verbTenseData has all the conjugations'
  );
  return CONJ_PRONOUNS.map(() => 'x');
};

// note createConjugationObj will always override if pronoun is
// supplied in the verbTenseData
// ex..
// present: {
//   group: 1,
//   yo: 'voy',
//   tu: 'vas',
//   el: 'va',
//   noso: 'vamos',
//   ellos: 'van',
// }
// In this case all the pronouns are specified and they will overrule
const createConjugationObj = ({
  stem = 'xoxo',
  alteredStems = {},
  endings = defaultConjugationEndings(),
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

const conjugationQString = (tense, pronoun, verb) =>
  `Conjugate ${tense}: "${verb}"  | ${pronoun} ___`;

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

const replaceSecondEWith = R.curry((rplc, str) =>
  str.replace(/e([^e]*)$/, rplc + '$1')
);

//
//

window.QNA.create = () => {
  const randomVerb = ranArrElement(v);
  const possibleQuestionFunctions = [
    translationQ,
    preteriteConjQ,
    presentConjQ,
  ];
  return R.cond([
    [R.isNil, () => console.warn('NO VERBS IN LIST!')],
    [R.T, ranArrElement(possibleQuestionFunctions)],
  ])(randomVerb);
};

//
//

// BASIC TRANSLATION QUESTIONS

const translationQ = verb => {
  return {
    q: `Translate this verb: ${prettify(getSpa(verb))}`,
    aConfirm: [...getEn(verb)],
  };
};

//
//

// PRESENT CONJUGATION QUESTIONS

const regConjEndings = R.cond([
  [R.equals('ar'), () => ['o', 'as', 'a', 'amos', 'an']],
  [R.equals('er'), () => ['o', 'es', 'e', 'emos', 'en']],
  [R.equals('ir'), () => ['o', 'es', 'e', 'imos', 'en']],
  [
    R.T,
    () =>
      console.warn(
        'regConjEndings found verb without "ir" "er" or "ar" ending.'
      ),
  ],
]);

const presentConjSettings = (verb, overrides = {}) =>
  R.mergeRight({
    stem: getSimpleVerbStem(verb),
    // nosotros will always use a simple stem in present tense
    // ( that's why they are the same here, usually the stem will be overruled )
    alteredStems: {
      noso: getSimpleVerbStem(verb),
    },
    endings: regConjEndings(getVerbEnding(verb)),
    verbTenseData: R.prop('present')(verb),
  })(overrides);

const createPresentRegConj = verb =>
  createConjugationObj(presentConjSettings(verb));

const createPresentGroup2Conj = verb =>
  createConjugationObj(
    presentConjSettings(verb, {
      stem: replaceSecondEWith('ie')(getSimpleVerbStem(verb)),
      alteredStems: {
        noso: getSimpleVerbStem(verb),
      },
    })
  );

const createPresentGroup3Conj = verb =>
  createConjugationObj(
    presentConjSettings(verb, {
      stem: getSimpleVerbStem(verb).replace('o', 'ue'),
    })
  );

const createPresentGroup4Conj = verb =>
  createConjugationObj(
    presentConjSettings(verb, {
      stem: replaceSecondEWith('i')(getSimpleVerbStem(verb)),
    })
  );

const presentConjQ = verb => {
  const getPresentGroup = R.path(['present', 'group']);
  const groupIs = R.curry((group, verb) =>
    R.equals(group, getPresentGroup(verb))
  );

  const conjugations = R.cond([
    [groupIs(2), createPresentGroup2Conj],
    [groupIs(3), createPresentGroup3Conj],
    [groupIs(4), createPresentGroup4Conj],
    [R.T, createPresentRegConj],
  ])(verb);

  const chosenPronoun = pickRanConjPronoun(conjugations);
  return {
    q: conjugationQString(
      'Present',
      chosenPronoun.pronoun,
      prettify(getSpa(verb))
    ),
    aConfirm: [chosenPronoun.conjugation],
  };
};

//
//

// PRETERITE CONJUGATION QUESTIONS

const createPreteriteRegularConj = verb => {
  const stem = getSimpleVerbStem(verb);
  const ending = getVerbEnding(verb);

  const verbTenseData = R.prop('preterite')(verb);

  return createConjugationObj({
    stem,
    verbTenseData,
    endings: R.ifElse(
      R.equals('ar'),
      () => ['é', 'aste', 'ó', 'amos', 'aron'],
      () => ['í', 'iste', 'ió', 'imos', 'ieron']
    )(ending),
  });
};

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

  const alteredElandEllosStem = replaceSecondEWith('i', stem);
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

const preteriteConjQ = verb => {
  const getPreteriteGroup = R.path(['preterite', 'group']);
  const groupIs = R.curry((group, verb) =>
    R.equals(group, getPreteriteGroup(verb))
  );

  const conjugations = R.cond([
    [groupIs(1), createPreteriteGroup1Conj],
    [groupIs(3), createPreteriteGroup3Conj],
    [groupIs(4), createPreteriteGroup4Conj],
    [R.T, createPreteriteRegularConj],
  ])(verb);

  const chosenPronoun = pickRanConjPronoun(conjugations);
  return {
    q: conjugationQString('Preterite', chosenPronoun.pronoun, prettify(
      getSpa(verb)
    )),
    aConfirm: [chosenPronoun.conjugation],
  };
};
