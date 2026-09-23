import fs from 'fs';
import path from 'path';

// Helper to generate minimal valid 1x1 or raw PNG buffer with RGBA
// We will generate cleanly encoded PNG buffers directly for 192x192, 512x512, and 180x180
// Using pure node zlib and standard PNG chunk writer
import zlib from 'zlib';

function createPngBuffer(width: number, height: number, r: number, g: number, b: number) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth: 8
  ihdrData.writeUInt8(6, 9); // color type: 6 (RGBA)
  ihdrData.writeUInt8(0, 10); // compression method: 0
  ihdrData.writeUInt8(0, 11); // filter method: 0
  ihdrData.writeUInt8(0, 12); // interlace method: 0

  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw image data with filter byte 0 at start of each scanline
  const scanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(scanlineLength * height);

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = width * 0.42;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter type None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        // Gold / Amber deity icon circle
        const ratio = 1 - dist / radius;
        rawData[pxOffset] = Math.min(255, Math.floor(r * (0.8 + 0.3 * ratio)));
        rawData[pxOffset + 1] = Math.min(255, Math.floor(g * (0.8 + 0.3 * ratio)));
        rawData[pxOffset + 2] = Math.min(255, Math.floor(b * (0.8 + 0.3 * ratio)));
        rawData[pxOffset + 3] = 255;
      } else {
        // Deep obsidian background
        rawData[pxOffset] = 10;
        rawData[pxOffset + 1] = 10;
        rawData[pxOffset + 2] = 12;
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressedData);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type: string, data: Buffer): Buffer {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);

  const crcTarget = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = crc32(crcTarget);
  buf.writeUInt32BE(crc >>> 0, 8 + len);
  return buf;
}

// Standard CRC32 table
const crcTable: number[] = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ 0xffffffff;
}

// Generate PNG assets
const publicDir = path.resolve(process.cwd(), 'public');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPngBuffer(192, 192, 245, 158, 11));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPngBuffer(512, 512, 245, 158, 11));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPngBuffer(512, 512, 217, 119, 6));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPngBuffer(180, 180, 245, 158, 11));

console.log('PWA PNG icons generated successfully!');
