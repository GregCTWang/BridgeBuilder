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
  notionVersion: '2022-06-28'
});

// 更新 JournalEntry 介面
export interface JournalEntry {
  content: string;  // 用於 Content 欄位
  date: string;     // 用於 Date 欄位
}

export const syncToNotion = async (entry: JournalEntry) => {
  try {
    // 簡化結構，參考官方範例
    const newPage = await notion.pages.create({
      parent: {
        database_id: import.meta.env.VITE_NOTION_DATABASE_ID as string
      },
      properties: {
        // 確保屬性名稱完全匹配資料庫中的欄位名稱
        Content: {
          title: [
            {
              type: "text",  // 添加 type 屬性
              text: {
                content: entry.content
              }
            }
          ]
        },
        Date: {
          type: "date",  // 添加 type 屬性
          date: {
            start: entry.date,
            time_zone: null  // 明確設置時區
          }
        }
      }
    });

    console.log('Page created:', newPage.url);  // 記錄新頁面的 URL
    return newPage;
  } catch (error: any) {
    console.error('Failed to create page:', {
      error,
      message: error.message,
      code: error.code,
      requestDetails: {
        databaseId: import.meta.env.VITE_NOTION_DATABASE_ID,
        properties: {
          content: entry.content,
          date: entry.date
        }
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