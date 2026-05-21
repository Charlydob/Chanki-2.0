import type { TranslateProvider, TranslateRequest } from "./translate.types";

export const translateMock: TranslateProvider = {
  async translate(input: TranslateRequest): Promise<string> {
    return `[mock ${input.from}->${input.to}] ${input.text}`;
  }
};
