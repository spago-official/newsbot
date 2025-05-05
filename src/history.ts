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
    // リポジトリのルートディレクトリに保存
    this.historyPath = path.join(process.cwd(), HISTORY_FILE);
  }

  async load(): Promise<void> {
    try {
      const data = await fs.readFile(this.historyPath, 'utf-8');
      this.history = JSON.parse(data);
      console.log('履歴ファイルを読み込みました:', this.historyPath);
    } catch (error) {
      console.log('履歴ファイルが存在しないため、新規作成します:', this.historyPath);
      // ファイルが存在しない場合は新規作成
      this.history = { items: [] };
      await this.save();
    }
  }

  private async save(): Promise<void> {
    try {
      await fs.writeFile(this.historyPath, JSON.stringify(this.history, null, 2));
      console.log('履歴ファイルを保存しました:', this.historyPath);
    } catch (error) {
      console.error('履歴ファイルの保存に失敗しました:', error);
      throw error;
    }
  }

  isAlreadySent(item: FeedItem): boolean {
    const isSent = this.history.items.some(
      historyItem => historyItem.link === item.link
    );
    console.log(`記事の重複チェック: ${item.link} - ${isSent ? '既に送信済み' : '未送信'}`);
    return isSent;
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