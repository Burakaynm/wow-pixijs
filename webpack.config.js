const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const package = require("./package.json");
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


module.exports = {
  entry: "./src/index.js",
  resolve: {
    extensions: [".js"],
    alias: {
      "@assets": path.resolve(__dirname, "./public/assets"),
    },
    fallback: { path: false },
  },
  experiments: {
    topLevelAwait: true,
  },
  mode: "development",
  //   devtool: "inline-source-map",
  module: {
    rules: [

    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "./public"),
      watch: true,
    },
    open: true,
    port: 8008,
  },


  optimization: {
    minimize: true,
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          enforce: true,
          chunks: "initial",
        },
      },
    },
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name].[chunkhash].js",
    chunkFilename: "[name].[chunkhash].js",
    clean: true,
  },
  devServer: {
    static: path.resolve(__dirname, "./dist"),
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "public/assets",
          to: "assets/",
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "./public/index.html"),
      filename: "index.html",
      title: package.description,
      inject: "body",
      hot: true,
    }),
    //  new BundleAnalyzerPlugin()
  ],
};
