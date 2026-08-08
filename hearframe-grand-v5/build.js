const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');

const root = __dirname;
const dist = path.join(root, 'dist');
const pub = path.join(root, 'public');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
fs.copyFileSync(path.join(pub, 'index.html'), path.join(dist, 'index.html'));

const UA = 'Mozilla/5.0 HearframeBuild/1.0';
const SOURCES = {
  obama: [
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/2/23/20170110_President_Obama_Farewell_Speech_HD.webm/20170110_President_Obama_Farewell_Speech_HD.webm.360p.vp9.webm',
    'https://upload.wikimedia.org/wikipedia/commons/2/23/20170110_President_Obama_Farewell_Speech_HD.webm'
  ],
  jfk: [
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/7/74/John_F._Kennedy_Inauguration_Speech.ogv/John_F._Kennedy_Inauguration_Speech.ogv.360p.vp9.webm',
    'https://upload.wikimedia.org/wikipedia/commons/7/74/John_F._Kennedy_Inauguration_Speech.ogv'
  ]
};

function run(args, label) {
  console.log(`\n[ffmpeg] ${label}`);
  const r = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'warning', '-y', ...args], {
    cwd: dist,
    stdio: 'inherit'
  });
  return r.status === 0;
}

function encodeRemoteContext(label, urls, start, duration, output) {
  for (const url of urls) {
    const common = [
      '-ss', String(start),
      '-user_agent', UA,
      '-i', url,
      '-t', String(duration),
      '-map', '0:v:0', '-map', '0:a:0?',
      '-vf', "scale='min(640,iw)':-2",
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23',
      '-profile:v', 'baseline', '-level', '3.0', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '128k', '-ac', '2', '-ar', '44100',
      '-movflags', '+faststart',
      output
    ];
    if (run(common, `${label} from ${url}`)) return url;
    console.warn(`[ffmpeg] ${label} failed with source, trying fallback: ${url}`);
  }
  throw new Error(`${label} could not be generated from any source`);
}

function preciseCut(input, start, duration, output, label) {
  const args = [
    '-ss', String(start), '-i', input, '-t', String(duration),
    '-map', '0:v:0', '-map', '0:a:0?',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21',
    '-profile:v', 'baseline', '-level', '3.0', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '128k', '-ac', '2', '-ar', '44100',
    '-movflags', '+faststart', output
  ];
  if (!run(args, label)) throw new Error(`${label} failed`);
}

const obamaSource = encodeRemoteContext('Obama context', SOURCES.obama, 1.10, 1.60, 'hello-context.mp4');
const jfkSource = encodeRemoteContext('JFK context', SOURCES.jfk, 120.90, 1.75, 'world-context.mp4');

// Source subtitle evidence:
// Obama cue “Hello, Chicago!” starts at source 1.468 s. Context starts at 1.10 -> relative 0.368 s.
// JFK cue “The world is very different now” starts at source 121.192 s. Context starts at 120.90.
// The word-level end/start offsets remain POC calibration values; the browser can nudge them on tiny local MP4s.
const defaults = {
  hello: { start: 0.368, end: 0.735 },
  world: { start: 0.460, end: 0.900 }
};

preciseCut('hello-context.mp4', defaults.hello.start, defaults.hello.end - defaults.hello.start, 'hello-default.mp4', 'Precise HELLO default');
preciseCut('world-context.mp4', defaults.world.start, defaults.world.end - defaults.world.start, 'world-default.mp4', 'Precise WORLD default');

fs.writeFileSync(path.join(dist, 'concat.txt'), "file 'hello-default.mp4'\nfile 'world-default.mp4'\n");
if (!run(['-f', 'concat', '-safe', '0', '-i', 'concat.txt', '-c', 'copy', '-movflags', '+faststart', 'hello-world-default.mp4'], 'Render patched Hello World')) {
  throw new Error('Default patched video concat failed');
}
fs.unlinkSync(path.join(dist, 'concat.txt'));

fs.writeFileSync(path.join(dist, 'build-info.json'), JSON.stringify({
  builtAt: new Date().toISOString(),
  obamaSource,
  jfkSource,
  contexts: { helloStart: 1.10, worldStart: 120.90 },
  defaults
}, null, 2));

console.log('\nHearframe v5 media build complete.');
