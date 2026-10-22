/* Sonidos y parallax del diseño Carta 3D (base del usuario) */
let soundEnabled=true,audioCtx=null;
function initAudio() { if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }

function playWaxCrackSound() {
  if(!soundEnabled) return; initAudio();
  const bufferSize = audioCtx.sampleRate * 0.15; const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0); for (let i=0; i<bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = audioCtx.createBufferSource(); noise.buffer = buffer;
  const filter = audioCtx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.setValueAtTime(1200, audioCtx.currentTime); filter.Q.setValueAtTime(3, audioCtx.currentTime);
  const gain = audioCtx.createGain(); gain.gain.setValueAtTime(0.4, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
  noise.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination); noise.start();
}

function playPaperSlideSound() {
  if(!soundEnabled) return; initAudio();
  const bufferSize = audioCtx.sampleRate * 0.6; const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0); for (let i=0; i<bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = audioCtx.createBufferSource(); noise.buffer = buffer;
  const filter = audioCtx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.setValueAtTime(400, audioCtx.currentTime); filter.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.5);
  const gain = audioCtx.createGain(); gain.gain.setValueAtTime(0.01, audioCtx.currentTime); gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.2); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.55);
  noise.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination); noise.start();
}

function playChimeSound() {
  if(!soundEnabled) return; initAudio();
  const notes = [523.25, 659.25, 783.99, 1046.50];
  notes.forEach((freq, idx) => {
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.08);
    gain.gain.setValueAtTime(0, audioCtx.currentTime + idx * 0.08); gain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + idx * 0.08 + 0.02); gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + idx * 0.08 + 0.8);
    osc.connect(gain); gain.connect(audioCtx.destination); osc.start(audioCtx.currentTime + idx * 0.08); osc.stop(audioCtx.currentTime + idx * 0.08 + 0.85);
  });
}
const escena = document.getElementById('escena');
let targetRotX = 0, targetRotY = 0, currentRotX = 0, currentRotY = 0, parallaxRun = false;
const REDUCE_MOTION = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const TOUCH_UI = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
/* v30 · antes este bucle corría SIEMPRE (60 veces por segundo, aunque nadie moviera nada) y la transición CSS de .escena se reiniciaba en cada cuadro:
   eso mantenía ocupada la GPU del celular. Ahora el bucle solo corre mientras la tarjeta se está moviendo y se apaga solo al quedar quieta. */
if (escena) escena.style.transition = 'none';
function updateParallax() {
  currentRotX += (targetRotX - currentRotX) * 0.1; currentRotY += (targetRotY - currentRotY) * 0.1;
  if (Math.abs(targetRotX - currentRotX) < 0.05 && Math.abs(targetRotY - currentRotY) < 0.05) { currentRotX = targetRotX; currentRotY = targetRotY; parallaxRun = false; }
  if (escena) escena.style.transform = `rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg)`;
  if (parallaxRun) requestAnimationFrame(updateParallax);
}
function wakeParallax() { if (!parallaxRun && escena && !REDUCE_MOTION) { parallaxRun = true; requestAnimationFrame(updateParallax); } }

window.addEventListener('mousemove', (e) => { if (TOUCH_UI) return; const cx = window.innerWidth/2; const cy = window.innerHeight/2; targetRotY = ((e.clientX-cx)/cx)*22; targetRotX = -((e.clientY-cy)/cy)*18; wakeParallax(); });
/* En celular la inclinación es más suave (antes llegaba a 25°, y al deslizar para pasar de página la tarjeta se torcía) y vuelve al centro al soltar el dedo */
window.addEventListener('touchmove', (e) => { if(e.touches.length>0){ const touch = e.touches[0]; const cx = window.innerWidth/2; const cy = window.innerHeight/2; targetRotY = ((touch.clientX-cx)/cx)*9; targetRotX = -((touch.clientY-cy)/cy)*7; wakeParallax(); }}, { passive: true });
const _reposo = () => { targetRotX = 0; targetRotY = 0; wakeParallax(); };
window.addEventListener('touchend', _reposo, { passive: true }); window.addEventListener('touchcancel', _reposo, { passive: true });


/* ===== v22 · Apertura cinemática del candado =====
   Llamar a abrirCandado() en el punto EXACTO donde tu validación confirma la clave correcta.
   - Agrega .candado-abierto al candado (grillete sube y gira, candado se desvanece, mensaje entra con fade-up; todo lo anima el CSS).
   - Devuelve una Promesa que se resuelve cuando termina la secuencia (~1.6 s), por si quieres encadenar algo después.
   - Es idempotente: si ya está abierto, no repite nada.
   Para clave incorrecta: sacudirCandado(). */
const CANDADO_SECUENCIA_MS = 1600;   /* grillete .8s + fade con retraso .6s + mensaje (.85s + .7s) */

function _getCandado(sel) {
  return document.querySelector(sel || '#candado') || document.querySelector('.candado');
}

function abrirCandado(sel) {
  const candado = _getCandado(sel);
  if (!candado || candado.classList.contains('candado-abierto')) return Promise.resolve(false);

  candado.classList.remove('candado-error');
  candado.classList.add('candado-abierto');
  candado.setAttribute('aria-label', 'Mensaje secreto desbloqueado');

  /* el sonido de campanitas coincide con la entrada del mensaje */
  setTimeout(() => { try { playChimeSound(); } catch (e) {} }, 850);

  return new Promise((resolve) => {
    setTimeout(() => {
      candado.dispatchEvent(new CustomEvent('candado:revelado', { bubbles: true }));
      resolve(true);
    }, CANDADO_SECUENCIA_MS);
  });
}

function sacudirCandado(sel) {
  const candado = _getCandado(sel);
  if (!candado || candado.classList.contains('candado-abierto')) return;
  candado.classList.remove('candado-error');
  void candado.offsetWidth;                      /* reinicia la animación si se repite el error */
  candado.classList.add('candado-error');
  setTimeout(() => candado.classList.remove('candado-error'), 450);
}

window.abrirCandado = abrirCandado;
window.sacudirCandado = sacudirCandado;
