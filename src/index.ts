import { initRoutes } from './routes/index';
import { Database } from './database/index';
import { App, ExpressReceiver } from '@slack/bolt';
import { config } from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  config();
}

export const receiver = new ExpressReceiver({
  signingSecret: process.env.SIGNING_SECRET,
});

export const app = new App({
  receiver,
  token: process.env.SLACK_BOT_TOKEN,
});

(async () => {
  app
    .start(process.env.PORT || 3000)
    .then(() => new Database().connect())
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  console.log('⚡️ Bolt app started');
  initRoutes();
})();
/*
 */
