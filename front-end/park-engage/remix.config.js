module.exports = {
  serverBuildTarget: "node-cjs",
  server: `./server.js:${process.env.PORT || 5173}`, // Use PORT env variable or default to 3000
  publicRuntimeConfig: {
    SERVER_ENDPOINT: process.env.SERVER_ENDPOINT,
  },
};