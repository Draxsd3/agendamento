const app = require('./app');
const env = require('./config/env');

const server = app.listen(env.port, () => {
  console.info(`[SERVER] Running on port ${env.port} (${env.nodeEnv})`);
});

server.requestTimeout = env.http.requestTimeoutMs;
server.headersTimeout = Math.max(env.http.requestTimeoutMs + 5000, 60000);
server.keepAliveTimeout = 65000;
