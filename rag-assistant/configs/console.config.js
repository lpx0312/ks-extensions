module.exports = {
  server: {
    apiServer: {
      url: process.env.API_SERVER_URL || 'http://localhost:8000',
      wsUrl: process.env.WS_SERVER_URL || 'ws://localhost:8000',
    },
  },
};
