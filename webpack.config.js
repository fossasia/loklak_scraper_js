var fs = require('fs');

function listScrapers() {
    var src = "./scrapers/"
    var files = {};
    fs.readdirSync(src).forEach(function(data) {
        var entryName = data.substr(0, data.indexOf("."));
        files[entryName] = src+data;
    });
    return files;
}

module.exports = {
  entry: listScrapers(),
  target: "node",
  module: {
      loaders: [
          {
              loader: "babel-loader",
              test: /\.js?$/,
              query: {
                  presets: ["es2015"],
              }
          },
      ]
  },
  output: {
    path: __dirname + '/build',
    filename: '[name].js',
    libraryTarget: 'var',
    library: '[name]',
  }
};
