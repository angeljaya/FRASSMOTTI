/* Cifrado del mensaje secreto (AES-GCM + PBKDF2, 100% en el navegador) y utilidades compartidas.
   El mensaje solo se puede leer con la palabra clave: viaja cifrado dentro del link (#hash). */
const TVS={
 b64:{enc:b=>btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''),
      dec:s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0))},
 norm:k=>(k||'').trim().toLowerCase(),
 fold:s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase(),   // v11: ignora tildes y mayúsculas (cerradura)
 async key(clave,salt){const m=await crypto.subtle.importKey('raw',new TextEncoder().encode(this.norm(clave)),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:150000,hash:'SHA-256'},m,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])},
 async enc(msg,clave){const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
  const ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},await this.key(clave,salt),new TextEncoder().encode(msg)));
  const o=new Uint8Array(28+ct.length);o.set(salt);o.set(iv,16);o.set(ct,28);return this.b64.enc(o)},
 async dec(s,clave){try{const o=this.b64.dec(s);return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:o.slice(16,28)},await this.key(clave,o.slice(0,16)),o.slice(28)))}catch(e){return null}},
 pack:o=>TVS.b64.enc(new TextEncoder().encode(JSON.stringify(o))),
 unpack(s){try{return JSON.parse(new TextDecoder().decode(this.b64.dec(s)))}catch(e){return{}}},
 chime(){try{const a=new(window.AudioContext||window.webkitAudioContext)();[523.25,659.25,783.99].forEach((f,i)=>{const o=a.createOscillator(),g=a.createGain(),t=a.currentTime+i*.12;
  o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.12,t+.03);g.gain.exponentialRampToValueAtTime(.001,t+.9);o.connect(g).connect(a.destination);o.start(t);o.stop(t+1)})}catch(e){}}
};
