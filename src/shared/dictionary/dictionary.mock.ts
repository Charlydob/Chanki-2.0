import type { DictionaryProvider } from "./dictionary.types";

export const dictionaryMock: DictionaryProvider = {
  async getWords() {
    return [
      { word: "Haus", translation: "casa", article: "das", type: "sustantivo", level: "A1" },
      { word: "Baum", translation: "árbol", article: "der", type: "sustantivo", level: "A1" },
      { word: "gehen", translation: "ir", type: "verbo", level: "A1" },
      { word: "schön", translation: "bonito", type: "adjetivo", level: "A1" },
      { word: "obwohl", translation: "aunque", type: "conjunción", level: "B1" },
      { word: "vielleicht", translation: "quizá", type: "adverbio", level: "A2" },
      { word: "Freundschaft", translation: "amistad", article: "die", type: "sustantivo", level: "A2" },
      { word: "lernen", translation: "aprender", type: "verbo", level: "A1" },
      { word: "Möglichkeit", translation: "posibilidad", article: "die", type: "sustantivo", level: "B1" },
      { word: "Buch", translation: "libro", article: "das", type: "sustantivo", level: "A1" }
    ];
  }
};
