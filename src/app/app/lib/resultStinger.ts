/** Short synthesized stingers (no audio assets). Skips if AudioContext unavailable. */

export function playResultStinger(won: boolean) {
  if (typeof window === "undefined") return;
  const AC =
    window.AudioContext ||
    (
      window as unknown as {
        webkitAudioContext?: typeof AudioContext;
      }
    ).webkitAudioContext;
  if (!AC) return;

  const ctx = new AC();
  const master = ctx.createGain();
  master.gain.value = 0.12;
  master.connect(ctx.destination);

  const now = ctx.currentTime;
  const tone = (freq: number, t0: number, dur: number, vol: number) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  };

  if (won) {
    tone(523.25, now, 0.12, 0.9);
    tone(659.25, now + 0.1, 0.12, 0.85);
    tone(783.99, now + 0.2, 0.22, 0.8);
  } else {
    tone(392, now, 0.18, 0.85);
    tone(311.13, now + 0.16, 0.28, 0.75);
    tone(246.94, now + 0.32, 0.35, 0.65);
  }

  void ctx.resume().catch(() => {});
  window.setTimeout(() => {
    void ctx.close().catch(() => {});
  }, 1200);
}
