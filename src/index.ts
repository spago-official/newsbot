import { fetchFeeds } from './feed.js';
import { processArticles } from './summarizer.js';
import { sendNews } from './line.js';

async function main() {
  try {
    console.log('Fetching feeds...');
    const items = await fetchFeeds();
    
    console.log('Processing articles...');
    const processedItems = await processArticles(items);
    
    console.log('Sending news to LINE...');
    await sendNews(processedItems);
    
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 