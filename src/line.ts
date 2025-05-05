import { Client, TextMessage } from '@line/bot-sdk';
import { FeedItem } from './feed.js';

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || ''
});

export async function sendToLine(item: FeedItem): Promise<void> {
  const userId = process.env.LINE_USER_ID;
  if (!userId) {
    throw new Error('LINE_USER_ID is not set');
  }

  const message: TextMessage = {
    type: 'text',
    text: `${item.title}\n\n${item.description || ''}\n\n${item.link}`
  };

  await client.pushMessage(userId, message);
} 