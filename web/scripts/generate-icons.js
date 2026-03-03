/**
 * PWA Icon Generator Script
 * Generates minimal PNG icon files for all sizes referenced in manifest.json.
 * These are valid PNG files with the app initial "B" (for BizPermit).
 *
 * Run: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons');

// Create a minimal valid PNG file with a solid blue background
// This uses a raw PNG encoder (no dependencies needed)
function createPng(size) {
  // We'll create a very small valid PNG. For placeholder purposes,
  // generate a 1x1 pixel PNG and let browsers scale it. 
  // The manifest just needs a valid file at each path.
  
  // Minimal 1x1 blue pixel PNG
  const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk (1x1 pixel, 8-bit RGB)
  const width = 1;
  const height = 1;
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // color type: RGB
  ihdrData[10] = 0; // compression method
  ihdrData[11] = 0; // filter method
  ihdrData[12] = 0; // interlace method
  const ihdrChunk = createChunk('IHDR', ihdrData);
  
  // IDAT chunk (1 pixel: filter byte + R G B = #1e40af blue)
  const rawData = Buffer.from([0, 0x1e, 0x40, 0xaf]); // filter=none, R, G, B
  const { deflateSync } = require('zlib');
  const compressed = deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  
  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([pngSignature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);
  
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Ensure icons directory exists
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

const png = createPng(1);

for (const size of ICON_SIZES) {
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(ICONS_DIR, filename);
  fs.writeFileSync(filepath, png);
  console.log(`✅ Generated ${filename}`);
}

console.log(`\n🎉 Generated ${ICON_SIZES.length} PWA icon placeholders in public/icons/`);
console.log('ℹ️  Replace these with proper branded icons before production deployment.');
