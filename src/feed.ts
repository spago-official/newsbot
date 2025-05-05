import Parser from 'rss-parser';
import https from 'https';
import { config } from 'dotenv';

config();

const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'content'],
      ['description', 'description'],
    ],
  },
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; DesignNewsBot/1.0)',
  },
  requestOptions: {
    agent: new https.Agent({
      rejectUnauthorized: false
    })
  }
});

export interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  content?: string;
  description?: string;
}

export async function fetchFeeds(feedUrls: string[]): Promise<FeedItem[]> {
  const allItems: FeedItem[] = [];

  for (const url of feedUrls) {
    try {
      console.log(`Fetching feed ${url}...`);
      const feed = await parser.parseURL(url);
      const items = feed.items.map(item => ({
        title: item.title || '',
        link: item.link || '',
        pubDate: item.pubDate || new Date().toISOString(),
        content: item.content,
        description: item.description
      }));
      allItems.push(...items);
    } catch (error) {
      console.error(`Error fetching feed ${url}:`, error);
    }
  }

  return allItems;
} 