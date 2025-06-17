const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public');

async function compressImage(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();

    let pipeline = sharp(filePath).resize({ width: 1000 });

    if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ quality: 80 });
    } else if (ext === '.png') {
      pipeline = pipeline.png({ compressionLevel: 8 });
    } else {
      // Skip other formats
      return;
    }

    await pipeline.toFile(filePath + '.tmp'); // write to temp file
    await fs.promises.rename(filePath + '.tmp', filePath); // replace original

    console.log(`Compressed ${filePath}`);
  } catch (err) {
    console.error(`Error compressing ${filePath}:`, err);
  }
}

async function compressAllImages() {
  const files = await fs.promises.readdir(dir);
  for (const file of files) {
    if (/\.(jpg|jpeg|png)$/i.test(file)) {
      await compressImage(path.join(dir, file));
    }
  }
  console.log('Done compressing images.');
}

compressAllImages();
