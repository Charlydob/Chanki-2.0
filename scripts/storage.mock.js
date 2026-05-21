const KEY='cardshell-mock';
export const storage={
  get(){ return JSON.parse(localStorage.getItem(KEY)||'{}'); },
  set(v){ localStorage.setItem(KEY, JSON.stringify(v)); }
};
