'use strict';
// Archived chapter: retained for old asset provenance, absent from the route.
const traditions={SOULING:'Long ago, some people visited their neighbours. They said prayers and received small cakes called soul cakes.',GUISING:'We wear costumes and visit our neighbours. We sing songs or perform. Sometimes, we receive treats.'};
const tags=['Say prayers','Receive soul cakes','Wear a costume','Sing songs or perform'];
// Chapter 02 keeps its scenery mounted; only movable props and task text change.
let villageTimer, villageBusy=false, villageSelectedItem=null, villageDoorPending=null;
const VILLAGE_PROPS={prayers:'village-souling-porch.jpg',cakes:'soul-cake.png',disguise:'page-mask-illustrated.png',perform:'village-lute.png'};
const VILLAGE_TALK={
 SOULING:{welcome:'Welcome, traveller! These little cakes are for our visitors. Would you like to hear our story?',questions:[['cakes','What are these little cakes?'],['custom','How do visitors get a treat?']],answers:{cakes:'They are soul cakes. Some visitors say prayers, and we give them cakes. We call this souling.',custom:'Some visitors say prayers, and we give them little soul cakes. This custom is called souling.'},reply:'May I have a soul cake, please?'},
 GUISING:{welcome:'Hello! We are getting ready to visit our neighbours. There is a song to sing. Would you like to join us?',questions:[['join','Why are you wearing a costume?'],['music','What is the music for?']],answers:{join:'We wear costumes and visit our neighbours. We sing or perform for treats. This is called guising. Come with us!',music:'We sing songs or perform when we visit our neighbours. Sometimes they give us treats. We wear costumes, too. This is called guising.'},reply:'Yes! I want to join you.'}
};
function villageStoryLine(home){
 const talk=state.villageTalk[home],done=state.villageTasks[home];
 if(done)return home==='SOULING'?'You are very welcome! Remember our story: some visitors said prayers and received soul cakes. Enjoy your cake!':'What a lovely song! Here is your treat. Remember: costumes and a performance. That is our guising story!';
 if(talk!=='ready')return VILLAGE_TALK[home].answers[talk]||VILLAGE_TALK[home].welcome;
 if(home==='SOULING')return state.soulCakePlaced?'Here is your soul cake, traveller. What would you like to say?':'Of course! Take a soul cake for your basket. Then you can visit our neighbours and hear their story, too.';
 return state.guisingActions.length===2?'You have your costume and your music. Tell us what you can do, and we can begin!':'Let’s get ready together. You need a costume and something for your performance. What will you choose?';
}
function refreshVillageStory(){const text=$('#villager-story-text');if(text&&state.villageView)text.textContent=villageStoryLine(state.villageView);}
function renderVillageConversation(home){
 const talk=state.villageTalk[home];if(talk==='ready'||state.villageTasks[home])return false;
 const story=VILLAGE_TALK[home];
 $('#village-interaction').innerHTML=`<section class="porch-dialogue village-conversation" aria-label="Talk to the villager"><p class="johnny-dialogue-label">JOHNNY</p>${talk?`<button class="spoken-choice" data-village-talk="ready">${story.reply}</button>`:story.questions.map(([id,line])=>`<button class="spoken-choice" data-village-talk="${id}">${line}</button>`).join('')}</section>`;
 $$('[data-village-talk]').forEach(b=>b.onclick=()=>{state.villageTalk[home]=b.dataset.villageTalk;save();updateVillageTask();($$('[data-village-talk], [data-soul-item], [data-guise-action]')[0])?.focus();speak(villageStoryLine(home));});
 return true;
}
function clearVillageAnimation(){clearTimeout(villageTimer);villageBusy=false;villageDoorPending=null;$$('.village-flying-cake').forEach(e=>e.remove());}
function villageWorld(){
 const doors={SOULING:{path:'M135 550V277Q178 177 237 269V550Z',lantern:'M263 177H326V281H263Z',hinge:'135px 550px'},GUISING:{path:'M1380 574V342Q1438 246 1512 336V574Z',lantern:'M1437 217H1514V325H1437Z',hinge:'1380px 574px'}};
 return `<svg class="village-world ${state.gears.includes(2)?'world-restored':''}" viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid meet" aria-label="A medieval village with two welcoming cottage doors"><defs><clipPath id="cottage-left-light"><path d="M0 0H570V660H0Z"/></clipPath><clipPath id="cottage-right-light"><path d="M1110 0H1672V665H1110Z"/></clipPath>${Object.entries(doors).map(([k,d])=>`<clipPath id="lantern-${k}"><path d="${d.lantern}"/></clipPath>`).join('')}</defs><image href="assets/old-village-bg.jpg" width="1672" height="941"/><g class="cottage-warmth" aria-hidden="true"><image href="assets/old-village-bg.jpg" width="1672" height="941" clip-path="url(#cottage-left-light)"/><image href="assets/old-village-bg.jpg" width="1672" height="941" clip-path="url(#cottage-right-light)"/></g>${Object.entries(doors).map(([k,d])=>`<g data-cottage="${k}" class="village-door ${state.villageRead.includes(k)?'door-visited':''} ${state.gears.includes(2)?'door-restored':''}" role="button" tabindex="0" aria-label="Enter the ${k==='SOULING'?'left':'right'} cottage${state.villageRead.includes(k)?', story completed':''}"><g class="village-lantern" style="transform-origin:${k==='SOULING'?'294px 179px':'1475px 219px'}"><image href="assets/old-village-bg.jpg" width="1672" height="941" clip-path="url(#lantern-${k})"/></g><path class="door-hit" d="${d.path}"/></g>`).join('')}</svg>`;
}
function porchScenery(home){return `<img class="cottage-closeup" src="assets/village-${home==='SOULING'?'souling':'guising'}-porch.jpg" alt="${home==='SOULING'?'A friendly historical villager at an open cottage entrance, with a basket on a table':'A villager in a costume with a lute at an open, lantern-lit cottage entrance'}">${home==='GUISING'?'<img class="guising-performer" src="assets/village-performer.png" alt="A friendly villager in a costume playing a lute">':''}<button id="leave-cottage" class="cottage-return" aria-label="Back to the village">←</button><div class="villager-line"><p id="villager-story-text" aria-live="polite">${villageStoryLine(home)}</p><button id="listen-villager" class="story-listen" aria-label="Listen to the village story">${controlIcon('sound')}</button></div>`;}
function renderVillage(){
 if(state.stage!=='village')return;
 $('#game').classList.add('village-stage');const view=state.villageView||'street';
 if($('#village-adventure')?.dataset.view!==view){
  $('#scene').innerHTML=`<h2 id="scene-title" class="sr-only">Two doors, two stories</h2><section id="village-adventure" data-view="${view}" class="village-adventure ${view==='street'?'village-overview':'cottage-visit'}">${view==='street'?villageWorld():'<div class="cottage-frame">'+porchScenery(view)}<div id="village-interaction"></div><p id="village-feedback" class="village-feedback" role="status"></p>${view==='street'?'':'</div>'}</section>`;
  if(view==='street')$$('[data-cottage]').forEach(b=>{b.onclick=()=>enterCottage(b.dataset.cottage);b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();enterCottage(b.dataset.cottage);}};});
  else{$('#leave-cottage').onclick=leaveCottage;$('#listen-villager').onclick=()=>{state.audioMuted=false;save();speak(villageStoryLine(state.villageView));};}
 }
 updateVillageTask();
}
function enterCottage(home){
 if(villageBusy)return;villageBusy=true;villageDoorPending=home;$(`[data-cottage="${home}"]`)?.classList.add('door-approaching');
 const arrive=()=>{if(state.stage!=='village'||villageDoorPending!==home)return;state.villageView=home;villageSelectedItem=null;villageBusy=false;villageDoorPending=null;save();renderVillage();speak(villageStoryLine(home));};
 if(quietMotion())arrive();else villageTimer=setTimeout(arrive,420);
}
function leaveCottage(){clearVillageAnimation();state.villageView=null;villageSelectedItem=null;save();renderVillage();}
function villageFeedback(text){const p=$('#village-feedback');if(p)p.textContent=text;}
function villageHelp(){
 if(state.villageView&&state.villageTalk[state.villageView]!=='ready'&&!state.villageTasks[state.villageView]){villageFeedback('Ask the villager about this custom. Choose what Johnny says.');return;}
 if(state.villageView==='SOULING')villageFeedback(state.soulCakePlaced?'Choose a polite way to say thank you.':'The villager offered you a soul cake. Put it in your basket.');
 else if(state.villageView==='GUISING')villageFeedback(state.guisingActions.length===2?'Put the three words in order to say what you can do.':'Choose a costume and something for your performance.');
 else if(state.villageRead.length===2)villageFeedback('Choose a word card, then its basket. You can also drag it. Match the two stories you visited.');
 else{villageFeedback('Knock on both cottage doors. Someone is waiting to tell you a story!');const home=state.villageRead.includes('SOULING')?'GUISING':'SOULING';$(`[data-cottage="${home}"]`)?.classList.add('door-hint');}
}
function updateVillageTask(){
 if(!$('#village-interaction'))return;
 if(!state.villageView){
  if(state.villageRead.length===2)updateSortingTable();
  else if(!$('#village-greeting')){$('#village-interaction').innerHTML='<p id="village-greeting" class="village-greeting">Johnny: “How did people get treats long ago? Let’s ask our neighbours.”</p>';}
  return;
 }
 refreshVillageStory();
 if(renderVillageConversation(state.villageView))return;
 if(state.villageView==='SOULING')renderSoulingTask();else renderGuisingTask();
}
function renderSoulingTask(){
 refreshVillageStory();
 const done=state.villageTasks.SOULING, placed=state.soulCakePlaced||done;
 $('#village-interaction').innerHTML=`<div class="souling-props"><button class="physical-prop soul-cake-prop ${villageSelectedItem==='cake'?'prop-selected':''} ${placed?'cake-collected':''}" data-soul-item="cake" draggable="${!placed}" aria-label="Select the soul cake" ${placed?'disabled':''}><img src="assets/soul-cake.png" alt="A golden soul cake with a cross on top"></button><button class="physical-prop soul-lute-prop ${villageSelectedItem==='lute'?'prop-selected':''}" data-soul-item="lute" aria-label="Select the lute" ${placed?'disabled':''}><img src="assets/village-lute.png" alt="A wooden lute"></button><button id="soul-cake-basket" class="soul-cake-basket" aria-label="Place the selected object in your food basket"><img class="basket-cake-left" src="assets/soul-cake.png" alt="Soul cake already in your basket"><img class="basket-cake-right" src="assets/soul-cake.png" alt="Soul cake already in your basket">${placed?'<img src="assets/soul-cake.png" alt="Soul cake placed in your basket">':''}</button></div>${placed&&!done?`<section class="porch-dialogue gratitude-dialogue" aria-label="Choose what to say to the villager">${E.shuffle(['Thank you for the cake!','Give me more!','Where is my costume?'],state.seed+61).map(line=>`<button class="spoken-choice" data-soul-reply="${escapeHTML(line)}">${line}</button>`).join('')}</section>`:''}<p class="porch-direction">${done?'“Thank you for the cake!”':placed?'What do you say? Choose a polite answer.':'Take the cake the villager offered and put it in your basket.'}</p>`;
 $$('[data-soul-item]').forEach(b=>{b.onclick=()=>{if(placed)return;villageSelectedItem=b.dataset.soulItem;$$('[data-soul-item]').forEach(x=>x.classList.toggle('prop-selected',x===b));};b.ondragstart=e=>{villageSelectedItem=b.dataset.soulItem;e.dataTransfer.setData('text/plain','soul:'+villageSelectedItem);};});
 const basket=$('#soul-cake-basket');basket.onclick=()=>placeSoulCake(villageSelectedItem);basket.ondragover=e=>e.preventDefault();basket.ondrop=e=>{e.preventDefault();const value=e.dataTransfer.getData('text/plain');if(value.startsWith('soul:'))placeSoulCake(value.slice(5));};
 $$('[data-soul-reply]').forEach(b=>b.onclick=()=>{if(E.answerSouling(state,b.dataset.soulReply)){save();renderSoulingTask();villageFeedback('You’re welcome! The neighbours have another story. Let’s visit them.');speak('You’re welcome! The neighbours have another story. Let’s visit them.');}else{villageFeedback('Try a polite way to say thank you.');b.classList.add('prop-bounce');}});
}
function placeSoulCake(item){
 if(villageBusy||state.soulCakePlaced||state.villageTasks.SOULING)return;
 if(item!=='cake'){villageFeedback('That is not food. Find the little cake with a cross.');$(`[data-soul-item="${item}"]`)?.classList.add('prop-bounce');return;}
 villageBusy=true;
 const source=$('[data-soul-item="cake"]').getBoundingClientRect(), target=$('#soul-cake-basket').getBoundingClientRect(), game=$('#game').getBoundingClientRect();
 const finish=()=>{if(state.stage!=='village'||state.villageView!=='SOULING')return;E.receiveSoulCake(state,'cake');villageSelectedItem=null;villageBusy=false;save();renderSoulingTask();villageFeedback('You have your soul cake. What do you say?');};
 if(quietMotion()){finish();return;}
 const cake=document.createElement('img');cake.className='village-flying-cake';cake.src='assets/soul-cake.png';cake.alt='';cake.style.left=`${source.left+source.width/2-game.left}px`;cake.style.top=`${source.top+source.height/2-game.top}px`;cake.style.setProperty('--cake-x',`${target.left+target.width/2-source.left-source.width/2}px`);cake.style.setProperty('--cake-y',`${target.top+target.height/2-source.top-source.height/2}px`);cake.style.setProperty('--cake-mid-x',`${(target.left+target.width/2-source.left-source.width/2)*.45}px`);cake.style.setProperty('--cake-mid-y',`${(target.top+target.height/2-source.top-source.height/2)*.45-70}px`);$('#game').append(cake);$('[data-soul-item="cake"]').classList.add('cake-in-flight');
 villageTimer=setTimeout(()=>{cake.remove();finish();},850);
}
function renderGuisingTask(){
 refreshVillageStory();
 const done=state.villageTasks.GUISING, ready=state.guisingActions.length===2;
 $('#village-adventure').classList.toggle('disguise-ready',state.guisingActions.includes('disguise'));
 const options=[['disguise','Wear a costume','page-mask-illustrated.png'],['perform','Sing or perform','village-lute.png'],['snack','Have a snack','soul-cake.png'],['sweep','Sweep the floor','village-broom.png']];
 $('#village-interaction').innerHTML=`<div class="guising-options ${ready?'performance-ready':''}">${E.shuffle(options,state.seed+12).filter(([id])=>!ready||state.guisingActions.includes(id)).map(([id,label,asset])=>`<button class="performance-prop ${state.guisingActions.includes(id)?'action-chosen':''}" data-guise-action="${id}" aria-pressed="${state.guisingActions.includes(id)}" ${ready||done?'disabled':''}><img src="assets/${asset}" alt=""><span>${label}</span></button>`).join('')}</div>${ready&&!done?guisingSpeech():''}<div class="performance-magic" aria-hidden="true"><span>♪</span><span>♫</span><span>♪</span><img src="assets/soul-cake.png" alt=""></div><p class="porch-direction">${done?'“I can sing!” A costume, a song, and a treat!':ready?'Tell the villager what you can do.':'Join the neighbours: choose a costume and something for your song.'}</p>`;
 $$('[data-guise-action]').forEach(b=>b.onclick=()=>{
  if(villageBusy||ready||done)return;const action=b.dataset.guiseAction;
  if(!E.guisingAction(state,action)){villageFeedback('Which two actions help you get ready for guising? Read the story again.');b.classList.add('prop-bounce');return;}
  save();renderGuisingTask();if(state.guisingActions.length===2)villageFeedback('You are ready. Put the words in order and say your line!');
 });
 bindGuisingSpeech();
}
function guisingSpeech(){return `<section class="porch-dialogue guising-dialogue" aria-label="Build your performance line"><p class="performance-line" aria-live="polite">${state.guisingWords.length?state.guisingWords.map(escapeHTML).join(' '):'…'}</p><div class="speech-word-tiles">${E.shuffle(['I','can','sing!'],state.seed+71).filter(w=>!state.guisingWords.includes(w)).map(w=>`<button class="speech-word" data-speech-word="${w}">${w}</button>`).join('')}<button id="reset-performance-line" class="speech-reset" aria-label="Reset your sentence">↶</button><button id="say-performance-line" class="speech-say" ${state.guisingWords.length!==3?'disabled':''}>SAY IT!</button></div></section>`;}
function bindGuisingSpeech(){
 $$('[data-speech-word]').forEach(b=>b.onclick=()=>{const word=b.dataset.speechWord;if(state.guisingWords.includes(word)||state.guisingWords.length>=3)return;state.guisingWords.push(word);save();refreshGuisingSpeech();});
 $('#reset-performance-line')?.addEventListener('click',()=>{state.guisingWords=[];save();refreshGuisingSpeech();});
 $('#say-performance-line')?.addEventListener('click',()=>{
  if(!E.sayGuising(state)){villageFeedback('Read your sentence aloud. Try putting the words in a different order.');return;}
  save();renderGuisingTask();$('#village-adventure').classList.add('guising-performance');villageFeedback('What a lovely performance! Here is your treat.');speak('I can sing!');
 });
}
function refreshGuisingSpeech(){
 const dialogue=$('.guising-dialogue');if(!dialogue)return;
 // Keep the set, performer and story still while only the spoken words change.
 const line=$('.performance-line');if(line)line.textContent=state.guisingWords.length?state.guisingWords.join(' '):'…';
 const tiles=$('.speech-word-tiles');if(tiles){tiles.innerHTML=E.shuffle(['I','can','sing!'],state.seed+71).filter(w=>!state.guisingWords.includes(w)).map(w=>`<button class="speech-word" data-speech-word="${w}">${w}</button>`).join('')+`<button id="reset-performance-line" class="speech-reset" aria-label="Reset your sentence">↶</button><button id="say-performance-line" class="speech-say" ${state.guisingWords.length!==3?'disabled':''}>SAY IT!</button>`;}
 bindGuisingSpeech();
}
function wordCard(id){const asset=[VILLAGE_PROPS.prayers,VILLAGE_PROPS.cakes,VILLAGE_PROPS.disguise,VILLAGE_PROPS.perform][id];return `<button class="illustrated-word-card ${selectedTag===id?'word-card-selected':''}" draggable="true" data-tag="${id}" aria-pressed="${selectedTag===id}"><img class="card-paper" src="assets/village-word-parchment.png" alt=""><img class="card-picture picture-${id}" src="assets/${asset}" alt=""><span>${tags[id]}</span></button>`;}
function updateSortingTable(){
 let table=$('#village-sorting-table');
 if(!table){table=document.createElement('section');table.id='village-sorting-table';table.className='village-sorting-table';table.setAttribute('aria-label','Help Johnny record the two village stories');table.innerHTML='<img class="sorting-table-art" src="assets/village-sorting-table.png" alt="A wooden table with two wicker baskets"><div id="sorting-baskets"></div><div id="sorting-word-cards" class="sorting-word-cards"></div><div id="village-component"></div>';$('#village-interaction').innerHTML='';$('#village-interaction').append(table);}
 $('#sorting-baskets').innerHTML=['SOULING','GUISING'].map(home=>`<button class="tradition-basket basket-${home.toLowerCase()}" data-basket="${home}" aria-label="Place the selected card in ${home}"><span class="basket-label">${home}</span><span class="basket-cards">${state.sorted.filter(i=>(i<2?'SOULING':'GUISING')===home).map(i=>`<span class="sorted-word"><img src="assets/${[VILLAGE_PROPS.prayers,VILLAGE_PROPS.cakes,VILLAGE_PROPS.disguise,VILLAGE_PROPS.perform][i]}" alt=""><span>${tags[i]}</span></span>`).join('')}</span></button>`).join('');
 $('#sorting-word-cards').innerHTML=E.shuffle([0,1,2,3],state.seed+2+state.villageAttempt*131).filter(i=>!state.sorted.includes(i)).map(wordCard).join('');
 $$('[data-tag]').forEach(b=>{b.onclick=()=>{selectedTag=selectedTag===Number(b.dataset.tag)?null:Number(b.dataset.tag);$$('[data-tag]').forEach(x=>{x.classList.toggle('word-card-selected',Number(x.dataset.tag)===selectedTag);x.setAttribute('aria-pressed',String(Number(x.dataset.tag)===selectedTag));});};b.ondragstart=e=>{selectedTag=Number(b.dataset.tag);e.dataTransfer.setData('text/plain','tradition:'+selectedTag);};});
 $$('[data-basket]').forEach(b=>{b.onclick=()=>placeTradition(selectedTag,b.dataset.basket);b.ondragover=e=>e.preventDefault();b.ondrop=e=>{e.preventDefault();const raw=e.dataTransfer.getData('text/plain');if(/^tradition:[0-3]$/.test(raw))placeTradition(Number(raw.slice(10)),b.dataset.basket);};});
 if(state.gears.includes(2))showVillageComponent();
 else villageFeedback('Johnny: “Let’s save both stories in my book. Which actions go with each visit?”');
}
function placeTradition(id,home){
 if(villageBusy||state.gears.includes(2))return;
 if(!Number.isInteger(id)){villageFeedback('Choose a word card, then a basket.');return;}
 if(!E.sort(state,id,home)){selectedTag=null;state.villageAttempt++;save();updateSortingTable();villageFeedback('Try the other story. Correctly placed cards stay in their baskets.');$(`[data-tag="${id}"]`)?.classList.add('prop-bounce');return;}
 selectedTag=null;save();updateSortingTable();
 if(state.gears.includes(2)){
  $$('.village-door').forEach(e=>e.classList.add('door-restored'));$('#village-adventure').classList.add('village-restored');
  villageFeedback('Johnny: “Two ways to visit neighbours and receive treats! Now let’s see Halloween today.”');speak('Two ways to visit neighbours and receive treats! Now let’s see Halloween today.');
 }else villageFeedback('That action belongs in this story.');
}
function showVillageComponent(){const component=$('#village-component');if(!component||component.children.length)return;component.innerHTML=`<img class="village-johnny" src="assets/johnny-welcome.png" alt="Johnny smiles at the restored time-machine part"><img class="village-gear" src="assets/page-mask-illustrated.png" alt="Village stories completed">${nextButton('street','TRICK OR TREAT!')}`;bindNext();}
