// fuente local temporal
const mockDictionary = [
  { id: 'w1', text: 'das Haus', translation: 'la casa', article: 'das', plural: 'die Häuser', example: 'Das Haus ist groß.' },
  { id: 'w2', text: 'lernen', translation: 'aprender', article: '', plural: '', example: 'Ich lerne Deutsch.' },
  { id: 'w3', text: 'Guten Morgen', translation: 'buenos días', article: '', plural: '', example: 'Guten Morgen, Anna.' }
];

export const getDictionaryEntries = () => [...mockDictionary];
