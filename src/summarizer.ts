import { FeedItem } from './feed.js';

function extractFirstSentence(text: string): string {
  // 文末の記号で分割
  const sentences = text.split(/[.!?。！？]/);
  // 最初の文を取得（空文字でない場合）
  const firstSentence = sentences[0].trim();
  return firstSentence || text;
}

export async function summarizeArticle(item: FeedItem): Promise<FeedItem> {
  // 記事の内容を取得（contentまたはdescriptionから）
  const content = item.content || item.description || '';
  
  // 最初の文を抽出
  const summary = extractFirstSentence(content);
  
  // 要約をdescriptionに設定
  return {
    ...item,
    description: summary
  };
}

export async function processArticles(items: FeedItem[]): Promise<Array<FeedItem & { summary: string }>> {
  const processedItems = await Promise.all(
    items.map(async (item) => {
      const summarizedItem = await summarizeArticle(item);
      return {
        ...item,
        summary: summarizedItem.description || ''
      };
    })
  );

  return processedItems;
} 