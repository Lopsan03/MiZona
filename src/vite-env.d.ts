/// <reference types="vite/client" />

declare module '*.csv?raw' {
  const content: string;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_PRIVY_APP_ID: string;
  readonly VITE_INCIDENT_REGISTRY_ADDRESS?: `0x${string}`;
  readonly VITE_BACKEND_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
