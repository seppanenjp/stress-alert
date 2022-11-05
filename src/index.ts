import { App } from '@slack/bolt';
import { subMinutes } from 'date-fns';
import axios from 'axios';
import { config } from 'dotenv';

config();

const app = new App({
  signingSecret: process.env.SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

app
  .start(process.env.PORT || 3000)
  .then(() => {
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
      );
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
