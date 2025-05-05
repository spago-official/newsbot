import { FeedItem } from './feed.js';

function extractFirstNSentences(text: string, n: number): string {
  return text
    .replace(/<[^>]*>/g, '') // HTMLタグを除去
    .split(/[.!?。．！？]/) // 文で分割
    .slice(0, n) // 最初のn文を取得
    .join('. ') // 文を結合
    .trim();
}

export async function summarizeArticle(item: FeedItem): Promise<string> {
  if (item.isEnglish) {
    // 英語記事は最初の3文を抽出
    return extractFirstNSentences(item.content, 3) || item.title;
  } else {
    // 日本語記事は先頭1文を抽出
    return extractFirstNSentences(item.content, 1) || item.title;
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