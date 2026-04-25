/// <reference types="vite/client" />

declare module '*.csv?raw' {
  const content: string;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_PRIVY_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
