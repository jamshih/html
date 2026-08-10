(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.HearframeAICore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function roundSec(value) {
    return Math.round(Number(value) * 1000) / 1000;
  }

  function signedMs(value) {
    const n = Math.round(Number(value));
    return n === 0 ? '0' : n > 0 ? `+${n}` : String(n);
  }

  function makeCandidateGrid(center, deltasMs, minDurationSec = 0.06, prefix = 'c') {
    const seen = new Set();
    const candidates = [];
    for (const startDeltaMs of deltasMs) {
      for (const endDeltaMs of deltasMs) {
        const start = roundSec(center.start + Number(startDeltaMs) / 1000);
        const end = roundSec(center.end + Number(endDeltaMs) / 1000);
        if (start < 0 || end - start < minDurationSec) continue;
        const key = `${start.toFixed(3)}:${end.toFixed(3)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        candidates.push({
          id: `${prefix}-s${signedMs(startDeltaMs)}-e${signedMs(endDeltaMs)}`,
          start,
          end,
          startDeltaMs: Number(startDeltaMs),
          endDeltaMs: Number(endDeltaMs),
        });
      }
    }
    return candidates;
  }

  function mergeFloat32(chunks) {
    const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const out = new Float32Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      out.set(chunk, offset);
      offset += chunk.length;
    }
    return out;
  }

  // Each block is timestamped against media currentTime at the moment the WebAudio block is delivered.
  // We slice only the samples whose estimated media time overlaps [startSec, endSec].
  function sliceCapturedBlocks(blocks, startSec, endSec, sampleRate) {
    if (!(endSec > startSec) || !(sampleRate > 0)) return new Float32Array();
    const pieces = [];
    for (const block of blocks) {
      if (!block || !(block.data instanceof Float32Array)) continue;
      const blockStart = Number(block.mediaStart);
      const blockEnd = Number(block.mediaEnd);
      if (!(blockEnd > blockStart)) continue;
      const overlapStart = Math.max(startSec, blockStart);
      const overlapEnd = Math.min(endSec, blockEnd);
      if (!(overlapEnd > overlapStart)) continue;
      const duration = blockEnd - blockStart;
      const first = Math.max(0, Math.min(block.data.length, Math.floor(((overlapStart - blockStart) / duration) * block.data.length)));
      const last = Math.max(first, Math.min(block.data.length, Math.ceil(((overlapEnd - blockStart) / duration) * block.data.length)));
      if (last > first) pieces.push(block.data.slice(first, last));
    }
    const merged = mergeFloat32(pieces);
    const desired = Math.max(1, Math.round((endSec - startSec) * sampleRate));
    if (merged.length === desired) return merged;
    if (merged.length > desired) return merged.slice(0, desired);
    const padded = new Float32Array(desired);
    padded.set(merged, 0);
    return padded;
  }

  function rms(samples) {
    if (!samples || samples.length === 0) return 0;
    let sum = 0;
    for (let i = 0; i < samples.length; i += 1) sum += samples[i] * samples[i];
    return Math.sqrt(sum / samples.length);
  }

  function encodeMonoWav(samples, sampleRate) {
    const frames = samples.length;
    const buffer = new ArrayBuffer(44 + frames * 2);
    const view = new DataView(buffer);
    const writeAscii = (offset, text) => {
      for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i));
    };
    writeAscii(0, 'RIFF');
    view.setUint32(4, 36 + frames * 2, true);
    writeAscii(8, 'WAVE');
    writeAscii(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeAscii(36, 'data');
    view.setUint32(40, frames * 2, true);
    for (let i = 0; i < frames; i += 1) {
      const value = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(44 + i * 2, value < 0 ? value * 0x8000 : value * 0x7fff, true);
    }
    return buffer;
  }

  function candidateById(candidates, id) {
    return candidates.find((candidate) => candidate.id === id) || null;
  }

  function backendBase(value) {
    return String(value || '').trim().replace(/\/+$/, '');
  }

  return {
    roundSec,
    signedMs,
    makeCandidateGrid,
    sliceCapturedBlocks,
    rms,
    encodeMonoWav,
    candidateById,
    backendBase,
  };
});
