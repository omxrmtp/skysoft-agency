/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SUPABASE_SERVICE_ROLE_KEY?: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_URL?: string;
  readonly VITE_ENABLE_ANALYTICS?: string;
  readonly VITE_ENABLE_SENTRY?: string;
  readonly VITE_MAX_FILE_SIZE?: string;
  readonly VITE_ALLOWED_FILE_TYPES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
