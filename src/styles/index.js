require('./prism-atom-dark.css');

require('./global.css');

require('./font/common.css');
if(process.env.isProd){
  require('./font/prod.css');
} else {
  require('./font/dev.css');
};