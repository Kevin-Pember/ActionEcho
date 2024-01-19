const path = require('path');

module.exports = [{
  entry: './dev/js/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist/JS'),
  },
}, 
{
    entry: './dev/js/components.js',
    output: {
      filename: 'components.js',
      path: path.resolve(__dirname, 'dist/JS'),
    },
  }, 
{
    entry: './dev/js/background.js',
    output: {
      filename: 'background.js',
      path: path.resolve(__dirname, 'dist/JS'),
    },
},
{
    entry: './dev/js/inject.js',
    output: {
      filename: 'inject.js',
      path: path.resolve(__dirname, 'dist/JS'),
    },
}
];