import { readdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = new URL('../dist/', import.meta.url).pathname;
const walk = async (dir) => (await Promise.all((await readdir(dir, { withFileTypes: true })).map(async entry => {
  const path = join(dir, entry.name);
  return entry.isDirectory() ? walk(path) : path;
}))).flat();
const builtFiles = (await walk(root))
  .filter(file => !file.endsWith('sw.js') && !file.endsWith('.map'))
  .map(file => `/${relative(root, file)}`);
const files = [...new Set(['/', '/privacy/', '/terms/', ...builtFiles])];
const version = `cc-${Date.now().toString(36)}`;
const source = `const VERSION=${JSON.stringify(version)};
const SHELL=${JSON.stringify(files)};
self.addEventListener('install',event=>event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==VERSION).map(key=>caches.delete(key)))),self.clients.claim()]).then(async()=>{for(const client of await self.clients.matchAll({type:'window'}))client.postMessage({type:'SW_UPDATED'});}))); 
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{const req=event.request;if(req.method!=='GET')return;const url=new URL(req.url);if(url.pathname.startsWith('/api/')||url.hostname==='api.sociobot.in'){event.respondWith(fetch(req).catch(()=>new Response(JSON.stringify({offline:true}),{status:503,headers:{'Content-Type':'application/json'}})));return;}if(req.mode==='navigate'){event.respondWith(fetch(req).then(res=>{const copy=res.clone();caches.open(VERSION).then(c=>c.put(req,copy));return res;}).catch(async()=>await caches.match(req)||await caches.match('/')||await caches.match('/offline.html')));return;}event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{if(res.ok&&url.origin===location.origin){const copy=res.clone();caches.open(VERSION).then(c=>c.put(req,copy));}return res;})));});`;
await writeFile(join(root, 'sw.js'), source);
console.log(`Generated ${version} with ${files.length} precached files.`);
