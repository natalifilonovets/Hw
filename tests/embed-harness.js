var frame={style:{},contentWindow:{}},embedEvents={},forwarded=[];
var document={documentElement:{clientWidth:1280,clientHeight:720},getElementById:()=>frame};
var location={origin:'https://natalifilonovets.github.io'};
var window={addEventListener:(name,fn)=>embedEvents[name]=fn,parent:{postMessage:(data,origin)=>forwarded.push({data,origin})},HALLOWEEN_CONFIG:{parentOrigin:'https://view.genially.com'}};
var ResizeObserver=function(fn){this.observe=()=>fn();};
