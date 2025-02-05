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
    // 首先檢查資料庫結構
    const database = await notion.databases.retrieve({
      database_id: import.meta.env.VITE_NOTION_DATABASE_ID as string
    });
    
    // 輸出資料庫結構以進行調試
    console.log('Database structure:', {
      properties: database.properties,
      parent: database.parent,
      title: database.title
    });

    // 根據資料庫結構建立頁面
    const response = await notion.pages.create({
      parent: { 
        database_id: import.meta.env.VITE_NOTION_DATABASE_ID as string 
      },
      properties: {
        // 使用資料庫中的主要屬性（通常是 title 類型）作為內容
        [database.title[0]?.plain_text || 'Name']: {
          title: [
            {
              text: {
                content: entry.content
              }
            }
          ]
        },
        // 日期屬性
        Date: {
          date: {
            start: entry.date
          }
        }
      }
    });
    
    console.log('Sync success:', response);
    return response;
  } catch (error: any) {
    console.error('Sync error details:', {
      error,
      message: error.message,
      status: error.status,
      code: error.code,
      body: error.body,
      stack: error.stack
    });
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

export async function verifyNotionAccess() {
  try {
    // 檢查 token 是否有效
    const user = await notion.users.me();
    console.log('Notion user:', user);

    // 檢查資料庫訪問權限
    const database = await notion.databases.retrieve({
      database_id: import.meta.env.VITE_NOTION_DATABASE_ID as string
    });
    console.log('Database access verified:', {
      id: database.id,
      title: database.title,
      properties: Object.keys(database.properties)
    });

    return true;
  } catch (error: any) {
    console.error('Notion access verification failed:', {
      error,
      message: error.message,
      code: error.code
    });
    return false;
  }
} 