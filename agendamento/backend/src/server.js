const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  console.log(`[SERVER] Running on port ${env.port} (${env.nodeEnv})`);
});
