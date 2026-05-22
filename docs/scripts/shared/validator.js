const normalizeSpaces = (value = '') => value.toString().trim().replace(/\s+/g, ' ');
const lower = (value = '') => normalizeSpaces(value).toLowerCase();

export const validateGermanAnswer = ({ answer, expected, requiresArticle = false }) => {
  const cleanAnswer = normalizeSpaces(answer);
  const cleanExpected = normalizeSpaces(expected);
  const lowerAnswer = lower(cleanAnswer);
  const lowerExpected = lower(cleanExpected);

  if (lowerAnswer === lowerExpected) {
    const expectedWord = cleanExpected.split(' ').at(-1) || '';
    const answerWord = cleanAnswer.split(' ').at(-1) || '';
    const articlePresent = /^(der|die|das)\s/i.test(cleanAnswer);
    if (!articlePresent && /^[a-záéíóúüñ]/.test(answerWord) && answerWord.toLowerCase() === expectedWord.toLowerCase()) {
      return { result: 'warning', message: 'Correcta, pero recuerda capitalizar sustantivos en alemán.' };
    }
    return { result: 'correct', message: 'Correcto.' };
  }

  if (requiresArticle) {
    const expectedWord = lowerExpected.replace(/^(der|die|das)\s+/, '');
    if (lowerAnswer === expectedWord) {
      return { result: 'incorrect', message: 'Falta el artículo.' };
    }
  }

  return { result: 'incorrect', message: 'Incorrecto.' };
};
