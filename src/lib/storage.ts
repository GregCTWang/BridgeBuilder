import localforage from 'localforage';

export const storage = localforage.createInstance({
  name: 'journal-app'
});

export const saveEntry = async (entry: JournalEntry) => {
  await storage.setItem(`entry-${entry.id}`, entry);
  await syncToNotion(entry);  // 背景同步到 Notion
}; 