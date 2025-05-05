import Parser from 'rss-parser';
import { config } from 'dotenv';

config();

const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'content'],
      ['description', 'description'],
    ],
  },
});

export interface FeedItem {
  title: string;
  link: string;
  content: string;
  description: string;
  pubDate: string;
  isEnglish: boolean;
}

export async function fetchFeeds(): Promise<FeedItem[]> {
  const feeds = process.env.FEEDS?.split(',') || [];
  const limit = parseInt(process.env.LIMIT || '8', 10);
  
  const allItems: FeedItem[] = [];

  for (const feedUrl of feeds) {
    try {
      const feed = await parser.parseURL(feedUrl);
      const items = feed.items.slice(0, limit).map(item => ({
        title: item.title || '',
        link: item.link || '',
        content: item.content || item.description || '',
        description: item.description || '',
        pubDate: item.pubDate || new Date().toISOString(),
        isEnglish: !feedUrl.includes('japandesign') && 
                  !feedUrl.includes('cinra') && 
                  !feedUrl.includes('itmedia')
      }));
      allItems.push(...items);
    } catch (error) {
      console.error(`Error fetching feed ${feedUrl}:`, error);
    }
  }

  // 日付でソート（新しい順）
  return allItems.sort((a, b) => 
    new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  ).slice(0, limit);
} 