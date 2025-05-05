import Parser from 'rss-parser';
import https from 'https';
import { config } from 'dotenv';

config();

const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'content'],
      ['description', 'description'],
      ['dc:creator', 'author'],
      ['dc:date', 'pubDate'],
    ],
  },
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; DesignNewsBot/1.0)',
    'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml',
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
      
      if (!feed.items || feed.items.length === 0) {
        console.warn(`No items found in feed ${url}`);
        continue;
      }

      const items = feed.items.map(item => ({
        title: item.title || '',
        link: item.link || '',
        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
        content: item.content || item['content:encoded'] || item.description,
        description: item.description
      }));

      console.log(`Found ${items.length} items in feed ${url}`);
      allItems.push(...items);
    } catch (error) {
      console.error(`Error fetching feed ${url}:`, error);
      // エラーが発生しても他のフィードの処理は続行
      continue;
    }
  }

  return allItems;
} 