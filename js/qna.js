// Questions and Answers
const v = window.VERBS;
window.QNA = {};

const getSpa = R.prop('spanish');
const getEn = R.prop('english');

const ranArrElement = array => {
  if ((array || []).length === 0) {
    return;
  }
  return array[Math.trunc(Math.random() * array.length)];
};

//
//

window.QNA.create = () => {
  const randomVerb = ranArrElement(v);
  return translationQ(randomVerb);
};

//
//

const translationQ = (verb) => {
  return {
    q: `translate this verb: ${getSpa(verb)}`,
    aConfirm: getEn(verb)
  };
};