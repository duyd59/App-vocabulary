// Audio utility supporting Gemini TTS (/api/vocabulary/tts) with Web Speech API (ko-KR) fallback

let sharedAudioCtx: AudioContext | null = null;
const ttsCache = new Map<string, AudioBuffer>();

function getAudioContext(): AudioContext {
  if (!sharedAudioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedAudioCtx = new AudioCtx({ sampleRate: 24000 });
  }
  if (sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
}

function decodePCM24k(base64Data: string, ctx: AudioContext): AudioBuffer {
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const int16 = new Int16Array(bytes.buffer, 0, Math.floor(bytes.byteLength / 2));
  const audioBuffer = ctx.createBuffer(1, int16.length, 24000);
  const channelData = audioBuffer.getChannelData(0);
  for (let i = 0; i < int16.length; i++) {
    channelData[i] = int16[i] / 32768.0;
  }
  return audioBuffer;
}

function speakWithBrowserSpeech(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    utterance.rate = 0.92;
    const voices = window.speechSynthesis.getVoices();
    const koreanVoice = voices.find((v) => v.lang.includes("ko") || v.lang.includes("KR"));
    if (koreanVoice) {
      utterance.voice = koreanVoice;
    }
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

export async function playKoreanAudio(
  text: string,
  useAiVoice: boolean = false
): Promise<void> {
  if (!text.trim()) return;

  if (!useAiVoice) {
    await speakWithBrowserSpeech(text);
    return;
  }

  try {
    const ctx = getAudioContext();
    const cached = ttsCache.get(text);
    if (cached) {
      const source = ctx.createBufferSource();
      source.buffer = cached;
      source.connect(ctx.destination);
      source.start();
      return;
    }

    const res = await fetch("/api/vocabulary/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      await speakWithBrowserSpeech(text);
      return;
    }

    const data = await res.json();
    if (!data?.audioBase64) {
      await speakWithBrowserSpeech(text);
      return;
    }

    const audioBuffer = decodePCM24k(data.audioBase64, ctx);
    ttsCache.set(text, audioBuffer);
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.start();
  } catch {
    await speakWithBrowserSpeech(text);
  }
}
