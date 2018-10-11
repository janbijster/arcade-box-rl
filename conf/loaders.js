module.exports = [
  {
    test: /\.js$/,
    exclude: /node_modules/,
    loaders: ["babel"]
  },
  {
    test: /\.json$/,
    loader: 'json-loader'
  }
];
