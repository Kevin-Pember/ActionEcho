const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode:"production",
  context: path.resolve(__dirname,"src"),
  entry: {
    index: "./JS/index.js",
    siteWorker: "./JS/siteWorker.js",
    background: "./JS/background.js",
    components: "./JS/components.js"
  },
  output:{
    path: path.join(__dirname,"dist/JS/"),
    filename: '[name].bundle.js'
  },
  plugin:[
    new CopyPlugin({
      context: path.resolve(__dirname,"src"),
      patterns: [
        {from:"public", to:"dist/public"},
        {from:"index.html", to:"dist"},
        {from:"LICENSE.txt", to: "dist"},
        {from:"manifest.json", to: "dist"}
      ]
    })
  ]
  /*{
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
},*/

};