#!/usr/bin/env node

const fs = require('fs');
const Fontmin = require('fontmin');

const POSTS_DIC = './posts';
const FONT_PATH = './src/fonts/FZSHJW.ttf';
const OUTPUT_PATH = './src/fonts/minified-fonts/';

function getAllFilenames(dic) {
  let filePaths = [];
  const levelOneFiles = fs.readdirSync(dic);
  levelOneFiles.forEach(file => {
    const path = `${dic}/${file}`;
    if (fs.lstatSync(path).isDirectory()) {
      const lowerFilenames = getAllFilenames(path);
      filePaths = filePaths.concat(lowerFilenames);
    } else {
      filePaths = filePaths.concat(path);
    }

  })
  return filePaths;
}


function isMdFile(file) {
  const fileSplit = file.split('.');
  return fileSplit[fileSplit.length - 1] === 'md';
}

function getAllPostsContent() {
  const filePaths = getAllFilenames(POSTS_DIC);

  let allContent = '';
  filePaths.forEach(filePath => {
    if (isMdFile(filePath)) {
      const content = fs.readFileSync(filePath).toString('utf-8');
      allContent += content;
    }
  })

  return allContent;
}

function minifyFont({ fontPath, textContent, outputPath }, callback) {
  const fontmin = new Fontmin()
    .src(fontPath)
    .use(Fontmin.glyph({
      text: textContent,
      hinting: false
    }))
    .dest(outputPath);

  fontmin.run(callback);
}

const allcontents = getAllPostsContent();
minifyFont({
  fontPath: FONT_PATH,
  textContent: allcontents,
  outputPath: OUTPUT_PATH
}, (error, files) => {
  if (error) {
    console.log('minifying font error:', error);
  }
  console.log('minifying font has been successful!')
})