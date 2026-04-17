const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  console.info(`[SERVER] Running on port ${env.port} (${env.nodeEnv})`);
});
