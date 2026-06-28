const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const selectedDir = path.join(root, 'selected');
const dataDir = path.join(root, 'article_materials', 'prompt_data');
const libraryImagesDir = path.join(root, 'library', 'images');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

function main() {
  const selectedImages = fs.existsSync(selectedDir)
    ? fs.readdirSync(selectedDir).filter((name) => /\.(png|jpe?g|webp)$/i.test(name)).sort()
    : [];
  const items = fs.readdirSync(dataDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => readJson(path.join(dataDir, file)))
    .sort((a, b) => a.noteOrder - b.noteOrder);

  const issues = [];
  for (const item of items) {
    if (!item.libraryImageFile) issues.push({ id: item.id, issue: 'missing libraryImageFile' });
    else if (!fs.existsSync(path.join(libraryImagesDir, item.libraryImageFile))) issues.push({ id: item.id, issue: 'library image missing' });
    for (const field of ['articleThemes', 'camera', 'lightingClass', 'technique', 'motionTags']) {
      if (!Array.isArray(item[field]) || item[field].length === 0) issues.push({ id: item.id, issue: `missing ${field}` });
    }
  }

  console.log(JSON.stringify({
    selectedImages: selectedImages.length,
    promptItems: items.length,
    libraryImages: fs.existsSync(libraryImagesDir) ? fs.readdirSync(libraryImagesDir).filter((name) => /\.(png|jpe?g|webp)$/i.test(name)).length : 0,
    canDeleteSelected: selectedImages.length > 0 && issues.length === 0,
    issues
  }, null, 2));
}

main();
