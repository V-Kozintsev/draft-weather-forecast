const path = require("path");

const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.jsx",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    clean: true, // Очищает output папку перед новым сборкой
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "public/index.html",
    }),
  ],
  externalsType: "script",
  externals: {
    ymaps3: [
      "https://api-maps.yandex.ru/v3/?apikey=b053285a-f157-45bf-9726-cec55b7deb89&lang=ru_RU",
      "ymaps3",
    ],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/, // Исключить папку node_modules
        use: {
          loader: "babel-loader", // Используем babel-loader для обработки JS
        },
      },
      {
        test: /\.css$/, // Регулярное выражение для нахождения файлов .css
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/, // Для обработки изображений и шрифтов
        type: "asset/resource", // Webpack 5 использует asset module
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    compress: true, // Включает сжатие
    port: 9000, // Порт для dev server
    open: true, // Автоматически открывает браузер
  },
  resolve: {
    extensions: [".js", ".jsx", ".css"], // Автоматическое добавление расширений
  },
};
