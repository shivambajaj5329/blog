// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// Environment detection
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

// Database configuration based on environment
const getDatabaseConfig = () => {
  // 🐛 DEBUG: Let's see what's happening
  console.log('🔍 Environment Debug:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('VERCEL_ENV:', process.env.VERCEL_ENV);
  console.log('isProduction:', isProduction);
  console.log('DEV_URL:', process.env.NEXT_PUBLIC_SUPABASE_DEV_URL);
  console.log('DEV_KEY:', process.env.NEXT_PUBLIC_SUPABASE_DEV_ANON_KEY ? 'SET' : 'NOT SET');
  console.log('PROD_URL:', process.env.NEXT_PUBLIC_SUPABASE_PROD_URL);
  console.log('PROD_KEY:', process.env.NEXT_PUBLIC_SUPABASE_PROD_ANON_KEY ? 'SET' : 'NOT SET');

  if (isProduction) {
    // Production database (blogdb_prod)
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_PROD_URL!,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_PROD_ANON_KEY!
    };
  } else {
    // Development database (blogdb)
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_DEV_URL!,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_DEV_ANON_KEY!
    };
  }
};

// Create Supabase client with environment-specific config
const config = getDatabaseConfig();
export const blogSupabase = createClient(config.url, config.anonKey);

// Create clients for specific environments (for admin panel)
export const createDevClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_DEV_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_DEV_ANON_KEY!
  );
};

export const createProdClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_PROD_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PROD_ANON_KEY!
  );
};

// Helper function for admin panel
export const getClientByEnv = (env: "dev" | "prod") => {
  return env === "prod" ? createProdClient() : createDevClient();
};

// Optional: Export a function to get the current environment info
export const getCurrentEnvironment = () => ({
  isProduction,
  database: isProduction ? 'blogdb_prod' : 'blogdb',
  url: config.url
});

// Log current environment (optional, for debugging)
if (typeof window !== 'undefined') {
  console.log(`🗄️ Database: ${isProduction ? 'blogdb_prod (production)' : 'blogdb (development)'}`);
}