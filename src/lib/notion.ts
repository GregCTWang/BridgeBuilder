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
  content: string;  // 用於 Name 欄位
  date: string;     // 用於 Date 欄位
}

export const syncToNotion = async (entry: JournalEntry) => {
  try {
    const response = await notion.pages.create({
      parent: { 
        database_id: import.meta.env.VITE_NOTION_DATABASE_ID as string 
      },
      properties: {
        // Name 作為 Content
        Name: {
          title: [
            {
              text: {
                content: entry.content // 使用 content 而不是 title
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
    
    console.log('Successfully synced to Notion, response:', response);
    return response;
  } catch (error: any) {
    // 改進錯誤處理，捕獲網路錯誤
    if (error.code === 'ECONNREFUSED' || error.name === 'FetchError') {
      console.error('Network error:', error);
      throw new Error('Failed to connect to Notion API');
    }
    console.error('Failed to sync with Notion:', error?.body || error);
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