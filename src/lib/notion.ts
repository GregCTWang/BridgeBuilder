import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.VITE_NOTION_API_KEY,
});

export const syncToNotion = async (entry: JournalEntry) => {
  try {
    await notion.pages.create({
      parent: { database_id: process.env.VITE_NOTION_DATABASE_ID },
      properties: {
        Title: {
          title: [{ text: { content: entry.title } }]
        },
        Content: {
          rich_text: [{ text: { content: entry.content } }]
        },
        Date: {
          date: { start: entry.date }
        }
      }
    });
  } catch (error) {
    console.error('Failed to sync with Notion:', error);
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