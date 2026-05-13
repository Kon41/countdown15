const CACHE='countdown-v2';
const ASSETS=['./','./index.html','./manifest.json','./icon-192.svg','./icon-512.svg'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(ASSETS.map(u=>c.add(u).catch(()=>{})))));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.hostname.includes('worldtimeapi')||u.hostname.includes('timeapi')||u.hostname.includes('fonts.')){
    e.respondWith(fetch(e.request).catch(()=>new Response('',{status:503})));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached)return cached;
      return fetch(e.request).then(res=>{
        if(res&&res.status===200){const cl=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cl));}
        return res;
      }).catch(()=>e.request.mode==='navigate'?caches.match('./index.html'):undefined);
    })
  );
});
