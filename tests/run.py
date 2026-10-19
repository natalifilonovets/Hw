"""Run JavaScript tests with Node, or the macOS JavaScriptCore framework."""
from pathlib import Path
import ctypes, shutil, subprocess, re, sys
root=Path(__file__).resolve().parents[1]
node=shutil.which('node')
if node:
 for f in ('street-data.js','engine.js','village.js','street.js','game.js','config.js','sw.js','embed.js'):subprocess.run([node,'--check',str(root/f)],check=True)
 subprocess.run([node,str(root/'tests/engine.test.js')],check=True)
 source='const vm=require("vm"),fs=require("fs");const ctx=vm.createContext({}); for(const f of ["tests/dom-harness.js","street-data.js","engine.js","config.js","village.js","street.js","game.js","tests/ui.test.js"]){vm.runInContext(fs.readFileSync(f,"utf8"),ctx);}console.log(vm.runInContext("UI_TEST_RESULT",ctx));'
 subprocess.run([node,'-e',source],cwd=root,check=True)
else:
 lib=ctypes.CDLL('/System/Library/Frameworks/JavaScriptCore.framework/JavaScriptCore')
 ptr=ctypes.c_void_p
 lib.JSGlobalContextCreate.argtypes=[ptr];lib.JSGlobalContextCreate.restype=ptr
 lib.JSStringCreateWithUTF8CString.argtypes=[ctypes.c_char_p];lib.JSStringCreateWithUTF8CString.restype=ptr
 lib.JSEvaluateScript.argtypes=[ptr,ptr,ptr,ptr,ctypes.c_int,ctypes.POINTER(ptr)];lib.JSEvaluateScript.restype=ptr
 lib.JSValueToStringCopy.argtypes=[ptr,ptr,ctypes.POINTER(ptr)];lib.JSValueToStringCopy.restype=ptr
 lib.JSStringGetMaximumUTF8CStringSize.argtypes=[ptr];lib.JSStringGetMaximumUTF8CStringSize.restype=ctypes.c_size_t
 lib.JSStringGetUTF8CString.argtypes=[ptr,ctypes.c_char_p,ctypes.c_size_t];lib.JSStringGetUTF8CString.restype=ctypes.c_size_t
 ctx=lib.JSGlobalContextCreate(None)
 def string(v):
  s=lib.JSValueToStringCopy(ctx,v,None);n=lib.JSStringGetMaximumUTF8CStringSize(s);b=ctypes.create_string_buffer(n);lib.JSStringGetUTF8CString(s,b,n);return b.value.decode()
 def run(source):
  err=ptr();script=lib.JSStringCreateWithUTF8CString(source.encode());result=lib.JSEvaluateScript(ctx,script,None,None,1,ctypes.byref(err))
  if err.value:raise RuntimeError(string(err.value))
  return string(result)
 import json
 for f in ('street-data.js','engine.js','village.js','street.js','game.js','config.js','sw.js','embed.js'):run('new Function('+json.dumps((root/f).read_text())+');')
 print('PASS: JavaScript syntax (engine, game, config)')
 run('var module={exports:{}};'+(root/'street-data.js').read_text())
 run((root/'engine.js').read_text())
 run((root/'tests/engine.test.js').read_text())
 print(run('TEST_RESULT'))
 ctx=lib.JSGlobalContextCreate(None)
 run((root/'tests/dom-harness.js').read_text())
 run((root/'street-data.js').read_text())
 run((root/'engine.js').read_text())
 run((root/'config.js').read_text())
 run((root/'village.js').read_text())
 run((root/'street.js').read_text())
 run((root/'game.js').read_text())
 run((root/'tests/ui.test.js').read_text())
 print(run('UI_TEST_RESULT'))
# Verify the dedicated Genially viewport and its completion-message bridge.
if node:
 source='const vm=require("vm"),fs=require("fs"),ctx=vm.createContext({});for(const f of ["tests/embed-harness.js","embed.js","tests/embed.test.js"])vm.runInContext(fs.readFileSync(f,"utf8"),ctx);console.log(vm.runInContext("EMBED_TEST_RESULT",ctx));'
 subprocess.run([node,'-e',source],cwd=root,check=True)
else:
 ctx=lib.JSGlobalContextCreate(None)
 for f in ('tests/embed-harness.js','embed.js','tests/embed.test.js'):run((root/f).read_text())
 print(run('EMBED_TEST_RESULT'))
# Verify every static asset and the explicit dynamic asset sets.
refs=set()
for f in ('index.html','styles.css','game.js','village.js','street.js'):
 refs.update(re.findall(r'assets/([\w.-]+\.(?:svg|png|jpg|webp))',(root/f).read_text()))
refs.update(x+'-bg.jpg' for x in ('lobby','ancient-village','old-village','street'))
refs.add('village-broom.png')
refs.update('discovery-'+x+'.png' for x in ('fire','mask','lantern','fox','candy'))
refs.update(['street-witch.png','street-ghost.png','street-werewolf.png'])
refs.update('village-'+x+'-porch.jpg' for x in ('souling','guising'))
refs.update('page-'+x+'-illustrated.png' for x in ('fire','mask','spirit'))
refs.update(x+'.svg' for x in ('pumpkin','ghost','witch','skeleton','pirate','wolf','bat'))
for f in refs:assert (root/'assets'/f).is_file(),f'Missing asset: {f}'
print(f'PASS: {len(refs)} referenced local assets exist')
from xml.etree import ElementTree
for f in (root/'assets').glob('*.svg'):ElementTree.parse(f)
print('PASS: all SVG assets parse')

# The offline cache must include every bundled illustration, including fragments.
import ast
precache=ast.literal_eval(re.search(r"const FILES=(\[.*?\]);",(root/'sw.js').read_text()).group(1))
for asset in (root/'assets').iterdir():
 assert str(asset.relative_to(root)) in precache, f'Offline cache missing {asset.name}'
for entry in precache:
 assert (root/entry).exists(), f'Precache references missing file: {entry}'
print('PASS: offline manifest includes all local artwork and references existing files')
