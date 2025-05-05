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
      ['atom:link', 'atomLink'],
      ['media:content', 'mediaContent']
    ]
  },
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; DesignNewsBot/1.0)',
    'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
  },
  requestOptions: {
    agent: new https.Agent({
      rejectUnauthorized: false
    }),
    timeout: 10000
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

      const items = feed.items.map(item => {
        // リンクの取得を改善
        const link = item.link || 
                    (item.atomLink && typeof item.atomLink === 'string' ? item.atomLink : '') ||
                    (item.atomLink && typeof item.atomLink === 'object' && item.atomLink.href ? item.atomLink.href : '') ||
                    '';

        // 日付の取得を改善
        const pubDate = item.pubDate || 
                       item.isoDate || 
                       new Date().toISOString();

        // コンテンツの取得を改善
        const content = item.content || 
                       item['content:encoded'] || 
                       item.description ||
                       '';

        return {
          title: item.title || '',
          link,
          pubDate,
          content,
          description: item.description
        };
      });

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