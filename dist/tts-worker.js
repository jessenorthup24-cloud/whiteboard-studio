// Kokoro text-to-speech, run in a worker so the editor stays responsive. The model (Kokoro-82M, Apache 2.0) downloads
// from Hugging Face on first use, about 92 MB in its 8-bit form, and the browser caches it for later visits.
// Messages in: {id, text, voice, speed}. Out: {type:'progress', ...} while loading, then {id, type:'done', samples, rate}
// or {id, type:'error', message}.
import { KokoroTTS } from 'https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/dist/kokoro.web.js';

const MODEL = 'onnx-community/Kokoro-82M-v1.0-ONNX';
let loading = null;
const model = () => loading ??= KokoroTTS.from_pretrained(MODEL, {
  dtype: 'q8',
  device: 'wasm',
  progress_callback: p => self.postMessage({ type: 'progress', status: p.status, file: p.file, loaded: p.loaded, total: p.total, progress: p.progress }),
}).catch(e => { loading = null; throw e; });

// Long scripts are spoken sentence by sentence and joined with short pauses, which keeps each piece within the model's
// input limit and gives natural breaks.
function sentences(text) {
  return (String(text).replace(/\s+/g, ' ').match(/[^.!?…]+[.!?…]+["')\]]*|[^.!?…]+$/g) || []).map(s => s.trim()).filter(Boolean);
}

self.onmessage = async ({ data }) => {
  const { id, text, voice, speed } = data;
  try {
    const tts = await model();
    self.postMessage({ type: 'progress', status: 'ready' });
    const parts = [], pieces = sentences(text);
    let rate = 24000, total = 0;
    for (let i = 0; i < pieces.length; i++) {
      const audio = await tts.generate(pieces[i], { voice, speed });
      rate = audio.sampling_rate; parts.push(audio.audio); total += audio.audio.length;
      if (i < pieces.length - 1) { const gap = new Float32Array(Math.round(rate * .28)); parts.push(gap); total += gap.length; }
      self.postMessage({ type: 'progress', status: 'speaking', done: i + 1, of: pieces.length });
    }
    const samples = new Float32Array(total);
    let at = 0; for (const p of parts) { samples.set(p, at); at += p.length; }
    self.postMessage({ id, type: 'done', samples, rate }, [samples.buffer]);
  } catch (e) {
    self.postMessage({ id, type: 'error', message: String(e?.message || e) });
  }
};
