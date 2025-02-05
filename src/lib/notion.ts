import { Client } from '@notionhq/client';

// 在檔案開頭加入環境變數檢查
const requiredEnvVars = {
  NOTION_TOKEN: import.meta.env.VITE_NOTION_TOKEN,
  DATABASE_ID: import.meta.env.VITE_NOTION_DATABASE_ID
};

Object.entries(requiredEnvVars).forEach(([name, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
});

// 使用 VITE_ 前綴，因為您的專案使用的是 Vite
export const notion = new Client({
  auth: import.meta.env.VITE_NOTION_TOKEN
});

// 更新 JournalEntry 介面
export interface JournalEntry {
  title: string;
  content: string;
  date: string;
}

export const syncToNotion = async (entry: JournalEntry) => {
  try {
    await notion.pages.create({
      parent: { 
        database_id: import.meta.env.VITE_NOTION_DATABASE_ID as string 
      },
      properties: {
        // 確保這些屬性名稱與您的 Notion 資料庫中的完全相符
        Name: {
          title: [
            {
              text: {
                content: entry.title
              }
            }
          ]
        },
        Content: {
          rich_text: [
            {
              text: {
                content: entry.content
              }
            }
          ]
        },
        Date: {
          date: {
            start: entry.date
          }
        }
      }
    });
    console.log('Successfully synced to Notion');
  } catch (error) {
    console.error('Failed to sync with Notion:', error);
    // 拋出錯誤以便上層處理
    throw error;
  }
};

export async function initNotionDatabase() {
  try {
    const response = await notion.databases.create({
      parent: {
        type: "page_id",
        page_id: process.env.VITE_NOTION_PAGE_ID!
      },
      title: [
        {
          type: "text",
          text: { content: "Journal Entries" }
        }
      ],
      properties: {
        Title: {
          title: {}
        },
        Content: {
          rich_text: {}
        },
        Date: {
          date: {}
        },
        LocalId: {
          rich_text: {}
        }
      }
    });
    
    return response.id;
  } catch (error) {
    console.error('Failed to create Notion database:', error);
    throw error;
  }
}

export async function validateDatabaseConnection() {
  try {
    const database = await notion.databases.retrieve({
      database_id: import.meta.env.VITE_NOTION_DATABASE_ID as string
    });
    console.log('Database schema:', database.properties);
    return true;
  } catch (error) {
    console.error('Failed to connect to Notion database:', error);
    return false;
  }
} 