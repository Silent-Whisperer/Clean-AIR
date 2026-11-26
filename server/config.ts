import dotenv from 'dotenv';
dotenv.config();

/**
 * Validated server configuration
 */
export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openrouterApiKey: process.env.OPENROUTER_API_KEY || '',
  openrouterModel: process.env.OPENROUTER_MODEL || 'google/gemma-4-31b-it:free',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  aiTimeoutMs: parseInt(process.env.AI_TIMEOUT_MS || '25000', 10),
  allowedOrigins: (
    process.env.ALLOWED_ORIGINS ||
    'http://localhost:5173,http://localhost:3001,http://127.0.0.1:5173,http://127.0.0.1:3001'
  )
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  isProduction: process.env.NODE_ENV === 'production',
};

/**
 * Validates critical environment configuration at startup
 * @throws Error if PORT is invalid
 */
export function validateConfig(): void {
  if (config.port <= 0 || isNaN(config.port)) {
    throw new Error('Invalid PORT specified in environment variables.');
  }
}
