const CACHE='teapot-shell-v1';
const SHELL=['./','./index.html','./styles.css','./app.js','./model.js','./icon.svg','./icon-192.png','./icon-512.png','./manifest.webmanifest'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('teapot-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 const path=new URL(event.request.url).pathname;
 // Do not cache auth pages, API responses, or future live sensor readings.
 if(!SHELL.some(s=>new URL(s,self.registration.scope).pathname===path))return;
 event.respondWith(fetch(event.request).then(async response=>{
  const type=response.headers.get('content-type')||'';
  if(response.ok&&!response.redirected&&((path.endsWith('.js')&&/javascript/.test(type))||(!path.endsWith('.js')&&!path.includes('/api/')))){
   const cache=await caches.open(CACHE);await cache.put(event.request,response.clone());
  }return response;
 }).catch(()=>caches.match(event.request)));
});
