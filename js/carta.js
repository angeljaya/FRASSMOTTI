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
let targetRotX = 0, targetRotY = 0, currentRotX = 0, currentRotY = 0;

function updateParallax() {
  currentRotX += (targetRotX - currentRotX) * 0.08; currentRotY += (targetRotY - currentRotY) * 0.08;
  escena.style.transform = `rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;
  requestAnimationFrame(updateParallax);
}
requestAnimationFrame(updateParallax);

window.addEventListener('mousemove', (e) => { const cx = window.innerWidth/2; const cy = window.innerHeight/2; targetRotY = ((e.clientX-cx)/cx)*22; targetRotX = -((e.clientY-cy)/cy)*18; });
window.addEventListener('touchmove', (e) => { if(e.touches.length>0){ const touch = e.touches[0]; const cx = window.innerWidth/2; const cy = window.innerHeight/2; targetRotY = ((touch.clientX-cx)/cx)*25; targetRotX = -((touch.clientY-cy)/cy)*20; }});
