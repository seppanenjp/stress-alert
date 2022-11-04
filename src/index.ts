import { App } from '@slack/bolt';
import { config } from 'dotenv';

config();

const app = new App({
  appToken: process.env.SLACK_APP_TOKEN,
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
});

app
  .start()
  .then(() => {
    app.client.conversations
      .list({
        token: process.env.SLACK_BOT_TOKEN,
      })
      .then(async ({ channels }) => {
        await Promise.all(
          channels.map(async (channel) =>
            app.client.conversations
              .history({
                channel: channel.id,
                token: process.env.SLACK_BOT_TOKEN,
              })
              .then(({ messages }) => {
                const channelMessages = messages
                  .filter(
                    (message) => message.type === 'message' && !message.subtype
                  )
                  .map((message) => message.text);
                console.log(channelMessages);
              })
              .catch(() => {
                // Tough luck no permissions to this channel
              })
          )
        );
      });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
