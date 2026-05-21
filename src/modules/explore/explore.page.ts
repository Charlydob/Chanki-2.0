import { dictionaryService } from "../../shared/dictionary/dictionary.service";
import { showToast } from "../../shared/ui/toast";
export async function mountExplorePage(root: HTMLElement){
  const items = await dictionaryService.getWords();
  const list = root.querySelector("#explore-list"); if(!list) return;
  list.innerHTML = items.map(i=>`<article class='card stack'><h3>${i.article? i.article+" ":""}${i.word}</h3><p>${i.translation} · ${i.type} · ${i.level}</p><div class='explore-actions'><button data-action='save'>Guardar</button><button data-action='skip'>Pasar</button><button data-action='know'>Ya me la sé</button><button data-action='dont'>No me la sé</button></div></article>`).join('');
  list.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>showToast(`Acción: ${(btn as HTMLButtonElement).dataset.action}`)));
}
