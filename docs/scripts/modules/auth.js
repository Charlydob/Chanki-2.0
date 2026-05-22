import { authMock } from '../auth.mock.js';
export const renderAuth = (root, go) => {
  root.innerHTML=`<div class="auth-wrap"><section class="card auth-card"><h2>Cardshell</h2><form id="login-form"><input class="input" type="email" placeholder="Email" required><input class="input" type="password" placeholder="Contraseña" required><button class="btn" type="submit">Entrar</button><button class="btn-ghost" type="button">Crear cuenta</button><p class="small">Modo local hasta conectar Firebase</p></form></section></div>`;
  root.querySelector('#login-form').addEventListener('submit',(e)=>{e.preventDefault();const email=e.target[0].value;authMock.login(email);go('decks');});
};
