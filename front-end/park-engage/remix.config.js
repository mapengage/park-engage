module.exports = {
  serverBuildTarget: "node-cjs",
  server: "./server.js",
  publicRuntimeConfig: {
    SERVER_ENDPOINT: process.env.SERVER_ENDPOINT,
  },
};
