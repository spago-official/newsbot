import { config } from 'dotenv';
import { fetchFeeds } from './feed.js';
import { sendToLine } from './line.js';
import { summarizeArticle } from './summarizer.js';
import { NewsHistoryManager } from './history.js';

config();

async function main() {
  try {
    console.log('Loading news history...');
    const historyManager = new NewsHistoryManager();
    await historyManager.load();

    console.log('Fetching feeds...');
    const feeds = process.env.FEEDS?.split(',') || [];
    const limit = parseInt(process.env.LIMIT || '8', 10);
    const items = await fetchFeeds(feeds);

    // 日付でソート（新しい順）
    const sortedItems = items
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, limit);

    const newItems = sortedItems.filter(item => !historyManager.isAlreadySent(item));

    if (newItems.length === 0) {
      console.log('No new articles to send.');
      return;
    }

    console.log(`Found ${newItems.length} new articles.`);

    for (const item of newItems) {
      try {
        const summary = await summarizeArticle(item);
        await sendToLine(summary);
        console.log(`Sent article: ${item.title}`);
      } catch (error) {
        console.error(`Error processing article ${item.title}:`, error);
      }
    }

    await historyManager.addToHistory(newItems);
    console.log('Updated news history.');

  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  }
}

main(); 