import { normalize } from './normalize.js';
export const isCorrect = (answer, expected) => normalize(answer) === normalize(expected);
