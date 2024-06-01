const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode:"production",
  context: path.resolve(__dirname,"src"),
  entry: {
    index: "./JS/index.js",
    siteWorker: "./JS/siteWorker.js",
    background: "./JS/background.js",
    components: "./JS/components.js",
    firebaseConfig: "./JS/firebaseConfig.js"
  },
  output:{
    path: path.join(__dirname,"dist"),
    filename: 'JS/[name].js'
  },
  plugins:[
    new CopyPlugin({
      patterns: [
        {from:"public", to:"public"},
        {from:"index.html", to:""},
        {from:"LICENSE.txt", to: ""},
        {from:"manifest.json", to: ""},
        {from:"./JS/webcomponents.bundle.js", to: "JS/"}
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