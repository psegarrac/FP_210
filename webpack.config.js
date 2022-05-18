const path = require("path");
const NodemonPlugin = require("nodemon-webpack-plugin");
const Dotenv = require("dotenv-webpack");

module.exports = {
  entry: ["./src/js/index.js"],
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "public"),
    library: "Conquer",
  },
  plugins: [new NodemonPlugin(), new Dotenv()],
  module: {
    rules: [],
  },
  devtool: "source-map",
  mode: "development",
};
