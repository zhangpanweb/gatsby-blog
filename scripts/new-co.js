#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const moment = require('moment');

const name = process.argv[2];
const collectionsDic = path.resolve(__dirname, '../collections');
const newDic = `${collectionsDic}/${name}`;

if (!fs.existsSync(newDic)) {
  fs.mkdirSync(newDic);
} else {
  console.log(`The colleciton '${name}' has existed.`);
  process.exit();
}

const newFilePath = `${newDic}/${name}.md`;
const content = `---
date: "${moment().format('YYYY-MM-DD')}"
---
`;

fs.writeFile(newFilePath, content, (error) => {
  if (error) console.error('fail to create new post. error:', e);
  else console.log('successful to create new post')
})

