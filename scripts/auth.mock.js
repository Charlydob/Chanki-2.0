import { storage } from './storage.mock.js';
export const authMock = {
  login(email){ const state=storage.get(); state.user={email}; storage.set(state); return state.user; },
  logout(){ const state=storage.get(); delete state.user; storage.set(state); },
  user(){ return storage.get().user || null; }
};
