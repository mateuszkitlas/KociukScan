module.exports = {
  webpack: {
      configure: {
          target: 'electron-renderer'
      }
  },
  babel: {
    presets: [
      ["@babel/preset-typescript", { allowNamespaces: true }],
    ],
  },
};