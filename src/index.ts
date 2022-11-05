import { App, ExpressReceiver } from '@slack/bolt';
import { subMinutes } from 'date-fns';
import axios from 'axios';
import { config } from 'dotenv';

config();

const receiver = new ExpressReceiver({
  signingSecret: process.env.SIGNING_SECRET,
});

const app = new App({
  receiver,
  token: process.env.SLACK_BOT_TOKEN,
});

receiver.router.get('/analyze', (req, res) => {
  app.client.conversations.list().then(async ({ channels }) => {
    await Promise.all(
      channels?.map(async ({ id }) =>
        app.client.conversations
          .history({
            channel: id!,
            oldest: (subMinutes(new Date(), 5).getTime() / 1000).toString(),
          })
          .then(async ({ messages }) => {
            const channelMessages = messages!
              .filter(
                (message) => message.type === 'message' && !message.subtype
              )
              .map((message) =>
                message.text
                  ?.split('.')
                  .map((subMessage) => subMessage.trim())
                  .filter((m) => Boolean(m))
              )
              .flat();
            const { data } = await axios.post(
              process.env.STRESS_API_URL + '/analyze',
              { messageList: channelMessages },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );
            // TODO: work with stress data
          })
          .catch((e) => {
            // Tough luck no permissions to this channel
          })
      ) || []
    )
      .then(() => res.send('Messages analyzed'))
      .catch((e) => res.status(500).send(e.message));
  });
});

(async () => {
  app.start(process.env.PORT || 3000).catch((error) => {
    console.error(error);
    process.exit(1);
  });
  console.log('⚡️ Bolt app started');
})();
/*
 */
