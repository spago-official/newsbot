import { Client } from '@line/bot-sdk';
import { config } from 'dotenv';
import { FeedItem } from './feed.js';

config();

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || ''
});

export async function sendNews(items: Array<FeedItem & { summary: string }>): Promise<void> {
  const userId = process.env.LINE_USER_ID;
  if (!userId) {
    throw new Error('LINE_USER_ID is not set');
  }

  const messages = items.map(item => ({
    type: 'flex',
    altText: item.title,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: item.title,
            weight: 'bold',
            size: 'md',
            wrap: true
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: item.summary,
            wrap: true,
            size: 'sm'
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            style: 'link',
            action: {
              type: 'uri',
              label: '記事を読む',
              uri: item.link
            }
          }
        ]
      }
    }
  }));

  // メッセージを分割して送信（LINEの制限に対応）
  const chunkSize = 5;
  for (let i = 0; i < messages.length; i += chunkSize) {
    const chunk = messages.slice(i, i + chunkSize);
    await client.pushMessage(userId, chunk);
  }
} 