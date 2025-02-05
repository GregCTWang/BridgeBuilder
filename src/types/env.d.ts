/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NOTION_TOKEN: string;
  readonly VITE_NOTION_DATABASE_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 