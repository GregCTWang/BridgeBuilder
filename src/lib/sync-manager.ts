import { syncToNotion } from './notion';
import { storage } from './storage';
import type { JournalEntry } from '../types/journal';

export class SyncManager {
  private syncQueue: JournalEntry[] = [];
  private isSyncing = false;
  
  // 將條目加入同步佇列
  async queueForSync(entry: JournalEntry) {
    this.syncQueue.push(entry);
    if (!this.isSyncing) {
      await this.processSyncQueue();
    }
  }

  // 從 Notion 獲取更新
  async pullFromNotion() {
    try {
      const response = await notion.databases.query({
        database_id: process.env.VITE_NOTION_DATABASE_ID!,
        sorts: [
          {
            property: 'Date',
            direction: 'descending'
          }
        ]
      });

      for (const page of response.results) {
        const localId = page.properties.LocalId?.rich_text[0]?.plain_text;
        if (localId) {
          const localEntry = await storage.getItem<JournalEntry>(`entry-${localId}`);
          if (localEntry && new Date(page.last_edited_time) > new Date(localEntry.lastSyncedAt || 0)) {
            // Notion 版本較新，更新本地版本
            const updatedEntry: JournalEntry = {
              ...localEntry,
              title: page.properties.Title.title[0]?.plain_text || '',
              content: page.properties.Content.rich_text[0]?.plain_text || '',
              date: page.properties.Date.date?.start || '',
              lastSyncedAt: page.last_edited_time,
              notionId: page.id
            };
            await storage.setItem(`entry-${localId}`, updatedEntry);
          }
        }
      }
    } catch (error) {
      console.error('Failed to pull from Notion:', error);
    }
  }

  private async processSyncQueue() {
    this.isSyncing = true;
    
    while (this.syncQueue.length > 0) {
      const entry = this.syncQueue[0];
      try {
        const notionPage = await syncToNotion(entry);
        
        // 更新本地條目的同步狀態
        const updatedEntry: JournalEntry = {
          ...entry,
          synced: true,
          notionId: notionPage.id,
          lastSyncedAt: new Date().toISOString()
        };
        await storage.setItem(`entry-${entry.id}`, updatedEntry);
        
        this.syncQueue.shift();
      } catch (error) {
        console.error('Sync failed:', error);
        // 如果是網路錯誤，我們稍後會重試
        if (error.code === 'network_error') {
          break;
        }
        // 其他錯誤則移除該條目
        this.syncQueue.shift();
      }
    }
    
    this.isSyncing = false;
  }
} 