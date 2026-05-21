const mockDictionary = [
  { id: 'w1', text: 'das Haus', translation: 'la casa', type: 'sustantivo', article: 'das', plural: 'die Häuser', example: 'Das Haus ist groß.', requiresArticle: true },
  { id: 'w2', text: 'lernen', translation: 'aprender', type: 'verbo', article: '', plural: '', example: 'Ich lerne Deutsch.', requiresArticle: false },
  { id: 'w3', text: 'Guten Morgen', translation: 'buenos días', type: 'frase', article: '', plural: '', example: 'Guten Morgen, Anna.', requiresArticle: false }
];

export const getDictionaryEntries = () => [...mockDictionary];
