// Short two-note chime for a new admin notification — generated with the
// Web Audio API instead of shipping an audio file, so there's nothing to
// source/host/license.
//
// Browsers suspend a fresh AudioContext until the page has seen at least
// one user gesture (click/keypress/etc) — a notification that arrives
// before the admin has interacted with the tab at all simply won't be
// audible yet, which is a browser autoplay-policy limit, not a bug here.
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  const AudioContextCtor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextCtor) return null;

  audioContext ??= new AudioContextCtor();

  return audioContext;
}

function playTone(ctx: AudioContext, frequency: number, startTime: number, duration: number) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  // Quick fade in/out so each note clicks instead of popping.
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

export function playNotificationSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    const now = ctx.currentTime;
    playTone(ctx, 880, now, 0.12);
    playTone(ctx, 1175, now + 0.1, 0.15);
  } catch {
    // Best-effort — a blocked/unsupported AudioContext should never break
    // the toast itself.
  }
}
