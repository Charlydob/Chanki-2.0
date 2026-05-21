export type DictionaryEntry = { word: string; translation: string; article?: string; type: string; level: "A1"|"A2"|"B1" };
export type DictionaryProvider = { getWords(): Promise<DictionaryEntry[]> };
