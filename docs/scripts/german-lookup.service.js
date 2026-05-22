const NOUNS = {
  haus: { article: 'das', plural: 'Häuser' },
  mann: { article: 'der', plural: 'Männer' },
  frau: { article: 'die', plural: 'Frauen' }
};

export const lookupGermanNoun = async (text = '') => {
  const token = text.trim().replace(/^(der|die|das)\s+/i, '').toLowerCase();
  if (!token) return { article: '', plural: '' };
  const found = NOUNS[token];
  if (!found) {
    console.info('[german-lookup] fuente local temporal: sin coincidencia');
    return { article: '', plural: '' };
  }
  return found;
};

export const articleColorClass = (article = '') => {
  const value = article.toLowerCase();
  if (value === 'der') return 'article-der';
  if (value === 'die') return 'article-die';
  if (value === 'das') return 'article-das';
  return '';
};
