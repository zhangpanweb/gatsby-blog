#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const moment = require('moment');

const name = process.argv[2];
const postDic = path.resolve(__dirname, '../posts');

/** get new post's name */
const existedPosts =
  fs.readdirSync(postDic)
    .filter(file => /^[0-9]*$/.test(file[0]))
    .sort((a, b) => b.split('-')[0] - a.split('-')[0]);
const currentPostIndex = existedPosts[0].split('-')[0];
const newPostIndex = parseInt(currentPostIndex, 10) + 1;
const newPostDicName = `${newPostIndex}-${name}`;

/** create dictionary and files */
const newPostDicPath = `${postDic}/${newPostDicName}`;
if (!fs.existsSync(newPostDicPath)) {
  fs.mkdirSync(newPostDicPath);
}

/** create post file and write front matter into it */
const newPostPath = `${newPostDicPath}/${name}.md`;
const content =`---
title: "${name}"
date: "${moment().format('YYYY-MM-DD')}"
description: ""
---
`;

fs.writeFile(newPostPath, content, (error) => {
  if (error) console.error('fail to create new post. error:', e);
  else console.log('successful to create new post')
})

