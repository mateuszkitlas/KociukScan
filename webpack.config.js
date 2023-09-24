const HtmlWebpackPlugin = require("html-webpack-plugin")
module.exports = [
  {
    stats: 'minimal',
    mode: 'development',
    entry: './src/frontend/index.tsx',
    target: 'electron-renderer',
    devtool: 'source-map',
    module: {
      rules: [{
        test: /\.ts(x?)$/,
        include: /src/,
        use: [{ loader: 'ts-loader' }]
      }, {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },]
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.css', '.js', '.jsx'],
      alias: {
        'sharp': false,
        "pdfkit": false
      },
    },
    output: {
      path: __dirname + '/dist',
      filename: 'frontend.js'
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: __dirname + '/static/index.html'
      })
    ]
  },
  {
    stats: 'minimal',
    resolve:{
      extensions: ['.ts', '.js'],
      alias: {
        'iconv-lite': false
      },/*
      fallback: {
        // crypto module is not necessary at browser
        //crypto: false,
        // fallbacks for native node libraries
        buffer: require.resolve('buffer/'),
        stream: require.resolve('readable-stream'),
        zlib: require.resolve('browserify-zlib'),
        util: require.resolve('util/'),
        assert: require.resolve('assert/')
      }*/
    },
    mode: 'development',
    entry: './src/backend/index.ts',
    target: 'electron-main',
    module: {
      rules: [{
        test: /\.ts$/,
        include: /src/,
        use: [{ loader: 'ts-loader' }]
      }]
    },
    externals: {
      'sharp': 'commonjs sharp'
    },
    output: {
      path: __dirname + '/dist',
      filename: 'backend.js'
    }
  }
];
