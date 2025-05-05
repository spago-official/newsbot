import { promises as fs } from 'fs';
import path from 'path';
import { FeedItem } from './feed.js';

const HISTORY_FILE = 'news_history.json';

interface NewsHistory {
  items: Array<{
    link: string;
    pubDate: string;
  }>;
}

export class NewsHistoryManager {
  private history: NewsHistory;
  private historyPath: string;

  constructor() {
    this.history = { items: [] };
    this.historyPath = path.join(process.cwd(), HISTORY_FILE);
  }

  async load(): Promise<void> {
    try {
      const data = await fs.readFile(this.historyPath, 'utf-8');
      this.history = JSON.parse(data);
    } catch (error) {
      // ファイルが存在しない場合は新規作成
      this.history = { items: [] };
      await this.save();
    }
  }

  private async save(): Promise<void> {
    await fs.writeFile(this.historyPath, JSON.stringify(this.history, null, 2));
  }

  isAlreadySent(item: FeedItem): boolean {
    return this.history.items.some(
      historyItem => historyItem.link === item.link
    );
  }

  async addToHistory(items: FeedItem[]): Promise<void> {
    const newItems = items.map(item => ({
      link: item.link,
      pubDate: item.pubDate
    }));

    // 新しいアイテムを追加
    this.history.items.push(...newItems);

    // 古いアイテムを削除（30日以上前のもの）
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    this.history.items = this.history.items.filter(item => {
      const itemDate = new Date(item.pubDate);
      return itemDate >= thirtyDaysAgo;
    });

    await this.save();
  }
} 