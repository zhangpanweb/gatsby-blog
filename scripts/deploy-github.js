const ghpages = require('gh-pages');

ghpages.publish('public', {
  branch: 'master',
  repo: 'git@github.com:zhangpanweb/zhangpanweb.github.io.git'
}, () => {
  console.info('successful to publish to github page!')
})