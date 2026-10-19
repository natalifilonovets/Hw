'use strict';
const E=GameEngine, KEY='johnny-halloween-v1', $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let state;try{state=E.load(localStorage.getItem(KEY));}catch{state=E.fresh();}
let activeHouse=null, selectedWord=null, selectedTag=null, selectedGear=null, toastTimer, speechTimer, completedThisSession=false;
let ancientBookOpen=null, ancientIdleTimer, ancientOpenTimer, ancientHintTimer, ancientBusy=false, ancientRenderID=0;
const ancientPassage='Long ago, people in Ireland celebrated a festival called Samhain. They lit big fires and believed that spirits could visit the world of the living. Some people wore costumes.';
const facts={FIRE:'Long ago, people in Ireland celebrated a festival called Samhain.',SPIRIT:'Some people believed spirits could visit the world of the living.',MASK:'People sometimes used costumes as part of old traditions.'};
const HELP={ancient:'Visit the fire, hanging mask and spirit. Read each clue and answer its question to earn a page fragment. Read the story, then help Johnny correct three mistakes in his notes.',street:'Visit all five houses in any order. Swipe sideways on a small screen. Say Trick or treat, then solve three Present Simple riddles in each house. Earn 11 candies altogether.',finale:'You finished the adventure! Play again or go back to the hotel. Your progress is saved on this device.'};
function escapeHTML(x){return String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));$('#saved').textContent='AUTOSAVED';}catch{$('#saved').textContent='SAVE UNAVAILABLE';}hud();}
function speak(text){if(state.audioMuted||!('speechSynthesis' in window))return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.88;const voice=speechSynthesis.getVoices().find(v=>v.lang.startsWith('en')&&/Samantha|Google US|Daniel/.test(v.name))||speechSynthesis.getVoices().find(v=>v.lang.startsWith('en'));if(voice)u.voice=voice;speechSynthesis.speak(u);}
function say(who,text){clearTimeout(speechTimer);$('#speech').innerHTML=`<div class="bubble"><strong>${escapeHTML(who)}</strong>${escapeHTML(text)}</div>`;speak(text);speechTimer=setTimeout(()=>$('#speech').innerHTML='',8500);}
function notify(text){clearTimeout(toastTimer);$('#toast').textContent=text;$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3200);}
function dialog(html){const modal=$('#modal');modal.className='';modal.setAttribute('aria-label','Adventure message');$('#modal-content').innerHTML=html;if(!modal.open)modal.showModal();}
function closeDialog(){$('#modal').close();}
function confetti(kind='candy'){if(state.reducedMotion||matchMedia('(prefers-reduced-motion: reduce)').matches)return;for(let i=0;i<25;i++){const s=document.createElement('i');s.className='spark';s.style.left=`${25+Math.random()*50}%`;s.style.top='20%';s.style.background=['#f7c66e','#b9e1d0','#e78e94','#b898dd'][i%4];s.style.setProperty('--dx',`${(Math.random()-.5)*600}px`);s.style.animationDelay=`${Math.random()*.3}s`;$('#game').append(s);setTimeout(()=>s.remove(),2000);}}
function renderCandyBag(){if(!$('#candy-count')){$('#bag').innerHTML=`<img class="candy-satchel" src="assets/candy-bag.svg" alt="Candy bag"><span class="bag-tally"><span class="bag-total"><strong id="candy-count">${state.candies}</strong><span class="bag-target">/ 11</span></span><span class="bag-meter" aria-hidden="true"><span class="bag-meter-fill" style="width:${state.candies/11*100}%"></span></span></span>`;}else{$('#candy-count').textContent=String(state.candies);$('.bag-meter-fill').style.width=state.candies/11*100+'%';}}
function hud(){const index=E.stages.indexOf(state.stage);$('#progress').innerHTML=E.stages.slice(0,5).map((x,i)=>`<span class="step ${i<=index?'done':''}" title="${x}" aria-label="${x}${i<=index?' reached':''}"></span>`).join('');renderCandyBag();$('#sound').innerHTML=(['ancient','village','street'].includes(state.stage)||activeHouse)?controlIcon(state.audioMuted?'muted':'sound'):(state.audioMuted?'SOUND OFF':'SOUND ON');$('#sound').setAttribute('aria-label',state.audioMuted?'Enable English speech':'Mute English speech');$('#sound').setAttribute('aria-pressed',String(!state.audioMuted));$('#motion').innerHTML=(['ancient','village','street'].includes(state.stage)||activeHouse)?controlIcon(state.reducedMotion?'still':'motion'):(state.reducedMotion?'MOTION OFF':'MOTION ON');$('#motion').setAttribute('aria-pressed',String(!state.reducedMotion));$('#motion').setAttribute('aria-label',state.reducedMotion?'Enable animation':'Reduce animation');$('#game').classList.toggle('reduced',state.reducedMotion);$('#back').hidden=state.stage==='ancient';const badgeLink=state.stage==='street'&&state.visitedHouses.length===5;$('#bag').setAttribute('role',badgeLink?'button':'status');$('#bag').setAttribute('tabindex',badgeLink?'0':'-1');$('#bag').setAttribute('aria-label',badgeLink?'View your Halloween Expert badge':`${state.candies} of 11 candies collected`);$('#bag').style.pointerEvents=badgeLink?'auto':'';}
function setStage(stage){if(!E.stages.includes(stage))return;const gates={street:E.canEnterStreet(state),finale:state.visitedHouses.length===5&&state.candies===11};if(stage in gates&&!gates[stage])return;state.stage=stage;activeHouse=null;save();render();}
function heading(kicker,title,description=''){return `<div class="chapter-heading"><div class="eyebrow">${kicker}</div><h2 id="scene-title">${title}</h2>${description?`<p>${description}</p>`:''}</div>`;}
function characters(){return '<div class="characters"><img class="character johnny" src="assets/johnny-welcome.png" alt="Johnny holding the magic book"><img class="character dracula" src="assets/dracula-reaction.png" alt="Dracula looking curious"><span class="character-label">YOUR GUIDES THROUGH TIME</span></div>';}
function nextButton(stage,label){return `<button class="primary" data-next="${stage}">${label} →</button>`;}
function bindNext(){$$('[data-next]').forEach(b=>b.onclick=()=>setStage(b.dataset.next));}
function render(){clearStreetMotion();clearVillageAnimation();$('#game').classList.toggle('village-stage',state.stage==='village');clearTimeout(explorerSpeechTimer);explorerLine='';$$('.flying-page-fragment').forEach(x=>x.remove());clearTimeout(ancientIdleTimer);clearTimeout(ancientOpenTimer);clearTimeout(ancientHintTimer);ancientRenderID++;ancientBusy=false;$('#game').classList.toggle('ancient-stage',state.stage==='ancient');clearTimeout(speechTimer);$('#speech').innerHTML='';$('#game').classList.toggle('street-view',state.stage==='street');$('#game').classList.toggle('finale',state.stage==='finale');const bg={ancient:'ancient-village',street:'street',finale:'lobby'}[state.stage];$('#backdrop').style.backgroundImage=`url('assets/${bg}-bg.jpg')`;hud();({ancient:renderAncient,street:renderStreet,finale:renderFinale}[state.stage])();bindNext();$('#scene-title')?.setAttribute('tabindex','-1');}
const explorerStops={FIRE:{x:515,y:815,scale:1.02},MASK:{x:1050,y:748,scale:.86},SPIRIT:{x:1335,y:865,scale:.97}};
let explorerPosition={x:1015,y:885,scale:1}, explorerFacesLeft=false, explorerLine='', explorerSpeechTimer;
function explorerGraphic(){return `<g id="johnny-explorer" class="johnny-explorer" style="transform:translate(${explorerPosition.x}px,${explorerPosition.y}px) scale(${explorerPosition.scale})" aria-label="Johnny, your guide"><ellipse class="explorer-shadow" cx="0" cy="-4" rx="51" ry="10"/><g class="explorer-facing" transform="scale(${explorerFacesLeft?-1:1} 1)"><image class="explorer-body" href="assets/johnny-explorer.png" x="-88" y="-264" width="176" height="264"/></g><foreignObject x="-158" y="-367" width="350" height="98" id="explorer-speech" class="${explorerLine?'has-line':''}"><div xmlns="http://www.w3.org/1999/xhtml" id="explorer-line" class="explorer-line" role="status">${escapeHTML(explorerLine)}</div></foreignObject></g>`;}
function explorerSay(text){
 clearTimeout(explorerSpeechTimer);explorerLine=text;
 const line=$('#explorer-line'), speech=$('#explorer-speech');if(line)line.textContent=text;if(speech)speech.classList.toggle('has-line',!!text);
 speak(text);explorerSpeechTimer=setTimeout(()=>{explorerLine='';$('#explorer-speech')?.classList.remove('has-line');},8000);
}
function walkExplorerTo(key,arrive){
 const stop=explorerStops[key], walker=$('#johnny-explorer');explorerFacesLeft=stop.x<explorerPosition.x;explorerPosition={...stop};
 if(quietMotion()){arrive();return;}
 explorerSay('');walker?.classList.add('explorer-walking');
 if(walker){walker.style.transform=`translate(${stop.x}px,${stop.y}px) scale(${stop.scale})`;walker.querySelector('.explorer-facing')?.setAttribute('transform',`scale(${explorerFacesLeft?-1:1} 1)`);}
 ancientOpenTimer=setTimeout(()=>{walker?.classList.remove('explorer-walking');arrive();},900);
}
function controlIcon(kind){const paths={sound:'<path d="m4 9 5 0 5-4v14l-5-4H4Z"/><path d="M18 8q5 4 0 8"/>',muted:'<path d="m4 9 5 0 5-4v14l-5-4H4Z"/><path d="m18 9 5 6m0-6-5 6"/>',motion:'<path d="M8 5 20 12 8 19Z"/><path d="M3 7h2M2 12h3M3 17h2"/>',still:'<path d="M8 5v14M16 5v14"/>'};return `<svg viewBox="0 0 26 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[kind]}</svg>`;}
function quietMotion(){return state.reducedMotion||matchMedia('(prefers-reduced-motion: reduce)').matches;}
function armAncientHint(){clearTimeout(ancientIdleTimer);if(state.stage==='ancient'&&!ancientBookOpen&&!ancientBusy&&state.bookCluesRead.length<3)ancientIdleTimer=setTimeout(showAncientHint,12000);}
function showAncientHint(){
 if(state.stage!=='ancient')return;
 clearTimeout(ancientHintTimer);
 const hint=$('#ancient-hint');if(!hint)return;
 if(state.ancientEncounter){const task=E.discoveryChallenges[state.ancientEncounter];$('#encounter-feedback').textContent='Read the clue: '+task.fact;return;}
 if(ancientBookOpen){hint.textContent='Read the story, then replace the underlined word in Johnny’s note.';}
 else if(state.bookCluesRead.length===3){hint.textContent='Your three fragments are ready. Open the Magic Book in the corner.';}
 else {const next=['FIRE','MASK','SPIRIT'].find(k=>!state.bookCluesRead.includes(k));hint.textContent={FIRE:'Something glimmers in the warm bonfire…',MASK:'The wooden mask holds a forgotten story…',SPIRIT:'A little spirit is carrying a piece of the past…'}[next];$(`[data-fact="${next}"]`)?.classList.add('discovery-hint');}
 if(ancientBookOpen){const feedback=$('#book-feedback');if(feedback)feedback.textContent=hint.textContent;}else explorerSay(hint.textContent);hint.classList.add('visible');ancientHintTimer=setTimeout(()=>{hint.classList.remove('visible');$$('.discovery-hint').forEach(x=>x.classList.remove('discovery-hint'));},6000);
}
function ancientWorld(){
 const objects={
 FIRE:{path:'M45 725 45 500 107 389 142 282 191 224 228 300 272 407 336 498 409 683 340 747Z',name:'Explore the bonfire'},
 MASK:{path:'M744 168 902 159 946 231 932 390 883 459 758 470 731 369 732 247Z',name:'Explore the hanging wooden mask'},
 SPIRIT:{path:'M1467 368 1553 378 1595 449 1605 566 1559 645 1515 704 1512 797 1457 849 1374 815 1379 715 1395 638 1436 567 1452 481Z',name:'Explore the glowing spirit'}
 };
 return `<svg class="ancient-world" viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid meet" aria-label="Ancient Irish hillside: explore the illustrated fire, wooden mask and spirit"><defs>${Object.entries(objects).map(([key,o])=>`<clipPath id="object-${key}"><path d="${o.path}"/></clipPath>`).join('')}</defs><image href="assets/ancient-village-bg.jpg" width="1672" height="941"/>${Object.entries(objects).map(([key,o])=>`<g class="scene-object object-${key.toLowerCase()} ${state.bookCluesRead.includes(key)?'discovered':''}" data-fact="${key}" role="button" tabindex="0" aria-label="${o.name}${state.bookCluesRead.includes(key)?', fragment collected':''}" aria-disabled="${state.bookCluesRead.includes(key)}"><g class="object-art" aria-hidden="true"><image href="assets/ancient-village-bg.jpg" width="1672" height="941" clip-path="url(#object-${key})"/></g>${key==='FIRE'?'<g class="fire-sparks" aria-hidden="true"><circle cx="172" cy="447" r="3"/><circle cx="230" cy="403" r="2"/><circle cx="138" cy="390" r="2"/><circle cx="265" cy="502" r="3"/><circle cx="193" cy="350" r="2"/></g>':''}<path class="object-hit" d="${o.path}"/></g>`).join('')}${explorerGraphic()}</svg>`;
}
function fragmentDock(){return `<aside class="magic-book-dock" aria-label="Collected magical page fragments"><div class="fragment-collection">${['FIRE','MASK','SPIRIT'].map(key=>`<img class="page-fragment ${state.bookCluesRead.includes(key)?'collected':''}" src="assets/page-${key.toLowerCase()}-illustrated.png" alt="${key.toLowerCase()} page fragment${state.bookCluesRead.includes(key)?' collected':' missing'}">`).join('')}</div><button id="open-ancient-book" class="magic-book-toggle" aria-label="${state.bookCluesRead.length===3?'Open Johnny’s Magic Book':'Find three fragments to restore Johnny’s Magic Book'}" aria-expanded="${!!ancientBookOpen}"><img src="assets/magic-book-closed.png" alt=""></button><span class="sr-only" role="status">${state.bookCluesRead.length} of 3 page fragments discovered</span></aside>`;}
function ancientCorrectionTask(){
 const won=state.gears.includes(1);
 if(won)return `<p class="johnny-notes-done">Johnny: “Ireland, big fires and spirits! Thanks for helping me remember.”</p><div class="restored-seal" aria-label="Page restored">RESTORED</div><div class="book-actions">${nextButton('street','TRICK OR TREAT!')}</div>`;
 const index=state.ancientCorrections.length, note=E.ancientMistakes[index];
 return `<p class="johnny-notes-intro">Johnny: “Oops! My notes are mixed up. Help me fix them!”</p><p class="note-progress">${index+1} / 3 · Replace the underlined word.</p><p class="johnny-mistake">${note.before}<span class="mistaken-word">${note.wrong}</span>${note.after}</p><div class="book-word-tiles" aria-label="Correct Johnny’s note">${E.shuffle(note.choices,state.seed+index*97).map(word=>`<button class="word-tile" data-correction="${word}">${word}</button>`).join('')}</div><p id="book-feedback" class="book-feedback" role="status">Read the story above. Which word makes Johnny’s note true?</p>`;
}
function ancientBook(){const won=state.gears.includes(1);return `<div class="ancient-book-shell"><section class="ancient-book painted-book ${won?'restored':''}" aria-label="Johnny’s open Magic Book"><img class="painted-book-art" src="assets/magic-book-open.png" alt=""><button id="close-ancient-book" aria-label="Close the book and explore the scene">×</button><div class="book-leaf illustrated-leaf" role="img" aria-label="An illuminated painting of an ancient Irish village and its bonfire"></div><div class="book-leaf story-leaf"><h2>The ancient festival</h2><div class="restoration-passage">${ancientPassage}</div><section id="ancient-notes" aria-label="Help Johnny fix his notes">${ancientCorrectionTask()}</section></div></section></div>`;}
function renderAncient(){
 if(state.stage!=='ancient')return;
 if(ancientBookOpen===null)ancientBookOpen=state.bookCluesRead.length===3;
 $('#game').classList.toggle('ancient-book-is-open',!!ancientBookOpen);
 $('#scene').innerHTML=ancientWorld()+`<h2 id="scene-title" class="sr-only">The ancient festival</h2>`+fragmentDock()+`<p id="ancient-hint" class="ancient-hint" role="status"></p>`+(ancientBookOpen&&state.bookCluesRead.length===3?ancientBook():'');
 $$('[data-fact]').forEach(b=>{b.onclick=()=>discoverAncient(b.dataset.fact,b);b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();discoverAncient(b.dataset.fact,b);}};});
 $('#open-ancient-book').onclick=()=>{if(state.bookCluesRead.length!==3){showAncientHint();return;}ancientBookOpen=!ancientBookOpen;renderAncient();if(ancientBookOpen)$('#close-ancient-book')?.focus();};
 $('#close-ancient-book')?.addEventListener('click',()=>{ancientBookOpen=false;renderAncient();$('#open-ancient-book').focus();});
 bindAncientTask();
 bindNext();if(state.ancientEncounter&&!ancientBookOpen)showAncientEncounter(state.ancientEncounter);else armAncientHint();
 if(!state.ancientGuideSeen&&!ancientBookOpen){state.ancientGuideSeen=true;save();explorerSay("Let’s find three stories! Tap the fire, mask or spirit and help me answer.");}
}
function bindAncientTask(){
 $$('[data-correction]').forEach(b=>b.onclick=()=>{
  const index=state.ancientCorrections.length;
  if(!E.correctAncient(state,index,b.dataset.correction)){
   b.classList.add('word-returned');$('#book-feedback').textContent=E.ancientMistakes[index]?.hint||'Read the story again.';return;
  }
  save();refreshAncientBook();
  if(state.gears.includes(1))speak('You fixed my notes! Let’s see Halloween today!');
  else{const feedback=$('#book-feedback');feedback.textContent='That’s right! Now help Johnny with his next note.';$$('[data-correction]')[0]?.focus();}
 });
}
function refreshAncientBook(){
 const book=$('.ancient-book');if(!book){renderAncient();return;}
 $('#ancient-notes').innerHTML=ancientCorrectionTask();
 if(state.gears.includes(1)){book.classList.add('restored');bindNext();}else bindAncientTask();
}
function showAncientEncounter(key){
 const task=E.discoveryChallenges[key];if(!task)return;
 ancientBusy=true;clearTimeout(ancientIdleTimer);explorerSay('');
 const old=$('#ancient-encounter');old?.remove();
 const encounter=document.createElement('section');encounter.id='ancient-encounter';encounter.className='ancient-encounter encounter-'+key.toLowerCase();encounter.setAttribute('aria-label','Discover the '+key.toLowerCase()+' story');
 encounter.innerHTML=`<button id="leave-encounter" class="encounter-close" aria-label="Explore another object">×</button><div class="encounter-content"><p class="encounter-fact">${task.fact}</p><h3 id="encounter-question" tabindex="-1">${task.question}</h3><div class="encounter-answers">${E.shuffle(task.choices,state.seed+key.length*39).map(choice=>`<button class="encounter-answer" data-discovery-answer="${choice.id}"><img src="assets/${choice.art}" alt=""><span>${choice.label}</span></button>`).join('')}</div><p id="encounter-feedback" role="status">Help Johnny unlock this page.</p></div>`;
 $('#scene').append(encounter);
 $('#leave-encounter').onclick=leaveAncientEncounter;
 $$('[data-discovery-answer]').forEach(b=>b.onclick=()=>{
  if(state.ancientEncounter!==key||state.bookCluesRead.includes(key))return;
  if(!E.answerDiscovery(state,key,b.dataset.discoveryAnswer)){b.classList.add('word-returned');$('#encounter-feedback').textContent='Read the clue above and try again.';return;}
  encounter.remove();save();releaseAncientFragment(key);
 });
 $('#encounter-question')?.focus();speak(task.fact+' '+task.question);
}
function leaveAncientEncounter(){const key=state.ancientEncounter;state.ancientEncounter=null;ancientBusy=false;$('#ancient-encounter')?.remove();save();$(`[data-fact="${key}"]`)?.focus();armAncientHint();}
function releaseAncientFragment(key){
 const object=$(`[data-fact="${key}"]`),token=ancientRenderID;object?.classList.add('object-discovering');
 const finish=()=>{if(state.stage!=='ancient'||token!==ancientRenderID)return;ancientBusy=false;if(state.bookCluesRead.length===3){ancientBookOpen=true;explorerLine='';}renderAncient();if(ancientBookOpen)$('#close-ancient-book')?.focus();};
 if(quietMotion()){finish();return;}
 explorerSay(state.bookCluesRead.length===3?'All three stories! Let’s open the book.':state.bookCluesRead.length===1?'You unlocked a page! Two more stories to find.':'Two pages! One more story to find.');
 const origin=object.querySelector('.object-hit').getBoundingClientRect(),target=$('#open-ancient-book').getBoundingClientRect(),game=$('#game').getBoundingClientRect();
 const fragment=document.createElement('img');fragment.src=`assets/page-${key.toLowerCase()}-illustrated.png`;fragment.alt='';fragment.className='flying-page-fragment';fragment.setAttribute('aria-hidden','true');fragment.style.left=`${origin.left+origin.width/2-game.left}px`;fragment.style.top=`${origin.top+origin.height/2-game.top}px`;fragment.style.setProperty('--flight-x',`${target.left+target.width/2-origin.left-origin.width/2}px`);fragment.style.setProperty('--flight-y',`${target.top+target.height/2-origin.top-origin.height/2}px`);$('#game').append(fragment);
 ancientOpenTimer=setTimeout(()=>{fragment.remove();finish();},1100);
}
function discoverAncient(key,object){
 if(ancientBusy||ancientBookOpen||state.bookCluesRead.includes(key)||!E.discoveryChallenges[key])return;
 ancientBusy=true;clearTimeout(ancientIdleTimer);const token=ancientRenderID;
 walkExplorerTo(key,()=>{if(state.stage!=='ancient'||token!==ancientRenderID)return;state.ancientEncounter=key;save();showAncientEncounter(key);});
}
function awardGear(n,line){confetti('gear');dialog(`<img class="gear-award" src="assets/gear.svg" alt="Golden clock gear"><div class="eyebrow">TIME MACHINE PART FOUND</div><h2>Gear ${n} unlocked!</h2><p>${line}</p><button class="primary" id="gear-continue">CONTINUE →</button>`);$('#gear-continue').onclick=closeDialog;speak(line);}
function completion(){const c=window.HALLOWEEN_CONFIG||{};const exact=c.parentOrigin&&/^https?:\/\//.test(c.parentOrigin)?c.parentOrigin:'*';if(window.parent!==window)window.parent.postMessage({type:'hotel-transylvania-mission-complete',mission:'johnny-trick-or-treat',candies:11},exact);completedThisSession=true;}
function renderFinale(){$('#scene').innerHTML=`<div class="hero-copy"><div class="badge" aria-label="Halloween expert badge">✦</div><div class="eyebrow">MISSION COMPLETE · BACK AT THE HOTEL</div><h1 id="scene-title">HALLOWEEN<br><em>EXPERT!</em></h1><div class="score">11 candies. One incredible adventure.</div><p class="intro-line">We did it! We learned the history and collected 11 candies!</p><p class="description">“Trick or treat? I choose... TREAT!”<br><span class="caption">— DRACULA</span></p><div class="actions"><button class="primary" id="hotel">BACK TO HOTEL →</button><button id="replay">PLAY AGAIN</button></div></div>${characters()}`;if(!completedThisSession)completion();$('#hotel').onclick=()=>{completion();const url=window.HALLOWEEN_CONFIG?.hotelUrl;if(url){try{const target=new URL(url,location.href);if(['https:','http:'].includes(target.protocol)){window.location.href=target.href;return;}}catch{}}state.stage='ancient';save();render();notify('Your adventure is saved.');};$('#replay').onclick=restart;}
function restart(){dialog('<h2>Start a new adventure?</h2><p>This resets your gears, discoveries and candy bag on this device.</p><div class="actions"><button class="primary" id="confirm-restart">RESTART</button><button id="cancel-restart">KEEP PLAYING</button></div>');$('#cancel-restart').onclick=closeDialog;$('#confirm-restart').onclick=()=>{const muted=state.audioMuted,reduced=state.reducedMotion;state=E.fresh();state.audioMuted=muted;state.reducedMotion=reduced;activeHouse=null;selectedWord=null;selectedTag=null;selectedGear=null;completedThisSession=false;villageSelectedItem=null;ancientBookOpen=null;explorerPosition={x:1015,y:885,scale:1};explorerLine='';closeDialog();save();render();};}
$('#sound').onclick=()=>{state.audioMuted=!state.audioMuted;if(state.audioMuted)window.speechSynthesis?.cancel();save();if(!state.audioMuted){speak('Ready for a little Halloween magic?');if(!('speechSynthesis' in window))notify('Speech is unavailable in this browser. All dialogue is written on screen.');}};$('#motion').onclick=()=>{state.reducedMotion=!state.reducedMotion;save();};$('#help').onclick=()=>{if(state.stage==='ancient'){showAncientHint();return;}dialog(`<div class="eyebrow">A LITTLE HELP FROM JOHNNY</div><h2>Follow the magic.</h2><p>${HELP[state.stage]}</p><p class="hint">No timer. No lost lives. Every wrong answer is a chance to try again. Your progress saves automatically.</p><button class="primary" id="help-done">LET'S GO!</button>`);$('#help-done').onclick=closeDialog;};$('#restart').onclick=restart;$('#close-modal').onclick=closeDialog;$('#modal').addEventListener('click',e=>{if(e.target===$('#modal'))closeDialog();});$('#home').onclick=e=>{e.preventDefault();activeHouse=null;state.stage='ancient';save();render();};$('#back').onclick=()=>{if(activeHouse){closeHouse();return;}const i=E.stages.indexOf(state.stage);if(i>0){state.stage=E.stages[i-1];save();render();}};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.stage==='ancient'&&state.ancientEncounter){leaveAncientEncounter();return;}if(e.key==='Escape'&&state.stage==='ancient'&&ancientBookOpen){ancientBookOpen=false;renderAncient();return;}if(e.key==='Escape'&&activeHouse&&!$('#modal').open)closeHouse();if(e.ctrlKey&&e.shiftKey&&e.code==='KeyD'){e.preventDefault();dialog(`<h2>Teacher tools</h2><p class="teacher">Stage: ${state.stage} · gears: ${state.gears.join(', ')||'none'} · candies: ${state.candies}/11<br>Seed: ${state.seed}</p><div class="teacher">${E.stages.map(s=>`<button data-debug="${s}">${s}</button>`).join('')}</div>`);$$('[data-debug]').forEach(b=>b.onclick=()=>{const s=b.dataset.debug;if(['street','finale'].includes(s)){state.gears=[1];state.bookCluesRead=Object.keys(facts);state.ancientCorrections=[0,1,2];}if(s==='finale'){state.visitedHouses=StreetContent.houses.map(x=>x.id);state.costumeChoice='pirate';state.candies=11;}state.stage=s;activeHouse=null;closeDialog();save();render();});}});
document.addEventListener('error',e=>{if(e.target instanceof HTMLImageElement&&!e.target.dataset.fallback){e.target.dataset.fallback='true';e.target.src='assets/magic-book.svg';}},true);
render();save();

if('serviceWorker' in navigator && ['http:','https:'].includes(location.protocol)){navigator.serviceWorker.register('./sw.js').catch(()=>{});}

['pointerdown','pointermove','keydown'].forEach(type=>document.addEventListener(type,()=>{if(state.stage==='ancient')armAncientHint();},{passive:true}));

$('#bag').onclick=()=>{if(state.stage==='street'&&state.visitedHouses.length===5)setStage('finale');};
$('#bag').onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&state.stage==='street'&&state.visitedHouses.length===5){e.preventDefault();setStage('finale');}};
