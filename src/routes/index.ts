import { app, receiver } from '..';
import { StressValueData } from '../database/models/stress-value-data';
import { subMinutes } from 'date-fns';
import axios from 'axios';

export const initRoutes = () => {
  receiver.router.get('/analyze', (req, res) => {
    app.client.conversations.list().then(async ({ channels }) => {
      const timestamp = new Date();
      await Promise.all(
        channels?.map(async ({ id, name }) =>
          app.client.conversations
            .history({
              channel: id!,
              // 5min interval only for demo purposes
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

              // Send messages only if batch has enough data
              if (
                channelMessages.length >
                Number(process.env.MIN_MESSAGES_PER_BATCH ?? 5)
              ) {
                const { data } = await axios.post(
                  process.env.STRESS_API_URL + '/analyze',
                  { messageList: channelMessages },
                  {
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  }
                );
                new StressValueData({
                  channelId: id,
                  channelName: name,
                  stressValues: data.stressValues,
                  timestamp,
                }).save();
              }
            })
            .catch(() => {
              // Tough luck no permissions to this channel
            })
        ) || []
      )
        .then(() => res.send('Messages analyzed'))
        .catch((e) => res.status(500).send(e.message));
    });
  });

  receiver.router.get('/stress-values', async (req, res) => {
    StressValueData.find((err, docs) =>
      err
        ? res
            .status(500)
            .send('Jolly good but something shady happened here...')
        : res.send(
            docs.map(({ channelName, channelId, stressValues, timestamp }) => ({
              channelName,
              channelId,
              stressValues,
              timestamp,
            }))
          )
    );
  });
};
