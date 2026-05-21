export type TranslateRequest = { text: string; from: string; to: string };
export type TranslateProvider = { translate(input: TranslateRequest): Promise<string> };
