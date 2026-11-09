/* MILA HOUSE — offline support. Keeps a copy of the app so it opens even when the Wi-Fi drops.
   Booking data is NOT handled here (Firebase keeps its own copy on the device). */
const CACHE="mila-house-v1";
const SHELL=["./","./index.html","./firebase-config.js","./apple-touch-icon.png","./manifest.webmanifest"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{}))});
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url);
  const mine=u.origin===self.location.origin, lib=u.hostname==="www.gstatic.com"&&u.pathname.startsWith("/firebasejs/"), font=u.hostname==="fonts.googleapis.com"||u.hostname==="fonts.gstatic.com";
  if(!mine&&!lib&&!font)return; // Firebase database / login traffic goes straight to the network
  e.respondWith(fetch(r).then(res=>{if(res&&(res.ok||res.type==="opaque")){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res})
    .catch(()=>caches.match(r).then(m=>m||(r.mode==="navigate"?caches.match("./index.html"):null)).then(m=>m||Response.error())));
});
