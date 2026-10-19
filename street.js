'use strict';
const STREET_HOUSES=StreetContent.houses;
let streetTimers=new Set(), streetAnswerLocked=false;
function streetLater(fn,delay){const id=setTimeout(()=>{streetTimers.delete(id);fn();},delay);streetTimers.add(id);return id;}
function clearStreetMotion(){streetTimers.forEach(id=>clearTimeout(id));streetTimers.clear();streetAnswerLocked=false;$$('.street-candy-flight').forEach(e=>e.remove());$('#bag')?.classList.remove('bag-reward-glow');}
function streetAmbient(id){
 const art={
 pumpkin:'<g class="pumpkin-glimmer"><ellipse cx="252" cy="551" rx="17" ry="18"/><ellipse cx="39" cy="564" rx="22" ry="20"/></g>',
 ghost:'<image class="street-floating-ghost" href="assets/street-ghost.png" x="389" y="380" width="40" height="58" opacity=".75"/>',
 costume:'<g class="costume-window-magic"><ellipse cx="817" cy="538" rx="33" ry="40"/><ellipse cx="842" cy="392" rx="15" ry="25"/></g>',
 wolf:'<g clip-path="url(#wolf-shadow-window)"><path class="werewolf-window-shadow" d="m1165 408 4-35 10 9 8-17 9 20 11-3 7 24Z"/></g>',
 prank:'<g class="mystery-box-bounce"><image href="assets/street-bg.jpg" width="1672" height="941" clip-path="url(#mystery-box-cutout)"/></g>'
 };
 return art[id]||'';
}
function streetWorld(){return `<svg class="street-illustration" viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid slice" aria-label="Halloween street: explore five illustrated house doors"><defs><filter id="window-softness"><feGaussianBlur stdDeviation="7"/></filter><clipPath id="wolf-shadow-window"><ellipse cx="1183" cy="387" rx="27" ry="29"/></clipPath><clipPath id="mystery-box-cutout"><path d="M1576 504H1640V583H1576Z"/></clipPath></defs><image href="assets/street-bg.jpg" width="1672" height="941"/>${STREET_HOUSES.map(h=>`<g class="street-house ${state.visitedHouses.includes(h.id)?'house-completed':''}">${streetAmbient(h.id)}<g class="completed-window-light" aria-hidden="true">${h.windows.map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="14" ry="23"/>`).join('')}</g><g class="street-door" data-house="${h.id}" role="button" tabindex="0" aria-label="Knock at ${h.name}${state.visitedHouses.includes(h.id)?', completed':''}"><ellipse class="door-lantern-glow" cx="${h.light[0]}" cy="${h.light[1]}" rx="44" ry="66"/><path class="street-door-hit" d="${h.door}"/><foreignObject class="door-context" x="${h.hinge[0]-56}" y="${h.hinge[1]-178}" width="195" height="44"><div xmlns="http://www.w3.org/1999/xhtml">Knock on the door</div></foreignObject></g></g>`).join('')}</svg>`;}
function renderStreet(){
 activeHouse=state.streetHouse||null;if(activeHouse){showHouse();return;}
 $('#game').classList.remove('street-at-house');
 $('#scene').innerHTML=`<h2 id="scene-title" class="sr-only">Trick or Treat Street</h2><div id="street-pan" class="street-pan" tabindex="-1" aria-label="Explore the street; swipe sideways on a small screen"><div class="street-panorama">${streetWorld()}</div></div>${!state.streetGuideSeen?'<p class="street-touch-guide">Swipe to explore. Tap a door.</p>':''}`;
 const pan=$('#street-pan'), max=(pan.scrollWidth||0)-(pan.clientWidth||0);if(max>0)pan.scrollLeft=Math.max(0,Math.min(1,state.streetCamera||0))*max;
 $$('[data-house]').forEach(b=>{b.onclick=()=>openHouse(b.dataset.house);b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openHouse(b.dataset.house);}};b.addEventListener('focus',()=>b.scrollIntoView?.({block:'nearest',inline:'nearest'}));});
 if(!state.streetGuideSeen){state.streetGuideSeen=true;save();streetLater(()=>$('.street-touch-guide')?.remove(),6000);}
}
function openHouse(id){
 if(!STREET_HOUSES.some(h=>h.id===id))return;clearStreetMotion();
 const pan=$('#street-pan'),max=pan?(pan.scrollWidth||0)-(pan.clientWidth||0):0;if(pan&&max>0)state.streetCamera=pan.scrollLeft/max;
 activeHouse=id;state.streetHouse=id;E.houseProgress(state,id);save();showHouse();
}
function closeHouse(){clearStreetMotion();activeHouse=null;state.streetHouse=null;save();render();}
function showHouse(){
 const h=STREET_HOUSES.find(h=>h.id===activeHouse);if(!h)return;$('#game').classList.add('street-at-house');
 if($('#house-adventure')?.dataset.house!==h.id){
  $('#scene').innerHTML=`<h2 id="scene-title" class="sr-only">${h.name}</h2><section id="house-adventure" class="house-adventure house-${h.id}" data-house="${h.id}" aria-label="${h.name}"><svg class="house-closeup-art" viewBox="${h.crop.join(' ')}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><clipPath id="opening-door-clip"><path d="${h.door}"/></clipPath><radialGradient id="door-interior-light"><stop stop-color="#f4c577"/><stop offset=".65" stop-color="#916232"/><stop offset="1" stop-color="#35212b"/></radialGradient></defs><image href="assets/street-bg.jpg" width="1672" height="941"/><path d="${h.door}" fill="url(#door-interior-light)"/><g class="opening-door-leaf" style="transform-origin:${h.hinge[0]}px ${h.hinge[1]}px"><image href="assets/street-bg.jpg" width="1672" height="941" clip-path="url(#opening-door-clip)"/></g></svg><img class="house-resident" src="assets/${h.resident}" alt="${h.speaker==='WITCH'?'A friendly witch holding a pumpkin':h.speaker==='GHOST'?'A friendly floating ghost':h.speaker==='WEREWOLF'?'A friendly werewolf with treats':h.speaker==='JOHNNY'?'Johnny welcoming you at the costume house':'Dracula welcoming you to the mystery house'}"><section class="doorstep-quest" aria-label="${h.name} word magic"><div class="quest-house-name">${h.name}</div><div id="house-task"></div></section></section>`;
 }
 renderHouseTask();
}
function renderHouseTask(){
 const h=STREET_HOUSES.find(h=>h.id===activeHouse);if(!h)return;
 const progress=E.houseProgress(state,h.id);streetAnswerLocked=false;
 $('.house-resident')?.classList.remove('resident-celebrates');
 if(state.visitedHouses.includes(h.id)){
  $('#house-task').innerHTML=`<h2>Happy Halloween!</h2><p class="resident-line">Your treats are already in the bag. Thanks for visiting!</p><p class="completed-house-reward">${E.rewards[h.id]} candies collected</p><button id="house-done" class="adventure-choice">BACK TO THE STREET</button>`;$('#house-done').onclick=closeHouse;return;
 }
 if(!progress.greeted){
  $('#house-task').innerHTML=`<h2>Happy Halloween!</h2><p class="resident-line">${h.greeting}</p><div class="adventure-choices">${E.shuffle(['Trick or treat!','Happy birthday!','Good morning!'],state.seed+STREET_HOUSES.indexOf(h)*307+22).map(line=>`<button class="adventure-choice" data-halloween-greeting="${escapeHTML(line)}">${line}</button>`).join('')}</div><p class="quest-feedback" id="grammar-feedback" role="status"></p>`;
  $$('[data-halloween-greeting]').forEach(b=>b.onclick=()=>{if(E.greetHouse(state,h.id,b.dataset.halloweenGreeting)){save();speak('Trick or treat!');renderHouseTask();}else{$('#grammar-feedback').textContent='Try the Halloween greeting!';b.classList.add('answer-wobble');}});return;
 }
 const index=progress.answers.length, question=h.questions[index];
 if(!question)return;
 $('#house-task').innerHTML=`<div class="riddle-progress" aria-label="${index} of 3 riddles solved">${[0,1,2].map(i=>`<img src="assets/wrapped-candy.svg" class="${i<index?'riddle-solved':''}" alt="Riddle ${i+1}${i<index?' solved':''}">`).join('')}</div><h2 class="grammar-question" tabindex="-1">${question.sentence}</h2><div class="adventure-choices">${StreetContent.choices(state.seed,h.id,index).map((answer,i)=>`<button class="adventure-choice choice-${i}" data-grammar-answer="${escapeHTML(answer)}">${escapeHTML(answer)}</button>`).join('')}</div><p class="quest-feedback" id="grammar-feedback" role="status"></p>`;
 $$('[data-grammar-answer]').forEach(b=>b.onclick=()=>chooseGrammar(h,index,b));
}
function chooseGrammar(h,index,button){
 if(streetAnswerLocked)return;
 const question=h.questions[index],before=state.candies;
 if(!E.answerGrammar(state,h.id,index,button.dataset.grammarAnswer)){
  $('#grammar-feedback').textContent=question.hint;button.classList.add('answer-wobble');$('.house-resident')?.classList.add('resident-oops');streetLater(()=>{$('.house-resident')?.classList.remove('resident-oops');button.classList.remove('answer-wobble');},550);return;
 }
 streetAnswerLocked=true;save();button.classList.add('answer-sparkles');$$('[data-grammar-answer]').forEach(b=>b.disabled=true);$('.house-resident')?.classList.add('resident-celebrates');
 const completed=state.visitedHouses.includes(h.id);
 $('#grammar-feedback').textContent=completed?`+${state.candies-before} candies!`:'Well done!';
 if(completed)animateStreetCandy(button,state.candies-before);
 const advance=()=>{streetAnswerLocked=false;if(completed)closeHouse();else{renderHouseTask();$('.grammar-question')?.focus();}};
 if(quietMotion())advance();else streetLater(advance,1200);
}
function animateStreetCandy(source,amount){
 if(quietMotion()||amount<=0)return;
 const origin=source.getBoundingClientRect(),target=$('#bag').getBoundingClientRect(),game=$('#game').getBoundingClientRect();
 const sweets=[];
 for(let i=0;i<amount;i++){
  const sweet=document.createElement('img');sweet.src='assets/wrapped-candy.svg';sweet.alt='';sweet.className='street-candy-flight';sweet.setAttribute('aria-hidden','true');sweet.style.left=`${origin.left+origin.width/2-game.left+(i-(amount-1)/2)*32}px`;sweet.style.top=`${origin.top+origin.height/2-game.top-i*12}px`;sweet.style.setProperty('--sweet-x',`${target.left+target.width/2-origin.left-origin.width/2-(i-(amount-1)/2)*32}px`);sweet.style.setProperty('--sweet-y',`${target.top+target.height/2-origin.top-origin.height/2+i*12}px`);$('#game').append(sweet);sweets.push(sweet);
 }
 $('#bag').classList.add('bag-reward-glow');streetLater(()=>{sweets.forEach(sweet=>sweet.remove());$('#bag').classList.remove('bag-reward-glow');},1050);
}
