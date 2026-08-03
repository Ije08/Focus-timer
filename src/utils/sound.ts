let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

function playTone(freq: number, type: OscillatorType, duration: number, vol: number, startTimeOffset: number) {
  try {
    const ctx = initAudio();
    const startTime = ctx.currentTime + startTimeOffset;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    
    // Envelope for a soft chime sound
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(vol, startTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  } catch (error) {
    console.error("Audio play failed:", error);
  }
}

export const playStartSound = () => {
  // Soft, rising gentle chime
  playTone(523.25, 'sine', 0.6, 0.15, 0);       // C5
  playTone(659.25, 'sine', 0.8, 0.15, 0.1);     // E5
};

export const playEndSound = () => {
  // Resonant, bright completion chime
  playTone(880.00, 'sine', 1.0, 0.15, 0);       // A5
  playTone(1108.73, 'sine', 1.5, 0.15, 0.1);    // C#6
  playTone(1318.51, 'sine', 2.0, 0.15, 0.2);    // E6
};
