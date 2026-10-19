var embedCount=0;
function embedCheck(ok,label){if(!ok)throw Error('Embed: '+label);embedCount++;}
embedCheck(frame.style.transform==='translate(0px,0px) scale(1)','native 1280 by 720');
[[960,540,'translate(0px,0px) scale(0.75)'],[640,360,'translate(0px,0px) scale(0.5)'],[1920,1080,'translate(0px,0px) scale(1.5)'],[800,600,'translate(0px,75px) scale(0.625)'],[360,640,'translate(0px,218.75px) scale(0.28125)']].forEach(([width,height,expected])=>{document.documentElement.clientWidth=width;document.documentElement.clientHeight=height;embedEvents.resize();embedCheck(frame.style.transform===expected,'fit '+width+' by '+height);});
var message={type:'hotel-transylvania-mission-complete',mission:'johnny-trick-or-treat',candies:11};
embedEvents.message({source:{},origin:location.origin,data:message});embedCheck(!forwarded.length,'reject unknown source');
embedEvents.message({source:frame.contentWindow,origin:'https://example.com',data:message});embedCheck(!forwarded.length,'reject wrong origin');
embedEvents.message({source:frame.contentWindow,origin:location.origin,data:{...message,candies:10}});embedCheck(!forwarded.length,'reject incomplete mission');
embedEvents.message({source:frame.contentWindow,origin:location.origin,data:message});embedCheck(forwarded.length===1&&forwarded[0].origin==='https://view.genially.com','forward valid completion to configured parent');
var EMBED_TEST_RESULT='PASS: '+embedCount+' embedding checks, proportional resize and completion message validation.';
