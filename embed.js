'use strict';
// The inner viewport stays 1280 × 720; resizing only scales the whole game.
(function(){
 const frame=document.getElementById('stage');
 function fit(){
  const width=document.documentElement.clientWidth,height=document.documentElement.clientHeight;
  if(!width||!height)return;
  const scale=Math.min(width/1280,height/720);
  frame.style.transform=`translate(${(width-1280*scale)/2}px,${(height-720*scale)/2}px) scale(${scale})`;
 }
 window.addEventListener('resize',fit);
 window.visualViewport?.addEventListener('resize',fit);
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(fit).observe(document.documentElement);
 fit();
 // Forward the existing completion event through this embedding wrapper.
 window.addEventListener('message',event=>{
  if(event.source!==frame.contentWindow||event.origin!==location.origin)return;
  const data=event.data;
  if(data?.type!=='hotel-transylvania-mission-complete'||data.mission!=='johnny-trick-or-treat'||data.candies!==11)return;
  if(window.parent===window)return;
  const origin=window.HALLOWEEN_CONFIG?.parentOrigin;
  window.parent.postMessage({type:data.type,mission:data.mission,candies:11},origin&&/^https?:\/\//.test(origin)?origin:'*');
 });
})();
