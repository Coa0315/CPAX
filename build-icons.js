import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Recursive directory lister to find files
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === '.next' || file === 'dist') continue;
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      findFiles(name, fileList);
    } else {
      fileList.push(name);
    }
  }
  return fileList;
}

async function generateIcons() {
  console.log('--- RECURSIVE FILE LISTING ---');
  try {
    const allFiles = findFiles('.');
    console.log('Found files:', allFiles);
    fs.writeFileSync('./found-files.txt', allFiles.join('\n'));
  } catch (e) {
    console.error('Error finding files:', e);
    fs.writeFileSync('./found-files.txt', 'Error: ' + e.message);
  }
  console.log('-------------------------------');

  const svgPath = path.resolve('./cpax_logo.svg');
  const publicDir = path.resolve('./public');

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log('Created public directory');
  }

  // Copy SVG logo to public directory so it remains available
  fs.copyFileSync(svgPath, path.join(publicDir, 'cpax_logo.svg'));
  console.log('Copied cpax_logo.svg to public/cpax_logo.svg');

  try {
    // Generate Apple Touch Icon (180x180 PNG)
    await sharp(svgPath)
      .resize(180, 180)
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('Generated apple-touch-icon.png (180x180)');

    // Generate PWA Icon (192x192 PNG)
    await sharp(svgPath)
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, 'cpax_logo_192.png'));
    console.log('Generated cpax_logo_192.png');

    // Generate PWA Icon (512x512 PNG)
    await sharp(svgPath)
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'cpax_logo_512.png'));
    console.log('Generated cpax_logo_512.png');

    // Generate Favicon PNG (32x32 PNG)
    await sharp(svgPath)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon.png'));
    console.log('Generated favicon.png (32x32)');

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons with sharp:', error);
  }
}

generateIcons();
