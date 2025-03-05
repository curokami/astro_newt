/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly NEWT_SPACE_UID: string;
  readonly NEWT_API_TOKEN: string;
  readonly NEWT_APP_UID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}