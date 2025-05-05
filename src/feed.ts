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

async function fetchFeedWithRetry(url: string, retries = 3): Promise<FeedItem[]> {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Fetching feed ${url} (attempt ${i + 1}/${retries})...`);
      
      // フィードの取得を試みる
      const feed = await parser.parseURL(url);
      
      if (!feed.items || feed.items.length === 0) {
        console.warn(`No items found in feed ${url}`);
        return [];
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
      return items;
    } catch (error) {
      console.error(`Error fetching feed ${url} (attempt ${i + 1}/${retries}):`, error);
      
      // 最後の試行でない場合は再試行
      if (i < retries - 1) {
        const delay = 1000 * Math.pow(2, i); // 指数バックオフ
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // 最後の試行で失敗した場合
      console.error(`Failed to fetch feed ${url} after ${retries} attempts`);
      
      // eyeondesign.aiga.orgの場合、代替のフィードURLを試す
      if (url === 'https://eyeondesign.aiga.org/feed/') {
        const alternativeUrl = 'https://eyeondesign.aiga.org/feed/rss/';
        console.log(`Trying alternative feed URL: ${alternativeUrl}`);
        try {
          const alternativeFeed = await parser.parseURL(alternativeUrl);
          if (alternativeFeed.items && alternativeFeed.items.length > 0) {
            console.log(`Successfully fetched alternative feed with ${alternativeFeed.items.length} items`);
            return alternativeFeed.items.map(item => ({
              title: item.title || '',
              link: item.link || '',
              pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
              content: item.content || item['content:encoded'] || item.description || '',
              description: item.description
            }));
          }
        } catch (altError) {
          console.error(`Failed to fetch alternative feed: ${altError}`);
        }
      }
      
      return [];
    }
  }
  return [];
}

export async function fetchFeeds(feedUrls: string[]): Promise<FeedItem[]> {
  const allItems: FeedItem[] = [];

  for (const url of feedUrls) {
    const items = await fetchFeedWithRetry(url);
    allItems.push(...items);
  }

  return allItems;
} 