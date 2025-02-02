export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  synced?: boolean;
  notionId?: string;
  lastSyncedAt?: string;
} 