(function(root){
'use strict';
const houses=[
{id:'pumpkin',name:'Pumpkin Porch',resident:'street-witch.png',speaker:'WITCH',greeting:'Happy Halloween! What do you say?',door:'M151 594V479Q184 429 220 479V594Z',hinge:[151,594],crop:[30,280,500,500],light:[185,518],windows:[[137,315],[204,315]],questions:[
{sentence:'The witch ___ pumpkins every October.',options:['carve','carves','carving'],answer:'carves',hint:'The witch is one person. Check the verb form for he or she.'},
{sentence:'We ___ our house for Halloween.',options:['decorate','decorates','decorating'],answer:'decorate',hint:'Look at “We”. Use the verb form for more than one person.'},
{sentence:'___ your friends wear costumes?',options:['Does','Are','Do'],answer:'Do',hint:'This asks about an action. Are “your friends” one person or more than one?'}]},
{id:'ghost',name:'Friendly Ghost',resident:'street-ghost.png',speaker:'GHOST',greeting:'Boo! A friendly boo. What do you say?',door:'M502 604V522Q529 478 555 522V604Z',hinge:[502,604],crop:[300,280,500,500],light:[529,548],windows:[[502,347],[458,525],[587,528]],questions:[
{sentence:'The ghost ___ in an old house.',options:['live','living','lives'],answer:'lives',hint:'The ghost is one character. Think about the verb form for he or she.'},
{sentence:'Ghosts ___ through walls.',options:['pass','passes','passing'],answer:'pass',hint:'“Ghosts” means more than one. Choose the verb form for they.'},
{sentence:'___ the ghost like candy?',options:['Is','Does','Do'],answer:'Does',hint:'“Like” is an action here. Check the question helper for one character.'}]},
{id:'costume',name:'Costume House',resident:'johnny-welcome.png',speaker:'JOHNNY',greeting:'Welcome to the costume house! What do you say?',door:'M875 614V532Q896 497 918 532V614Z',hinge:[875,614],crop:[650,280,500,500],light:[896,556],windows:[[842,391],[930,335]],questions:[
{sentence:'Mavis ___ a black dress.',options:['wears','wear','wearing'],answer:'wears',hint:'Mavis is one person. Look for the Present Simple form for she.'},
{sentence:'Johnny ___ scary costumes.',options:["don't like","doesn't likes","doesn't like"],answer:"doesn't like",hint:'A negative needs a helper. After the helper, use the base verb.'},
{sentence:'What ___ children wear on Halloween?',options:['does','do','are'],answer:'do',hint:'“Children” means more than one. Check the question helper for they.'}]},
{id:'wolf',name:'Werewolf Garden',resident:'street-werewolf.png',speaker:'WEREWOLF',greeting:'Welcome to my garden! What do you say?',door:'M1205 600V533Q1231 505 1256 533V600Z',hinge:[1205,600],crop:[1000,280,500,500],light:[1230,553],windows:[[1181,387],[1120,530],[1327,541]],questions:[
{sentence:'The werewolf ___ at the moon.',options:['howl','howls','howling'],answer:'howls',hint:'The werewolf is one character. Check the verb form for he.'},
{sentence:'Werewolves ___ very fast.',options:['runs','running','run'],answer:'run',hint:'There is more than one werewolf. Use the verb form for they.'},
{sentence:'___ a werewolf have sharp teeth?',options:['Does','Do','Is'],answer:'Does',hint:'This asks about “have”. Check the helper for one werewolf.'}]},
{id:'prank',name:'Mystery Prank House',resident:'dracula-reaction.png',speaker:'DRACULA',greeting:'A little mystery awaits! What do you say?',door:'M1496 615V532Q1522 507 1550 532V615Z',hinge:[1496,615],crop:[1172,280,500,500],light:[1523,555],windows:[[1562,291],[1537,371],[1610,410]],questions:[
{sentence:'Dracula ___ garlic.',options:["don't like","doesn't like","doesn't likes"],answer:"doesn't like",hint:'Dracula is one character. A negative helper is followed by the base verb.'},
{sentence:'Children ___ candy on Halloween.',options:['collect','collects','collecting'],answer:'collect',hint:'“Children” means more than one. Choose the verb form for they.'},
{sentence:'Where ___ the vampire sleep?',options:['do','is','does'],answer:'does',hint:'“Sleep” is an action. Check the question helper for one vampire.'}]}
];
function answerSlots(seed){
 const pool=[0,0,0,0,0,1,1,1,1,1,2,2,2,2,2];
 for(let attempt=0;attempt<400;attempt++){
  const a=shuffle(pool,(seed+attempt*7919)>>>0);
  if(a.some((x,i)=>i>1&&x===a[i-1]&&x===a[i-2]))continue;
  let repeated=false;for(let i=0;i<=9;i++)if(a.slice(i,i+3).join('')===a.slice(i+3,i+6).join(''))repeated=true;
  if(!repeated)return a;
 }
 return shuffle(pool,seed);
}
function shuffle(items,seed){let n=seed>>>0,a=[...items];function rand(){n+=0x6D2B79F5;let t=n;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;}for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function choices(seed,id,index){const hi=houses.findIndex(h=>h.id===id);if(hi<0||!houses[hi].questions[index])return [];const q=houses[hi].questions[index],position=answerSlots(seed)[hi*3+index],wrong=shuffle(q.options.filter(x=>x!==q.answer),seed+hi*173+index*31+49);wrong.splice(position,0,q.answer);return wrong;}
const api={houses,answerSlots,choices};root.StreetContent=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
