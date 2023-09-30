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
        use: [{ loader: 'ts-loader' }]
      }]
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.css', '.js', '.jsx'],
    },
    output: {
      path: __dirname + '/dist',
      filename: "renderer.js",
      publicPath: "/"
    }
  },
  {
    stats: 'minimal',
    resolve:{
      extensions: ['.ts', '.js'],
      alias: {
        'iconv-lite': false
      }
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
      filename: 'index.js'
    }
  }
];
