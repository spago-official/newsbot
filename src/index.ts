import { fetchFeeds } from './feed.js';
import { processArticles } from './summarizer.js';
import { sendNews } from './line.js';
import { NewsHistoryManager } from './history.js';

async function main() {
  try {
    console.log('Loading news history...');
    const historyManager = new NewsHistoryManager();
    await historyManager.load();

    console.log('Fetching feeds...');
    const items = await fetchFeeds();
    
    // 未送信の記事のみをフィルタリング
    const newItems = items.filter(item => !historyManager.isAlreadySent(item));
    
    if (newItems.length === 0) {
      console.log('No new articles to send.');
      return;
    }

    console.log(`Found ${newItems.length} new articles.`);
    console.log('Processing articles...');
    const processedItems = await processArticles(newItems);
    
    console.log('Sending news to LINE...');
    await sendNews(processedItems);
    
    // 送信した記事を履歴に追加
    await historyManager.addToHistory(newItems);
    
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 