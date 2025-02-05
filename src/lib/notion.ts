import { Client } from '@notionhq/client';

// 在檔案開頭加入環境變數檢查
const requiredEnvVars = {
  NOTION_TOKEN: import.meta.env.VITE_NOTION_TOKEN,
  DATABASE_ID: import.meta.env.VITE_NOTION_DATABASE_ID
};

// 修正參數名稱
Object.entries(requiredEnvVars).forEach(([name, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
});

// 使用 VITE_ 前綴，因為您的專案使用的是 Vite
export const notion = new Client({
  auth: import.meta.env.VITE_NOTION_TOKEN,
  notionVersion: '2022-06-28',
  fetch: fetch // 明確指定使用全局 fetch
});

// 更新 JournalEntry 介面
export interface JournalEntry {
  content: string;  // 用於 Content 欄位
  date: string;     // 用於 Date 欄位
}

export const syncToNotion = async (entry: JournalEntry) => {
  try {
    // 首先驗證連接
    const isValid = await validateDatabaseConnection();
    if (!isValid) {
      throw new Error('Database connection failed');
    }

    // 使用與 curl 測試完全相同的結構
    const newPage = await notion.pages.create({
      parent: {
        database_id: import.meta.env.VITE_NOTION_DATABASE_ID
      },
      properties: {
        Content: {
          title: [
            {
              type: "text",
              text: {
                content: entry.content
              }
            }
          ]
        },
        Date: {
          type: "date",
          date: {
            start: entry.date,
            time_zone: null
          }
        }
      }
    });

    console.log('Page created:', {
      url: newPage.url,
      id: newPage.id,
      properties: newPage.properties
    });
    return newPage;
  } catch (error: any) {
    // 更詳細的錯誤處理
    if (error.name === 'FetchError' || error.message === 'Failed to fetch') {
      console.error('Network error:', {
        error,
        env: {
          hasToken: !!import.meta.env.VITE_NOTION_TOKEN,
          hasDbId: !!import.meta.env.VITE_NOTION_DATABASE_ID,
          isDev: import.meta.env.DEV,
          isProd: import.meta.env.PROD
        }
      });
      throw new Error('Network connection failed. Please check your internet connection.');
    }

    console.error('Notion API error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      status: error.status,
      body: error.body,
      request: {
        databaseId: import.meta.env.VITE_NOTION_DATABASE_ID?.substring(0, 5) + '...',
        content: entry.content.substring(0, 20) + '...',
        date: entry.date
      }
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