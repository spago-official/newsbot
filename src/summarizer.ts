import { summarize } from 'node-summary';
import { FeedItem } from './feed.js';

export async function summarizeArticle(item: FeedItem): Promise<string> {
  if (item.isEnglish) {
    // 英語記事はTextRankで要約
    return new Promise((resolve, reject) => {
      summarize(item.content, (err: Error | null, summary: string) => {
        if (err) {
          console.error('Error summarizing English article:', err);
          resolve(item.title); // エラー時はタイトルのみ返す
        } else {
          resolve(summary);
        }
      });
    });
  } else {
    // 日本語記事は先頭1文を抽出
    const firstSentence = item.content
      .replace(/<[^>]*>/g, '') // HTMLタグを除去
      .split(/[。．！？]/)[0] // 最初の文を取得
      .trim();
    
    return firstSentence || item.title;
  }
}

export async function processArticles(items: FeedItem[]): Promise<Array<FeedItem & { summary: string }>> {
  const processedItems = await Promise.all(
    items.map(async (item) => ({
      ...item,
      summary: await summarizeArticle(item)
    }))
  );

  return processedItems;
} 